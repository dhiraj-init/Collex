import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  clientUrl: string;
  mongoUri: string;
  apiPrefix: string;
}

const nodeEnv = (process.env.NODE_ENV || 'development') as AppConfig['nodeEnv'];

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/collex',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
};

/**
 * Validates critical environment configuration at boot time
 */
export function validateEnv(): void {
  if (config.nodeEnv === 'production') {
    if (!process.env.MONGODB_URI) {
      throw new Error('CRITICAL: MONGODB_URI must be defined in production environment.');
    }
  }
}
