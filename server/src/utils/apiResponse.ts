import { Response } from 'express';

/**
 * Standard API Response Envelope
 */
export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: unknown;
  meta?: {
    timestamp: string;
    path?: string;
    [key: string]: unknown;
  };
}

/**
 * Sends a standardized success JSON response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Request successful',
  statusCode = 200,
  meta?: Record<string, unknown>
): Response {
  const payload: ApiResponsePayload<T> = {
    success: true,
    statusCode,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return res.status(statusCode).json(payload);
}

/**
 * Sends a standardized error JSON response
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown,
  meta?: Record<string, unknown>
): Response {
  const payload: ApiResponsePayload = {
    success: false,
    statusCode,
    message,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return res.status(statusCode).json(payload);
}
