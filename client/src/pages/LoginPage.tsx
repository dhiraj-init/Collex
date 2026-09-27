import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/marketplace';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const isCollegeDomain = email.includes('.edu') || email.includes('.ac.in') || email.includes('gmail.com');
    if (!isCollegeDomain) {
      setErrorMessage('Please use your approved college email address (@iitb.ac.in, @dtu.ac.in, etc.)');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
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
                  placeholder="your.roll@college.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Must be an approved domain (.ac.in, .edu, or dev allowed)
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
                  placeholder="••••••••••••"
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

          {/* Quick Demo Credentials */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Demo Accounts Available</span>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/60 font-mono">
                Password@123
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setEmail('aryan.sharma@iitb.ac.in');
                  setPassword('Password@123');
                }}
                className="text-left px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500 transition-all group"
              >
                <div className="text-[11px] font-medium text-emerald-400 group-hover:text-emerald-300">
                  Student Account
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  aryan.sharma@iitb.ac.in
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('admin@iitb.ac.in');
                  setPassword('Password@123');
                }}
                className="text-left px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500 transition-all group"
              >
                <div className="text-[11px] font-medium text-indigo-400 group-hover:text-indigo-300">
                  College Admin
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  admin@iitb.ac.in
                </div>
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              💡 Tip: Click either card above to auto-fill, or register any <span className="text-slate-300">@gmail.com</span> email.
            </p>
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
