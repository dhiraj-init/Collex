import React from 'react';
import { ShieldCheck, GitBranch } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-wider">
            C
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg text-slate-100 tracking-tight">Collex</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Phase 0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal -mt-0.5">Hyperlocal Campus Marketplace</p>
          </div>
        </div>

        {/* Status & Badges */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800/70 border border-slate-700/80 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified Student Access</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800/70 border border-slate-700/80 text-slate-300">
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono">v0.1.0-foundation</span>
          </div>
        </div>
      </div>
    </header>
  );
};
