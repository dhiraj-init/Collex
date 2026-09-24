/**
 * AppError Class
 * 
 * Used for operational, predictable errors that can be gracefully handled and
 * returned to the client (e.g., validation errors, not found, unauthorized).
 * 
 * Supports both signatures:
 * new AppError('Message', 400) and new AppError(400, 'Message')
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(messageOrCode: string | number, codeOrMessage?: number | string, details?: unknown) {
    let message: string;
    let statusCode: number;

    if (typeof messageOrCode === 'number') {
      statusCode = messageOrCode;
      message = typeof codeOrMessage === 'string' ? codeOrMessage : 'An error occurred';
    } else {
      message = messageOrCode;
      statusCode = typeof codeOrMessage === 'number' ? codeOrMessage : 500;
    }

    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
