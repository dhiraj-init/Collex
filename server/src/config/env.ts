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
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  approvedCollegeDomains: string[];
}

const nodeEnv = (process.env.NODE_ENV || 'development') as AppConfig['nodeEnv'];

const rawDomains = process.env.APPROVED_COLLEGE_DOMAINS || 'iitb.ac.in,bits-pilani.ac.in,dtu.ac.in,nitt.edu,rvce.edu.in,gmail.com';
const approvedCollegeDomains = rawDomains.split(',').map((d) => d.trim().toLowerCase());

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/collex',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'collex_access_secret_dev_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'collex_refresh_secret_dev_2026',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  approvedCollegeDomains,
};

/**
 * Validates critical environment configuration at boot time
 */
export function validateEnv(): void {
  if (config.nodeEnv === 'production') {
    if (!process.env.MONGODB_URI) {
      throw new Error('CRITICAL: MONGODB_URI must be defined in production environment.');
    }
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error('CRITICAL: JWT secrets must be set in production environment.');
    }
  }
}
