import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useMarketplace();

  const [email, setEmail] = useState('aryan.sharma@iitb.ac.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Student domain check
    const isCollegeDomain = email.includes('.edu') || email.includes('.ac.in');
    if (!isCollegeDomain) {
      setErrorMessage('Please use your official college email address (@iitb.ac.in, @dtu.ac.in, etc.)');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/marketplace');
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md shadow-emerald-950">
            C
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Campus Login</h1>
          <p className="text-xs text-slate-400">
            Sign in with your verified university credentials
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-900/80 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="your.name@college.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Must be an active institutional domain (.ac.in or .edu)
              </span>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl shadow-md shadow-emerald-950 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Student Session...' : 'Sign In to Campus'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

          {/* Quick Demo Reassurance */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Currently simulating verified student: <strong>{user.fullName}</strong></span>
          </div>

        </div>

        {/* Register Link */}
        <p className="text-center text-xs text-slate-400">
          New student on campus?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Create verified student account &rarr;
          </Link>
        </p>

      </div>
    </div>
  );
};
