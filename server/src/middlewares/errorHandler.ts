import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { config } from '../config/env';

interface MongooseErrorWithCode extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
  errors?: Record<string, { message: string }>;
}

/**
 * Centralized API Error Handling Middleware
 * 
 * Standardizes all application, validation, database, and unexpected errors
 * into consistent, secure JSON responses.
 */
export function errorHandler(
  err: Error | AppError | MongooseErrorWithCode,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown = undefined;

  // 1. Known AppError (Operational)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.details;
  }
  // 2. Mongoose Cast Error (Invalid Mongo ObjectId)
  else if (err.name === 'CastError') {
    const castErr = err as MongooseErrorWithCode;
    statusCode = 400;
    message = `Invalid resource identifier: ${castErr.value}`;
  }
  // 3. Mongoose Duplicate Key Error (Code 11000)
  else if ((err as MongooseErrorWithCode).code === 11000) {
    const mongoErr = err as MongooseErrorWithCode;
    const field = mongoErr.keyValue ? Object.keys(mongoErr.keyValue)[0] : 'field';
    statusCode = 409;
    message = `An item with that ${field} already exists.`;
  }
  // 4. Mongoose Schema Validation Error
  else if (err.name === 'ValidationError') {
    const valErr = err as MongooseErrorWithCode;
    statusCode = 400;
    message = 'Validation failed';
    if (valErr.errors) {
      errors = Object.values(valErr.errors).map((e) => e.message);
    }
  }
  // 5. Express JSON Syntax Error in request body
  else if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    statusCode = 400;
    message = 'Malformed JSON body in request';
  }
  // 6. Generic / Uncaught Exceptions
  else {
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
    message = config.nodeEnv === 'production' 
      ? 'An unexpected error occurred. Please try again later.' 
      : err.message || message;
  }

  const isDev = config.nodeEnv === 'development';

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    stack: isDev ? err.stack : undefined,
    meta: {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  });
}
