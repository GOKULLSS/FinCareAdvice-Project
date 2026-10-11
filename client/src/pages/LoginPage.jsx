import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lock, Mail, ArrowRight, Zap, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDemoClick = async () => {
    setDemoLoading(true);
    const success = await loginAsDemo();
    setDemoLoading(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-slate-900/90 p-8 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 mx-auto mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome back</h2>
          <p className="mt-2 text-xs text-slate-400">
            Sign in to access your personal wealth dashboard and AI portfolio
          </p>
        </div>

        {/* Demo Account Quick Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={demoLoading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all shadow-md shadow-cyan-950/40"
          >
            {demoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Zap className="w-4 h-4 text-cyan-400" />
            )}
            <span>Instant Demo Login (Priya Sharma)</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-slate-900 text-slate-500 uppercase tracking-wider">
              Or with credentials
            </span>
          </div>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-emerald-400 font-medium hover:underline hover:text-emerald-300"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
