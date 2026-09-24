import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { requestLogger } from './middlewares/requestLogger';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';
import apiRouter from './routes';
import { sendSuccess } from './utils/apiResponse';

export function createApp(): Application {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. CORS configuration
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 3. Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. HTTP Request Logger
  app.use(requestLogger);

  // 5. Root Welcome Route
  app.get('/', (_req: Request, res: Response) => {
    return sendSuccess(res, {
      service: 'Collex API Engine',
      version: '0.1.0',
      campusFocus: 'Hyperlocal Student Marketplace',
      endpoints: {
        health: `${config.apiPrefix}/health`,
      },
    }, 'Welcome to Collex API');
  });

  // 6. Mount Main API Router (/api/v1) with global rate limiter
  app.use(config.apiPrefix, apiLimiter, apiRouter);

  // 7. 404 Catch-All Handler
  app.use(notFoundHandler);

  // 8. Centralized Error Handler (Must be registered last)
  app.use(errorHandler);

  return app;
}

export const app = createApp();
