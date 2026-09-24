import http from 'http';
import { app } from './app';
import { config, validateEnv } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { logger } from './utils/logger';
import { seedInitialListingsIfEmpty } from './utils/seedListings';
import { setupSocket } from './socket';

async function bootstrap(): Promise<void> {
  try {
    // 1. Validate environment requirements
    validateEnv();

    // 2. Connect to Database (Non-blocking fallback to degraded status)
    await connectDB();

    // 3. Seed initial campus listings if database is empty
    await seedInitialListingsIfEmpty();

    // 4. Create HTTP & Socket.IO Server
    const httpServer = http.createServer(app);
    setupSocket(httpServer);

    const server = httpServer.listen(config.port, () => {
      logger.info(`=================================================`);
      logger.info(`🚀 Collex API server running on port ${config.port}`);
      logger.info(`🌐 Environment : ${config.nodeEnv}`);
      logger.info(`📡 API Base    : http://localhost:${config.port}${config.apiPrefix}`);
      logger.info(`🩺 Health Check: http://localhost:${config.port}${config.apiPrefix}/health`);
      logger.info(`💬 Socket.IO   : Connected & Authenticated`);
      logger.info(`=================================================`);
    });

    // 4. Graceful Shutdown Handlers
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        logger.info('Collex server terminated cleanly.');
        process.exit(0);
      });

      // Force terminate if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Shutdown timed out after 10s. Force exiting.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught Exception thrown:', err);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to initialize Collex server:', error);
    process.exit(1);
  }
}

void bootstrap();
