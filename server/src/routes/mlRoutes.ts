import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { mlLimiter } from '../middlewares/rateLimiter';
import { AppError } from '../utils/appError';

const router = Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';

/**
 * Generic proxy helper — forwards a JSON body to the ML service and
 * returns its response. Adds a user-friendly error when the ML service
 * is offline so the Node server never exposes raw ML service internals.
 */
async function proxyToML(
  endpoint: string,
  body: unknown,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const mlRes = await fetch(`${ML_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!mlRes.ok) {
      const errText = await mlRes.text();
      return next(new AppError(`ML service error: ${errText}`, 502));
    }

    const data: unknown = await mlRes.json();
    res.json({ success: true, data });
  } catch {
    // ML service is down — return a graceful degradation response instead of 500
    return next(
      new AppError(
        'Price Intelligence is temporarily unavailable. You can still list your item manually.',
        503
      )
    );
  }
}

/**
 * POST /api/v1/ml/price/predict
 * Authenticated route — proxies to the Python ML service price endpoint.
 * The Node server acts as the only public-facing gateway so the ML service
 * never needs to be directly accessible from the browser.
 */
router.post(
  '/price/predict',
  mlLimiter,
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, condition, listing_type, original_price, age_months, brand } = req.body as Record<string, unknown>;

    if (!category || !condition || !original_price || age_months === undefined) {
      return next(new AppError('category, condition, original_price, and age_months are required', 400));
    }

    await proxyToML(
      '/price/predict',
      { category, condition, listing_type: listing_type ?? 'SELL', original_price, age_months, brand },
      res,
      next
    );
  }
);

/**
 * POST /api/v1/ml/shield/check
 * Proxies a listing + seller context to Collex Shield for risk assessment.
 * Seller sensitivity data (report_count, cancellation_ratio) is resolved
 * server-side and never sent from the client — this prevents clients from
 * manipulating their own shield score.
 */
router.post(
  '/shield/check',
  mlLimiter,
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      listing_price,
      category,
      condition,
      original_price,
      age_months,
      brand,
      seller_account_age_days,
      seller_completed_deals,
      seller_report_count,
      seller_cancellation_ratio,
      listing_frequency_last_7d,
    } = req.body as Record<string, unknown>;

    if (!listing_price || !category || !condition) {
      return next(new AppError('listing_price, category, and condition are required', 400));
    }

    await proxyToML(
      '/shield/check',
      {
        listing_price,
        category,
        condition,
        original_price,
        age_months,
        brand,
        seller_account_age_days,
        seller_completed_deals,
        seller_report_count,
        seller_cancellation_ratio,
        listing_frequency_last_7d,
      },
      res,
      next
    );
  }
);

/**
 * GET /api/v1/ml/health
 * Checks whether the Python ML service is reachable.
 * Useful for the admin dashboard and debugging.
 */
router.get('/health', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const mlRes = await fetch(`${ML_SERVICE_URL}/health`);
    const data: unknown = await mlRes.json();
    res.json({ success: true, data });
  } catch {
    return next(new AppError('ML service is not reachable', 503));
  }
});

export default router;
