/**
 * PriceIntelligenceCard.tsx
 * -------------------------
 * Displayed inside the Sell Item form after the user fills in
 * category, condition, original price, and age.
 *
 * Shows:
 *   - Suggested price range (lower – upper)
 *   - Recommended point estimate
 *   - Confidence badge (HIGH / MEDIUM / LOW) with honest explanation
 *   - Expandable reasoning metadata
 *
 * Design principle: honest uncertainty. If the model confidence is LOW,
 * we say so clearly and encourage the user to check manually.
 */

import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react';
import type { PricePrediction } from '../../services/mlService';

interface Props {
  prediction: PricePrediction;
  onApply: (price: number) => void;
}

const CONFIDENCE_CONFIG = {
  HIGH: {
    label: 'High confidence',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-950 border-emerald-700 text-emerald-300',
  },
  MEDIUM: {
    label: 'Medium confidence',
    dot: 'bg-amber-400',
    badge: 'bg-amber-950 border-amber-700 text-amber-300',
  },
  LOW: {
    label: 'Low confidence',
    dot: 'bg-red-400',
    badge: 'bg-red-950 border-red-800 text-red-300',
  },
} as const;

export const PriceIntelligenceCard: React.FC<Props> = ({ prediction, onApply }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const cfg = CONFIDENCE_CONFIG[prediction.confidence];

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-100 tracking-tight">
            Collex Price Intelligence
          </span>
        </div>
        <span className={`inline-flex items-center space-x-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span>{cfg.label}</span>
        </span>
      </div>

      {/* Price range */}
      <div className="px-4 py-4 space-y-3">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-medium">
            Suggested range
          </p>
          <p className="text-xl font-bold text-white tabular-nums">
            {fmt(prediction.lower_bound)}
            <span className="text-slate-400 mx-2 font-normal">–</span>
            {fmt(prediction.upper_bound)}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-medium">
              Recommended
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 tabular-nums">
              {fmt(prediction.recommended_price)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onApply(prediction.recommended_price)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            Apply price
          </button>
        </div>

        {/* Confidence note */}
        <div className="flex items-start space-x-2 text-[11px] text-slate-400 bg-slate-950/50 rounded-xl p-3">
          {prediction.confidence === 'LOW' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          ) : (
            <Info className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
          )}
          <p className="leading-relaxed">{prediction.confidence_note}</p>
        </div>

        {/* Expandable reasoning */}
        <button
          type="button"
          onClick={() => setShowReasoning((v) => !v)}
          className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition-colors pt-1"
        >
          <span className="font-medium">How was this calculated?</span>
          {showReasoning ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showReasoning && (
          <div className="space-y-2 animate-in fade-in duration-200">
            {[
              { label: 'Condition', value: prediction.reasoning.condition_depreciation_band },
              { label: 'Age', value: prediction.reasoning.age_factor_applied },
              { label: 'Listing type', value: prediction.reasoning.listing_type_note },
              { label: 'Brand', value: prediction.reasoning.brand_factor },
              { label: 'Algorithm', value: prediction.reasoning.model_algorithm },
            ].map(({ label, value }) => (
              <div key={label} className="text-[11px]">
                <span className="text-slate-500 font-medium">{label}: </span>
                <span className="text-slate-300">{value}</span>
              </div>
            ))}
            <p className="text-[10px] text-slate-600 pt-1 border-t border-slate-800 leading-relaxed">
              Trained on synthetic campus resale data. Real-world accuracy will improve
              as Collex accumulates historical sale prices from your campus.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
