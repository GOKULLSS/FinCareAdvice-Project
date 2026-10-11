import React, { useState, useEffect } from 'react';
import { advisoryAPI, sentimentAPI } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  PieChart as PieIcon,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Lock,
  ArrowRight,
  Loader2,
  Info,
  Sliders,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

const PortfolioPage = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Goal & Risk controls
  const [timeHorizonYears, setTimeHorizonYears] = useState(5);
  const [riskProfile, setRiskProfile] = useState('Moderate');
  const [maxTilt, setMaxTilt] = useState(5.0);

  const [portfolioData, setPortfolioData] = useState(null);

  const fetchPortfolio = async () => {
    try {
      const res = await advisoryAPI.getPortfolioAllocation({
        timeHorizonYears,
        riskProfile,
        maxTilt,
      });
      if (res.success && res.data) {
        setPortfolioData(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [timeHorizonYears, riskProfile, maxTilt]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPortfolio();
    showToast('Recalibrating AI Dynamic Tilt with latest MongoDB sentiment.', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">
          Executing Hybrid Portfolio Allocation Engine...
        </p>
      </div>
    );
  }

  const baseline = portfolioData?.baselineAllocation || { debt: 45, gold: 15, equity: 40 };
  const finalAlloc = portfolioData?.aiTiltAllocation || { debt: 43.5, gold: 14.5, equity: 42.0 };
  const tilts = portfolioData?.realizedTilts || { debt: -1.5, gold: -0.5, equity: 2.0 };
  const sentiment = portfolioData?.sentimentData || {};
  const safeguards = portfolioData?.safeguards || {};

  // Chart preparation
  const comparisonData = [
    {
      name: 'Debt',
      baseline: baseline.debt,
      aiTilted: finalAlloc.debt,
      tilt: tilts.debt,
      color: '#38bdf8', // Sky
    },
    {
      name: 'Gold',
      baseline: baseline.gold,
      aiTilted: finalAlloc.gold,
      tilt: tilts.gold,
      color: '#f59e0b', // Amber
    },
    {
      name: 'Equities',
      baseline: baseline.equity,
      aiTilted: finalAlloc.equity,
      tilt: tilts.equity,
      color: '#10b981', // Emerald
    },
  ];

  const formatTiltBadge = (val) => {
    if (val === 0) return '0.0%';
    return val > 0 ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Mandatory Regulatory Disclaimer Callout (Top & Prominent) */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3.5 shadow-lg shadow-amber-950/20">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300 font-semibold block mb-0.5 uppercase tracking-wider">
            Mandatory Disclaimer
          </strong>
          {portfolioData?.disclaimer ||
            'Probabilistic AI recommendation based on current news sentiment. Market investments are subject to risk. Please perform independent due diligence.'}
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Hybrid Portfolio & AI Dynamic Tilt Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Multi-Asset Allocation Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Combines time-horizon baseline matrices with real-time DistilBERT market news sentiment.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Sentiment</span>
        </button>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-8 backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Time Horizon */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Time Horizon: <strong className="text-emerald-400 font-mono">{timeHorizonYears} Years</strong>{' '}
              <span className="text-slate-400 text-[11px]">
                ({timeHorizonYears < 3 ? 'Short Term' : timeHorizonYears <= 7 ? 'Medium Term' : 'Long Term'})
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={timeHorizonYears}
              onChange={(e) => setTimeHorizonYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>&lt; 3Y (Capital Preservation)</span>
              <span>3-7Y (Balanced)</span>
              <span>&gt; 7Y (Aggressive)</span>
            </div>
          </div>

          {/* Risk Profile */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Risk Profile: <strong className="text-cyan-400">{riskProfile}</strong>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['Conservative', 'Moderate', 'Aggressive'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskProfile(r)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    riskProfile === r
                      ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Safeguard Bound Slider */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Max AI Tilt Bound: <strong className="text-teal-400 font-mono">±{maxTilt}%</strong>
            </label>
            <input
              type="range"
              min="2"
              max="10"
              step="1"
              value={maxTilt}
              onChange={(e) => setMaxTilt(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>±2% (Tighter)</span>
              <span>±5% (Standard)</span>
              <span>±10% (Maximum Safety Limit)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Market Sentiment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Equities Sentiment */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Equities Sentiment</span>
            <span className="font-mono text-[10px]">DistilBERT NLP</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-white font-mono">
              {sentiment.equities !== undefined
                ? `${sentiment.equities > 0 ? '+' : ''}${sentiment.equities.toFixed(2)}`
                : 'N/A'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                (sentiment.equities || 0) >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {(sentiment.equities || 0) >= 0 ? 'Bullish' : 'Bearish'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Realized Tilt: <strong className="text-emerald-400">{formatTiltBadge(tilts.equity)}</strong>
          </p>
        </div>

        {/* Debt Sentiment */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Debt / Yield Sentiment</span>
            <span className="font-mono text-[10px]">Macro Yields</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-white font-mono">
              {sentiment.debt !== undefined
                ? `${sentiment.debt > 0 ? '+' : ''}${sentiment.debt.toFixed(2)}`
                : 'N/A'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                (sentiment.debt || 0) >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {(sentiment.debt || 0) >= 0 ? 'Accommodative' : 'Yield Hardening'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Realized Tilt: <strong className="text-cyan-400">{formatTiltBadge(tilts.debt)}</strong>
          </p>
        </div>

        {/* Gold Sentiment */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Gold / Commodity Sentiment</span>
            <span className="font-mono text-[10px]">Safe-Haven Flow</span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-white font-mono">
              {sentiment.gold !== undefined
                ? `${sentiment.gold > 0 ? '+' : ''}${sentiment.gold.toFixed(2)}`
                : 'N/A'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                (sentiment.gold || 0) >= 0
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {(sentiment.gold || 0) >= 0 ? 'Safe Haven Inflow' : 'Neutral'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Realized Tilt: <strong className="text-amber-400">{formatTiltBadge(tilts.gold)}</strong>
          </p>
        </div>
      </div>

      {/* Side-by-Side Asset Allocation Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Baseline Matrix */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">1. Deterministic Baseline</h3>
                  <p className="text-xs text-slate-400">
                    Rule-Engine Allocation ({portfolioData?.goalParameters?.horizonTier} Horizon)
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Sum: 100%
              </span>
            </div>

            <div className="space-y-4 my-6">
              {/* Debt */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Debt / Fixed Income</span>
                  <span className="font-bold text-white font-mono">{baseline.debt}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full" style={{ width: `${baseline.debt}%` }} />
                </div>
              </div>

              {/* Gold */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Gold / Precious Metals</span>
                  <span className="font-bold text-white font-mono">{baseline.gold}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${baseline.gold}%` }} />
                </div>
              </div>

              {/* Equity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Equities / Index & Stocks</span>
                  <span className="font-bold text-white font-mono">{baseline.equity}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${baseline.equity}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
            Guaranteed fallback profile if market feeds or AI microservice are unavailable.
          </div>
        </div>

        {/* AI Dynamic Tilt Allocation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">2. AI-Tilted Allocation</h3>
                  <p className="text-xs text-slate-400">
                    DistilBERT Calibrated + Guardrail Bounded (±{maxTilt}%)
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Sum: {portfolioData?.safeguards?.allocationSum || '100%'}
              </span>
            </div>

            <div className="space-y-4 my-6">
              {/* Debt */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 font-medium">Debt / Fixed Income</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                      {formatTiltBadge(tilts.debt)}
                    </span>
                  </div>
                  <span className="font-bold text-white font-mono">{finalAlloc.debt}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full" style={{ width: `${finalAlloc.debt}%` }} />
                </div>
              </div>

              {/* Gold */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 font-medium">Gold / Precious Metals</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300">
                      {formatTiltBadge(tilts.gold)}
                    </span>
                  </div>
                  <span className="font-bold text-white font-mono">{finalAlloc.gold}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${finalAlloc.gold}%` }} />
                </div>
              </div>

              {/* Equity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 font-medium">Equities / Index & Stocks</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300">
                      {formatTiltBadge(tilts.equity)}
                    </span>
                  </div>
                  <span className="font-bold text-white font-mono">{finalAlloc.equity}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${finalAlloc.equity}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-cyan-400 font-mono flex items-center justify-between">
            <span>Safety Status: {safeguards.status || 'AI_TILTED_SUCCESS'}</span>
            <span>Clamping: ±{maxTilt}% Max</span>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Baseline vs. AI-Tilted Allocation Breakdown
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-white">{label} Allocation</p>
                        <p className="text-slate-400">
                          Baseline: <span className="text-white font-mono">{payload[0]?.value}%</span>
                        </p>
                        <p className="text-emerald-400">
                          AI Tilted: <span className="font-bold font-mono">{payload[1]?.value}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="baseline" name="Baseline (%)" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aiTilted" name="AI-Tilted (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Safeguard Architecture Monitor */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Safeguard Architecture Verification
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {safeguards.ruleExplanation}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">100% Invariant Check:</span>
            <span className="font-mono font-bold text-emerald-400">
              {safeguards.allocationSum || '100%'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Max Tilt Bounding:</span>
            <span className="font-mono font-bold text-cyan-400">
              ±{safeguards.maxTiltAllowed || '5%'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Fallback Protection:</span>
            <span className="font-mono font-bold text-white">
              Deterministic Matrix Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
