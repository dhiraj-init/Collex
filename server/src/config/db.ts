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

let retryTimeout: NodeJS.Timeout | null = null;

/**
 * Initializes MongoDB connection via Mongoose with auto-retry
 */
export async function connectDB(): Promise<void> {
  const uri = config.mongoUri;

  if (uri.startsWith('mongodb+srv')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch {
      // Fallback to system DNS
    }
  }

  // Skip if already connected or connecting
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  try {
    logger.info(`Attempting MongoDB connection to [${uri.replace(/\/\/.*@/, '//<redacted>@')}]...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connection established successfully.');
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.warn('MongoDB connection failed. Retrying in 5 seconds...', errorMsg);
    if (!retryTimeout) {
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connectDB();
      }, 5000);
    }
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
