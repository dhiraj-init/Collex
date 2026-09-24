import React from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HealthCheckPanel } from './components/common/HealthCheckPanel';
import { ArchitecturePreview } from './components/common/ArchitecturePreview';
import { CheckCircle2, Shield, ArrowUpRight } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Foundation Hero Banner */}
        <div className="card-surface rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-slate-800">
          <div className="max-w-2xl relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Foundation Phase Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Campus Commerce Architecture
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Collex is an exclusive peer-to-peer hyperlocal marketplace engineered for verified university students to buy, sell, rent, exchange, and giveaway items securely within campus borders.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Express + TypeScript Backend</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>React 19 + Tailwind Client</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Centralized Error Handling</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Domain Whitelist Partitioning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Diagnostics Card */}
        <section aria-label="Backend Health Diagnostics">
          <HealthCheckPanel />
        </section>

        {/* Architectural Overview and Data Models */}
        <section aria-label="Technical Architecture and Proposed Models">
          <ArchitecturePreview />
        </section>

        {/* Quick Links / Guide for Developers */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-200">Developer Quick Reference</span>
              <p className="text-slate-400 mt-0.5">
                Inspect <code className="text-slate-300">/docs/ARCHITECTURE.md</code> for architectural diagrams and <code className="text-slate-300">LEARNING_NOTES.md</code> for concepts and interview preparation.
              </p>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <span className="text-slate-500 font-mono text-[11px]">Next: Phase 1 (Auth & Campus Models)</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App;
