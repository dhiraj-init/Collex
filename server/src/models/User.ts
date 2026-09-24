import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'STUDENT' | 'MODERATOR' | 'COLLEGE_ADMIN' | 'SUPER_ADMIN';

export type VerificationStatus = 'UNVERIFIED' | 'EMAIL_VERIFIED' | 'STUDENT_VERIFIED';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  college: string;
  collegeDomain: string;
  branch: string;
  graduationYear: string;
  avatar: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  trustScore: number;
  refreshToken?: string;
  savedListings?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [80, 'Full name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'College email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Never return password hash in queries by default
    },
    college: {
      type: String,
      required: [true, 'University/College affiliation is required'],
      trim: true,
      index: true,
    },
    collegeDomain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    branch: {
      type: String,
      required: [true, 'Academic branch/department is required'],
      trim: true,
    },
    graduationYear: {
      type: String,
      required: [true, 'Graduation year is required'],
      trim: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    },
    role: {
      type: String,
      enum: ['STUDENT', 'MODERATOR', 'COLLEGE_ADMIN', 'SUPER_ADMIN'],
      default: 'STUDENT',
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'EMAIL_VERIFIED', 'STUDENT_VERIFIED'],
      default: 'EMAIL_VERIFIED', // Default in dev; requires student ID audit for STUDENT_VERIFIED
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    trustScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    savedListings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
