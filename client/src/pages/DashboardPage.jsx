import React, { useState, useEffect } from 'react';
import { profileAPI } from '../api/client';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  Target,
  Shield,
  Briefcase,
  Sparkles,
  Save,
  Loader2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    income: { salary: 0, business: 0, investments: 0, other: 0 },
    expensesConsumption: {
      rent: 0,
      groceries: 0,
      transport: 0,
      utilities: 0,
      dining: 0,
      subscriptions: 0,
    },
    expensesCommitment: { loans: 0, emis: 0, creditCards: 0 },
    safety: { emergencyFundBalance: 0, activeInsurancePremiums: 0 },
    growth: { sips: 0, investments: 0, courses: 0 },
    goals: {
      goalName: '',
      targetAmount: 0,
      timeHorizonYears: 0,
      riskProfile: 'Moderate',
    },
    flags: { hasStableJob: false, hasStableIncome: false },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileAPI.getFinancialProfile();
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleNestedChange = (category, field, value) => {
    setProfile((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value === '' ? '' : (isNaN(Number(value)) ? value : Number(value)),
      },
    }));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    try {
      const sanitizedProfile = {
        ...profile,
        income: {
          salary: Number(profile.income?.salary) || 0,
          business: Number(profile.income?.business) || 0,
          investments: Number(profile.income?.investments) || 0,
          other: Number(profile.income?.other) || 0,
        },
        expensesConsumption: {
          rent: Number(profile.expensesConsumption?.rent) || 0,
          groceries: Number(profile.expensesConsumption?.groceries) || 0,
          transport: Number(profile.expensesConsumption?.transport) || 0,
          utilities: Number(profile.expensesConsumption?.utilities) || 0,
          dining: Number(profile.expensesConsumption?.dining) || 0,
          subscriptions: Number(profile.expensesConsumption?.subscriptions) || 0,
        },
        expensesCommitment: {
          loans: Number(profile.expensesCommitment?.loans) || 0,
          emis: Number(profile.expensesCommitment?.emis) || 0,
          creditCards: Number(profile.expensesCommitment?.creditCards) || 0,
        },
        safety: {
          emergencyFundBalance: Number(profile.safety?.emergencyFundBalance) || 0,
          activeInsurancePremiums: Number(profile.safety?.activeInsurancePremiums) || 0,
        },
        growth: {
          sips: Number(profile.growth?.sips) || 0,
          investments: Number(profile.growth?.investments) || 0,
          courses: Number(profile.growth?.courses) || 0,
        },
        goals: {
          ...profile.goals,
          goalName: profile.goals?.goalName || '',
          targetAmount: Number(profile.goals?.targetAmount) || 0,
          timeHorizonYears: Number(profile.goals?.timeHorizonYears) || 0,
        },
      };

      const res = await profileAPI.updateFinancialProfile(sanitizedProfile);
      if (res.success) {
        showToast('Financial intake profile saved successfully! Rules updated.', 'success');
        if (res.data) {
          setProfile(res.data);
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Calculations
  const inc = profile.income || {};
  const totalIncome =
    (Number(inc.salary) || 0) +
    (Number(inc.business) || 0) +
    (Number(inc.investments) || 0) +
    (Number(inc.other) || 0);

  const con = profile.expensesConsumption || {};
  const totalConsumption =
    (Number(con.rent) || 0) +
    (Number(con.groceries) || 0) +
    (Number(con.transport) || 0) +
    (Number(con.utilities) || 0) +
    (Number(con.dining) || 0) +
    (Number(con.subscriptions) || 0);

  const com = profile.expensesCommitment || {};
  const totalCommitments =
    (Number(com.loans) || 0) +
    (Number(com.emis) || 0) +
    (Number(com.creditCards) || 0);

  const essentialExpenses = totalConsumption + totalCommitments;
  const discretionarySurplus = totalIncome - essentialExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((discretionarySurplus / totalIncome) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading financial data intake...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Intake Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consolidate your income streams, consumption, commitments, safety buffers, and goals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/advisory"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
          >
            <span>Run Advisory Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-90 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Monthly Income"
          value={`₹${totalIncome.toLocaleString('en-IN')}`}
          subtitle="Salary + Business + Passive"
          icon={Wallet}
          badge="Inflow"
          badgeType="emerald"
        />
        <StatCard
          title="Essential Burn Rate"
          value={`₹${essentialExpenses.toLocaleString('en-IN')}`}
          subtitle="Consumption + Debt Commitments"
          icon={TrendingDown}
          badge="Essential"
          badgeType="amber"
        />
        <StatCard
          title="Monthly Discretionary"
          value={`₹${Math.max(0, discretionarySurplus).toLocaleString('en-IN')}`}
          subtitle="Available for SIP & Buffers"
          icon={PiggyBank}
          badge={`${savingsRate}% Savings Rate`}
          badgeType={savingsRate >= 20 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Goal Target"
          value={`₹${(profile.goals?.targetAmount || 0).toLocaleString('en-IN')}`}
          subtitle={`${profile.goals?.timeHorizonYears || 0}Y • ${profile.goals?.riskProfile || 'Moderate'}`}
          icon={Target}
          badge={profile.goals?.riskProfile || 'Moderate'}
          badgeType="cyan"
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Incomes & Stability Flags */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> 1. Monthly Inflows (₹ INR)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Salary / Wages
                </label>
                <input
                  type="number"
                  min="0"
                  value={profile.income?.salary ?? 0}
                  onChange={(e) => handleNestedChange('income', 'salary', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Business / Freelance Profits
                </label>
                <input
                  type="number"
                  min="0"
                  value={profile.income?.business ?? 0}
                  onChange={(e) => handleNestedChange('income', 'business', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Investment Dividends / Yields
                </label>
                <input
                  type="number"
                  min="0"
                  value={profile.income?.investments ?? 0}
                  onChange={(e) => handleNestedChange('income', 'investments', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Other Residual Income
                </label>
                <input
                  type="number"
                  min="0"
                  value={profile.income?.other ?? 0}
                  onChange={(e) => handleNestedChange('income', 'other', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Stability Flags */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Stability Flags
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Income volatility dictates your required emergency safety multiplier (3x vs 6x vs 12x months).
              </p>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={profile.flags?.hasStableJob ?? false}
                    onChange={(e) => handleNestedChange('flags', 'hasStableJob', e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-500 rounded bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Stable Employment</span>
                    <span className="text-[11px] text-slate-400">Salaried or established long-term contract</span>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={profile.flags?.hasStableIncome ?? false}
                    onChange={(e) => handleNestedChange('flags', 'hasStableIncome', e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-500 rounded bg-slate-900 border-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">Predictable Monthly Inflow</span>
                    <span className="text-[11px] text-slate-400">Regular cashflow with minimal seasonal swings</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Consumption Expenses & Commitments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consumption */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4" /> 2. Consumption Expenses (₹/Month)
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Total: ₹{totalConsumption.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rent / Housing</label>
                <input
                  type="number"
                  min="0"
                  value={profile.expensesConsumption?.rent ?? 0}
                  onChange={(e) => handleNestedChange('expensesConsumption', 'rent', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Groceries & Food</label>
                <input
                  type="number"
                  min="0"
                  value={profile.expensesConsumption?.groceries ?? 0}
                  onChange={(e) => handleNestedChange('expensesConsumption', 'groceries', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Transport / Fuel</label>
                <input
                  type="number"
                  min="0"
                  value={profile.expensesConsumption?.transport ?? 0}
                  onChange={(e) => handleNestedChange('expensesConsumption', 'transport', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Utilities / Bills</label>
                <input
                  type="number"
                  min="0"
                  value={profile.expensesConsumption?.utilities ?? 0}
                  onChange={(e) => handleNestedChange('expensesConsumption', 'utilities', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Dining & Leisure</label>
                <input
                  type="number"
                  min="0"
                  value={profile.expensesConsumption?.dining ?? 0}
                  onChange={(e) => handleNestedChange('expensesConsumption', 'dining', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subscriptions</label>
                <input
                  type="number"
                  min="0"
                  value={profile.expensesConsumption?.subscriptions ?? 0}
                  onChange={(e) => handleNestedChange('expensesConsumption', 'subscriptions', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Commitments */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" /> 3. Commitment Outgo (₹/Month)
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Total: ₹{totalCommitments.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Home / Personal Loans</label>
                <input
                  type="number"
                  min="0"
                  value={profile.expensesCommitment?.loans ?? 0}
                  onChange={(e) => handleNestedChange('expensesCommitment', 'loans', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Auto / Gadget EMIs</label>
                <input
                  type="number"
                  min="0"
                  value={profile.expensesCommitment?.emis ?? 0}
                  onChange={(e) => handleNestedChange('expensesCommitment', 'emis', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Credit Card Minimums</label>
                <input
                  type="number"
                  min="0"
                  value={profile.expensesCommitment?.creditCards ?? 0}
                  onChange={(e) => handleNestedChange('expensesCommitment', 'creditCards', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-4">
              Essential Expenses = Consumption (₹{totalConsumption.toLocaleString('en-IN')}) + Commitments (₹{totalCommitments.toLocaleString('en-IN')}) = <strong className="text-slate-300">₹{essentialExpenses.toLocaleString('en-IN')}</strong>.
            </p>
          </div>
        </div>

        {/* Section 3: Safety & Growth & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Safety Net */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> 4. Existing Safety Net
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Emergency Fund (Liquid)
                </label>
                <input
                  type="number"
                  min="0"
                  value={profile.safety?.emergencyFundBalance ?? 0}
                  onChange={(e) => handleNestedChange('safety', 'emergencyFundBalance', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Active Insurance Premiums (₹/mo)
                </label>
                <input
                  type="number"
                  min="0"
                  value={profile.safety?.activeInsurancePremiums ?? 0}
                  onChange={(e) => handleNestedChange('safety', 'activeInsurancePremiums', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Growth & Savings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> 5. Growth & SIPs (₹/mo)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Active Monthly SIPs
                </label>
                <input
                  type="number"
                  min="0"
                  value={profile.growth?.sips ?? 0}
                  onChange={(e) => handleNestedChange('growth', 'sips', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Other Monthly Investments
                </label>
                <input
                  type="number"
                  min="0"
                  value={profile.growth?.investments ?? 0}
                  onChange={(e) => handleNestedChange('growth', 'investments', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Goal & Risk Profile */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" /> 6. Target Goal & Risk
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={profile.goals?.goalName || ''}
                  onChange={(e) => handleNestedChange('goals', 'goalName', e.target.value)}
                  placeholder="e.g. Early Financial Freedom"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={profile.goals?.targetAmount ?? 0}
                    onChange={(e) => handleNestedChange('goals', 'targetAmount', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Horizon (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={profile.goals?.timeHorizonYears ?? 0}
                    onChange={(e) => handleNestedChange('goals', 'timeHorizonYears', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Risk Profile</label>
                <select
                  value={profile.goals?.riskProfile || 'Moderate'}
                  onChange={(e) => handleNestedChange('goals', 'riskProfile', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Action Footer */}
        <div className="pt-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Changes directly update your rules engine benchmarks and AI asset allocation matrix.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-90 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Financial Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardPage;
