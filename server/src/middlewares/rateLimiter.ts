import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication routes
 * Allows max 25 attempts per 15 minutes window
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.',
  },
});
