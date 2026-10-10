import React, { useState, useEffect } from 'react';
import { advisoryAPI } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  PiggyBank,
  TrendingUp,
  ArrowRight,
  Loader2,
  Info,
  DollarSign,
  Building2,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdvisoryPage = () => {
  const { showToast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvisory = async () => {
      try {
        const res = await advisoryAPI.getAdvisoryReport();
        if (res.success && res.data) {
          setReport(res.data);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Running deterministic rules engine...</p>
      </div>
    );
  }

  const { cashflowSummary, emergencyFund, insurance } = report || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deterministic Advisory Rules Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Safety & Insurance Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Algorithmic assessment of your emergency liquidity, healthcare cover benchmarks, and insurance budgets.
          </p>
        </div>

        <Link
          to="/portfolio"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-90 transition-all shadow-md shadow-emerald-500/20"
        >
          <span>Proceed to AI Portfolio Allocation</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Cashflow Snapshot Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-8 backdrop-blur-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="pt-2 md:pt-0">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Total Monthly Inflow
            </span>
            <span className="text-xl font-bold text-white mt-1 block">
              ₹{(cashflowSummary?.totalMonthlyIncome || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="pt-2 md:pt-0">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Essential Outgo (Burn Rate)
            </span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">
              ₹{(cashflowSummary?.essentialExpenses || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="pt-2 md:pt-0">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Net Discretionary Cashflow
            </span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">
              ₹{(cashflowSummary?.monthlyDiscretionaryCashflow || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="pt-2 md:pt-0">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Savings Surplus Rate
            </span>
            <span className="text-xl font-bold text-cyan-400 mt-1 block">
              {cashflowSummary?.savingsRate || 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Module 1: Emergency Fund Gap Engine */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Emergency Fund Diagnostic</h2>
                  <p className="text-xs text-slate-400">
                    Mandatory Liquidity Buffer Assessment
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono border ${
                  emergencyFund?.severity === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : emergencyFund?.severity === 'warning'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {emergencyFund?.statusLabel}
              </span>
            </div>

            {/* Rule Multiplier Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-5 text-xs">
              <span className="font-semibold text-white block mb-0.5">
                Target Multiplier: {emergencyFund?.targetMultiplier}x Essential Expenses
              </span>
              <p className="text-slate-400">{emergencyFund?.ruleReason}</p>
            </div>

            {/* Fund Gauge Visual */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">
                  Current: <strong className="text-white">₹{(emergencyFund?.currentFund || 0).toLocaleString('en-IN')}</strong>
                </span>
                <span className="text-slate-400">
                  Target ({emergencyFund?.targetMultiplier}M): <strong className="text-white">₹{(emergencyFund?.targetFund || 0).toLocaleString('en-IN')}</strong>
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (emergencyFund?.fundingRatio || 0) >= 100
                      ? 'bg-emerald-500'
                      : (emergencyFund?.fundingRatio || 0) >= 40
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, emergencyFund?.fundingRatio || 0)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Coverage: {emergencyFund?.fundingRatio}% of Target</span>
                {emergencyFund?.fundingGap > 0 ? (
                  <span className="text-rose-400 font-semibold">
                    Gap to close: ₹{emergencyFund.fundingGap.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    Surplus: ₹{(emergencyFund?.surplus || 0).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Strategic Recommendations
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {emergencyFund?.recommendations?.map((rec, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Essential Monthly Burn</span>
            <span className="font-mono text-white">
              ₹{(emergencyFund?.essentialExpenses || 0).toLocaleString('en-IN')}/mo
            </span>
          </div>
        </div>

        {/* Module 2: Insurance Adequacy & Health Benchmarks */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Insurance Adequacy Benchmark</h2>
                  <p className="text-xs text-slate-400">
                    Location-Tiered Health & Pure Term Protection
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono border ${
                  insurance?.budgetStatus === 'optimal'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {insurance?.budgetStatus?.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {/* Benchmarks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Health Cover Benchmark ({insurance?.cityTier?.toUpperCase()})
                </span>
                <span className="text-base font-bold text-cyan-400 block">
                  {insurance?.healthCoverRange?.formatted}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Includes {insurance?.familyMultiplier}x family multiplier
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Pure Term Life Sum Assured
                </span>
                <span className="text-base font-bold text-emerald-400 block">
                  {insurance?.termLifeCoverRange?.formatted}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  10x – 15x annual income benchmark
                </span>
              </div>
            </div>

            {/* Premium Budget Analysis */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-5 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Optimal Monthly Premium Budget (5% - 8%):</span>
                <span className="font-bold text-white">{insurance?.premiumBudget?.recommendedRange}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Monthly Premium Outgo:</span>
                <span className="font-bold text-cyan-400">
                  ₹{(insurance?.currentMonthlyPremium || 0).toLocaleString('en-IN')}/mo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                {insurance?.budgetStatusMessage}
              </p>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Action Items
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {insurance?.recommendations?.map((rec, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Location Benchmark Tier</span>
            <span className="font-mono text-white capitalize">{insurance?.cityTier} Tier</span>
          </div>
        </div>
      </div>

      {/* Strategic Hierarchy Order */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400" />
          The Financial Hierarchy of Needs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-2">
              1
            </span>
            <h4 className="font-bold text-white mb-1">Liquidity Foundation</h4>
            <p className="text-slate-400">
              Never invest in volatile markets before fully satisfying your {emergencyFund?.targetMultiplier}x essential buffer.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-2">
              2
            </span>
            <h4 className="font-bold text-white mb-1">Catastrophic Risk Shield</h4>
            <p className="text-slate-400">
              Protect accumulated net worth against single-event hospitalization or premature loss of earning power.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold mb-2">
              3
            </span>
            <h4 className="font-bold text-white mb-1">AI-Assisted Compounding</h4>
            <p className="text-slate-400">
              Deploy monthly surplus into disciplined, sentiment-tilted multi-asset portfolios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryPage;