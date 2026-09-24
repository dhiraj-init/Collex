/**
 * mlService.ts
 * ------------
 * Client-side service for calling the ML endpoints via the Node.js proxy.
 * All requests go through /api/v1/ml so the Python ML service URL
 * is never exposed to the browser.
 */

import { apiClient } from './apiClient';

// ─── Price Intelligence ──────────────────────────────────────────────────────

export interface PricePredictInput {
  category: string;
  condition: string;
  listing_type?: string;
  original_price: number;
  age_months: number;
  brand?: string;
}

export interface ReasoningMetadata {
  condition_depreciation_band: string;
  age_factor_applied: string;
  listing_type_note: string;
  brand_factor: string;
  model_algorithm: string;
}

export interface PricePrediction {
  recommended_price: number;
  lower_bound: number;
  upper_bound: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_note: string;
  reasoning: ReasoningMetadata;
}

// ─── Collex Shield ───────────────────────────────────────────────────────────

export interface ShieldCheckInput {
  listing_price: number;
  category: string;
  condition: string;
  original_price?: number;
  age_months?: number;
  brand?: string;
  seller_account_age_days?: number;
  seller_completed_deals?: number;
  seller_report_count?: number;
  seller_cancellation_ratio?: number;
  listing_frequency_last_7d?: number;
}

export interface RiskSignal {
  signal: string;
  detail: string;
}

export interface ShieldResult {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  risk_score: number;
  signals: RiskSignal[];
  buyer_guidance: string;
  disclaimer: string;
}

// ─── API calls ───────────────────────────────────────────────────────────────

export const mlService = {
  /**
   * Request a price estimate for an item being listed.
   * Called from SellItemPage when the user fills in key pricing fields.
   */
  predictPrice: async (input: PricePredictInput): Promise<PricePrediction> => {
    const res = await apiClient.post<{ success: boolean; data: PricePrediction }>(
      '/ml/price/predict',
      input
    );
    return res.data.data;
  },

  /**
   * Run a Collex Shield risk assessment on a listing.
   * Called from ListingDetailPage to show risk signals to potential buyers.
   */
  checkShield: async (input: ShieldCheckInput): Promise<ShieldResult> => {
    const res = await apiClient.post<{ success: boolean; data: ShieldResult }>(
      '/ml/shield/check',
      input
    );
    return res.data.data;
  },
};
