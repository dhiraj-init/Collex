import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Heart, BookOpen, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs pb-20 md:pb-12 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-900">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-emerald-950">
                C
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Collex</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed font-normal">
              The trusted marketplace for campus life. Buy, sell, rent, and exchange items safely within your university community.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-900/60 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Student Verified Only</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px]">Campus Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">Course Textbooks & Notes</Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">Bicycles & Campus Commute</Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">Scientific Calculators</Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">Hostel Essentials & Stoves</Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">Engineering & Lab Gear</Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-emerald-400 transition-colors">Free Junior Hand-me-downs</Link>
              </li>
            </ul>
          </div>

          {/* Campus Safety */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px]">Trust & Safety</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Domain-Gated Accounts</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>On-Campus Designated Meetups</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>6-Digit Verification Handshake</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Zero Scammer Tolerance</span>
              </li>
            </ul>
          </div>

          {/* University Coverage */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 uppercase tracking-wider text-[11px]">Active Campuses</h4>
            <div className="flex flex-wrap gap-1.5">
              {['IIT Bombay', 'BITS Pilani Goa', 'DTU Delhi', 'NIT Trichy', 'RVCE Bengaluru'].map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Want Collex at your college? Request your campus domain launch.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <div>
            &copy; {new Date().getFullYear()} Collex Technologies Inc. Built for university students.
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>for Indian Campuses</span>
            </span>
            <span className="text-slate-500 font-mono">v1.0-frontend</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
