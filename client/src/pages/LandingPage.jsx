import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  Cpu,
  BarChart3,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { sentimentAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { loginAsDemo, isAuthenticated } = useAuth();
  const [sentiment, setSentiment] = useState(null);
  const [activeTab, setActiveTab] = useState('tilt');

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const res = await sentimentAPI.getLatestSentiment();
        if (res.success && res.data) {
          setSentiment(res.data);
        }
      } catch (err) {
        // Fallback default
        setSentiment({
          equities: 0.35,
          debt: -0.15,
          gold: 0.20,
        });
      }
    };
    fetchSentiment();
  }, []);

  const formatSentiment = (val) => {
    if (val === undefined || val === null) return '0.00';
    const num = Number(val);
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-36 border-b border-slate-800/80">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[450px] h-[250px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-8 backdrop-blur-md shadow-lg shadow-emerald-950/40">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Hybrid Wealth Architecture Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-slate-400">Deterministic Rules + DistilBERT NLP</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Intelligent Financial Planning.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Safeguarded by Design.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Replace guesswork with an institutional-grade financial advisory engine.
              Automate your emergency fund targets, calculate health cover adequacy, and optimize your asset allocation with real-time AI news sentiment bounded within strict ±5% safety guardrails.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2"
                  >
                    <span>Start Advisory Diagnostic</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={loginAsDemo}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-cyan-300 bg-slate-900/90 border border-cyan-500/40 hover:bg-slate-800/80 transition-all flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Launch Interactive Demo</span>
                  </button>
                </>
              )}
              <Link
                to="/calculator"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-slate-300 bg-slate-900/60 border border-slate-800 hover:text-white hover:bg-slate-800/60 transition-all flex items-center justify-center space-x-2"
              >
                <span>SIP Growth Simulator</span>
              </Link>
            </div>
          </div>

          {/* Real-time Market Sentiment Bar */}
          <div className="mt-16 max-w-4xl mx-auto bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Live Market Sentiment Feed (DistilBERT NLP)
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Source: Finnhub Financial News Ingestion
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {/* Equities */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Equities Sentiment</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {formatSentiment(sentiment?.equities)}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
                    (sentiment?.equities || 0) >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {(sentiment?.equities || 0) >= 0 ? 'Bullish' : 'Bearish'}
                </div>
              </div>

              {/* Debt */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Debt / Bonds Sentiment</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {formatSentiment(sentiment?.debt)}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
                    (sentiment?.debt || 0) >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {(sentiment?.debt || 0) >= 0 ? 'Accommodative' : 'Yield Pressure'}
                </div>
              </div>

              {/* Gold */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Gold / Safe-Haven</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {formatSentiment(sentiment?.gold)}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-mono font-semibold ${
                    (sentiment?.gold || 0) >= 0
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {(sentiment?.gold || 0) >= 0 ? 'Safe Haven' : 'Neutral'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Hybrid Architecture Section */}
      <section className="py-20 bg-[#080c14] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Dual-Engine Blueprint
            </h2>
            <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
              Why Hybrid Beats Pure AI or Static Rules
            </h3>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Traditional robo-advisors rely on static surveys, while unconstrained LLMs hallucinate risky portfolios. FinCareAdvice binds real-time transformer sentiment to deterministic mathematical guardrails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Engine 1: Deterministic Rules Engine */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-7 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Engine 1: Deterministic Rules Foundation
                </h4>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  Strict, non-negotiable financial safety rules calculated exclusively on the backend. No hallucinations, only disciplined fundamentals.
                </p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Emergency Fund Rules:</strong> 3x, 6x, or 12x essential expenses based on job stability and family dependents.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Insurance Adequacy:</strong> Calibrated 5%–8% premium budget, location-tiered health cover benchmarks (₹15L–₹50L Metro, 2x family floater).
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Baseline Allocation Matrix:</strong> Time-horizon and risk-calibrated asset splits (Debt, Gold, Equity).
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-emerald-400 font-mono">
                <span>Deterministic Invariants</span>
                <span>Sum = 100.00%</span>
              </div>
            </div>

            {/* Engine 2: AI Dynamic Tilt */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-7 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Engine 2: Safeguarded AI Dynamic Tilt
                </h4>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  FastAPI microservice ingests live market headlines via Finnhub, classifies sentiment with DistilBERT, and applies controlled dynamic tilts.
                </p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-white">DistilBERT Inference:</strong> Fine-tuned on Financial PhraseBank to capture nuanced macro shifts.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Hard Bounded Tilts:</strong> Maximum dynamic adjustment clamped strictly between <strong className="text-cyan-300">±5% to ±10%</strong>.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Graceful Degradation:</strong> If the AI service is offline, fallback seamlessly to deterministic baseline.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-cyan-400 font-mono">
                <span>Guardrail Clamping</span>
                <span>Max Tilt: ±5.00%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-[#090d16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Comprehensive Platform
            </h2>
            <h3 className="mt-2 text-3xl font-extrabold text-white">
              End-to-End Wealth Engineering
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
              <h4 className="text-lg font-bold text-white mb-2">Emergency Fund Gap Analysis</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Calculates your essential burn rate across consumption and credit commitments. Dynamically adapts buffer target to 3x, 6x, or 12x months.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <BarChart3 className="w-8 h-8 text-cyan-400 mb-4" />
              <h4 className="text-lg font-bold text-white mb-2">Insurance Adequacy Benchmark</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Evaluates health cover needs based on city tier (Metro ₹15L–₹50L, Tier 2 ₹10L–₹25L, Town ₹5L–₹15L) with a 2x family multiplier and 5–8% income budget.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-emerald-400 mb-4" />
              <h4 className="text-lg font-bold text-white mb-2">Compound SIP Growth Engine</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interactive compound wealth projection with inflation discounting, expected returns, and year-by-year capital milestone schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory Disclaimer Callout */}
      <section className="py-8 bg-slate-950 border-t border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-amber-400 uppercase font-semibold">Regulatory Notice:</strong> Probabilistic AI recommendation based on current news sentiment. Market investments are subject to risk. Please perform independent due diligence.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
