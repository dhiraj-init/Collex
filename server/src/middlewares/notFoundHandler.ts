import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

/**
 * 404 Not Found Middleware
 * Triggered when a request URL does not match any registered route.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = new AppError(`Cannot ${req.method} ${req.originalUrl} - Route not found on this server`, 404);
  next(error);
}
