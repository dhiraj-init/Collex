import mongoose from 'mongoose';
import dns from 'dns';
import { config } from './env';
import { logger } from '../utils/logger';

// Ensure reliable SRV resolution on Windows/custom ISP networks
if (config.mongoUri.startsWith('mongodb+srv')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Fallback to system default if restricted
  }
}

export interface DbStatus {
  isConnected: boolean;
  stateCode: number;
  stateName: string;
}

const DB_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Returns current database connection state
 */
export function getDbStatus(): DbStatus {
  const stateCode = mongoose.connection.readyState;
  return {
    isConnected: stateCode === 1,
    stateCode,
    stateName: DB_STATES[stateCode] || 'unknown',
  };
}

/**
 * Initializes MongoDB connection via Mongoose
 */
export async function connectDB(): Promise<void> {
  const uri = config.mongoUri;

  // Listeners for Mongoose connection events
  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB connected successfully to ${mongoose.connection.host || 'cluster'}`);
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
  });

  try {
    logger.info(`Attempting MongoDB connection to [${uri.replace(/\/\/.*@/, '//<redacted>@')}]...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    logger.warn(
      'MongoDB initial connection failed. The server will remain active in degraded state.',
      error instanceof Error ? error.message : error
    );
  }
}

/**
 * Gracefully disconnects MongoDB
 */
export async function disconnectDB(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected gracefully.');
    }
  } catch (error) {
    logger.error('Error disconnecting MongoDB:', error);
  }
}
