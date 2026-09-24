import { Request, Response } from 'express';
import { getDbStatus } from '../config/db';
import { config } from '../config/env';
import { sendSuccess } from '../utils/apiResponse';

/**
 * Health check controller
 * Reports service status, database connectivity, uptime, and system metrics.
 */
export function getHealth(_req: Request, res: Response): Response {
  const dbStatus = getDbStatus();
  const uptimeSeconds = Math.floor(process.uptime());
  const memory = process.memoryUsage();

  const isHealthy = dbStatus.isConnected;

  const data = {
    service: 'collex-api',
    status: isHealthy ? 'healthy' : 'degraded',
    version: '0.1.0',
    environment: config.nodeEnv,
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.isConnected,
      state: dbStatus.stateName,
      code: dbStatus.stateCode,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: {
        rss: +(memory.rss / (1024 * 1024)).toFixed(2),
        heapUsed: +(memory.heapUsed / (1024 * 1024)).toFixed(2),
        heapTotal: +(memory.heapTotal / (1024 * 1024)).toFixed(2),
      },
    },
  };

  const message = isHealthy
    ? 'All systems operational'
    : 'Server operational, database in degraded state';

  return sendSuccess(res, data, message, 200);
}
