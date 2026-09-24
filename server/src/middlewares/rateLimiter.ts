import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication routes
 * Allows max 15 attempts per 15 minutes window (Phase 12: tightened from 25)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.',
  },
});

/**
 * General API rate limiter for all non-auth routes
 * 200 requests per minute per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please slow down.',
  },
});

/**
 * Strict limiter for ML inference endpoints
 * Prevents API abuse / accidental spam from debounce bugs
 */
export const mlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many ML requests. Please wait a moment.',
  },
});
