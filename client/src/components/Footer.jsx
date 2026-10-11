import React from 'react';
import { Shield, Sparkles, TrendingUp, Cpu, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070a12] text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                FinCare<span className="text-emerald-400">Advice</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              A dual-engine wealth architecture combining deterministic financial rules (3x/6x/12x emergency buffers, 5-8% insurance allocation) with microservice-driven NLP market sentiment (DistilBERT) for bounded asset allocation tilting.
            </p>
            <div className="flex items-center space-x-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Lock className="w-3.5 h-3.5" /> Deterministic Safeguards
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Cpu className="w-3.5 h-3.5" /> DistilBERT Microservice
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Core Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/advisory" className="hover:text-emerald-400 transition-colors">
                  Emergency Fund Gap Engine
                </a>
              </li>
              <li>
                <a href="/advisory" className="hover:text-emerald-400 transition-colors">
                  Health & Term Insurance Adequacy
                </a>
              </li>
              <li>
                <a href="/portfolio" className="hover:text-emerald-400 transition-colors">
                  Baseline vs AI Tilted Portfolio
                </a>
              </li>
              <li>
                <a href="/calculator" className="hover:text-emerald-400 transition-colors">
                  Compound Wealth SIP Simulator
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Safety Architecture
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Max AI dynamic tilt is strictly hard-bounded between <strong className="text-slate-300">±5% to ±10%</strong>. Asset allocation invariant strictly enforces <strong className="text-slate-300">sum = 100.00%</strong> at all times.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} FinCareAdvice Monorepo Platform. All rights reserved.</p>
          <p className="text-amber-400/80 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 text-[11px]">
            Educational & advisory simulator. Perform independent due diligence before investing.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
