import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { User } from '../models/User';

const TEST_DB_URI = 'mongodb://localhost:27017/collex_test_auth';

describe('Authentication Flow Tests', () => {
  before(async () => {
    // Connect to test database
    await mongoose.connect(TEST_DB_URI);
    // Clear users collection before tests
    await User.deleteMany({});
  });

  after(async () => {
    // Drop test database and close connection
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
  });

  let token: string;

  it('should successfully register a new student', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test Student',
        email: 'test@student.wce.ac.in',
        password: 'Password123!',
        college: 'Walchand College of Engineering',
        branch: 'Computer Science',
        graduationYear: 2026,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.user);
    assert.strictEqual(res.body.data.user.email, 'test@student.wce.ac.in');
  });

  it('should prevent registration with a duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Test Student Clone',
        email: 'test@student.wce.ac.in',
        password: 'Password123!',
        college: 'Walchand College of Engineering',
        branch: 'IT',
        graduationYear: 2026,
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /already registered|duplicate/i);
  });

  it('should successfully login and return a token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@student.wce.ac.in',
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    token = res.body.data.token;
  });

  it('should fetch the current authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, 'test@student.wce.ac.in');
  });
});
