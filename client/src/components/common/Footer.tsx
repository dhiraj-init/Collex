import React from 'react';
import { BookOpen, ShieldCheck, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Collex Hyperlocal Campus Marketplace • Phase 0 Architecture</span>
        </div>

        <div className="flex items-center space-x-6 text-slate-400">
          <span className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
            <span>/docs/ARCHITECTURE.md</span>
          </span>
          <span className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors">
            <Terminal className="w-3.5 h-3.5" />
            <span>LEARNING_NOTES.md</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
