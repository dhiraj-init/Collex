/**
 * CollexShieldBadge.tsx
 * ---------------------
 * Shown on the ListingDetailPage below the seller info section.
 *
 * Key design decisions:
 *   - Language is always advisory ("Collex Shield noticed..." not "This is a scam")
 *   - LOW risk shows a subtle reassurance note, not a prominent banner
 *   - HIGH risk shows an amber/red banner with all signals and buyer guidance
 *   - Disclaimer is always visible to maintain trust
 *   - Signals are expandable to reduce visual noise on clean listings
 */

import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import type { ShieldResult } from '../../services/mlService';

interface Props {
  result: ShieldResult;
}

const LEVEL_CONFIG = {
  LOW: {
    icon: ShieldCheck,
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-800/50',
    bg: 'bg-emerald-950/30',
    labelColor: 'text-emerald-300',
    label: 'Low Risk',
  },
  MEDIUM: {
    icon: Shield,
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-800/50',
    bg: 'bg-amber-950/30',
    labelColor: 'text-amber-300',
    label: 'Some Signals Detected',
  },
  HIGH: {
    icon: ShieldAlert,
    iconColor: 'text-red-400',
    borderColor: 'border-red-800/60',
    bg: 'bg-red-950/30',
    labelColor: 'text-red-300',
    label: 'Unusual Signals Detected',
  },
} as const;

export const CollexShieldBadge: React.FC<Props> = ({ result }) => {
  const [expanded, setExpanded] = useState(result.risk_level !== 'LOW');
  const cfg = LEVEL_CONFIG[result.risk_level];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border ${cfg.borderColor} ${cfg.bg} overflow-hidden`}>
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center space-x-2.5">
          <Icon className={`w-4 h-4 ${cfg.iconColor} shrink-0`} />
          <div>
            <p className="text-xs font-semibold text-slate-100">Collex Shield</p>
            <p className={`text-[10px] font-medium ${cfg.labelColor}`}>{cfg.label}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {result.signals.length > 0 && (
            <span className="text-[10px] text-slate-400">
              {result.signals.length} signal{result.signals.length > 1 ? 's' : ''}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-in fade-in duration-200">
          {/* Signals list */}
          {result.signals.length > 0 ? (
            <div className="space-y-2.5">
              {result.signals.map((sig, i) => (
                <div key={i} className="space-y-0.5">
                  <p className="text-[11px] font-semibold text-slate-200">
                    · {sig.signal}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed pl-3">
                    {sig.detail}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              No unusual signals detected for this listing.
            </p>
          )}

          {/* Buyer guidance */}
          <div className="bg-slate-950/40 rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed border border-slate-800/50">
            <p className="font-semibold text-slate-200 mb-1">Buyer guidance</p>
            <p>{result.buyer_guidance}</p>
          </div>

          {/* Disclaimer — always shown */}
          <p className="text-[10px] text-slate-600 leading-relaxed">
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};
