import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import { useToast } from '../context/ToastContext';
import { User, MapPin, Users, Shield, Save, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age ? user.age : '',
    cityTier: user?.cityTier || 'metro',
    dependents: user?.dependents ?? 0,
    hasFamily: user?.hasFamily ?? false,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authAPI.updateDemographics({
        ...formData,
        age: formData.age !== '' ? Number(formData.age) : 0,
        dependents: formData.dependents !== '' ? Number(formData.dependents) : 0,
      });
      if (res.success && res.user) {
        updateUser(res.user);
        showToast('Demographic parameters updated! Recalculating advisory benchmarks.', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getTierBenchmarkLabel = (tier) => {
    if (tier === 'metro') return '₹15L – ₹50L Base Cover';
    if (tier === 'tier2') return '₹10L – ₹25L Base Cover';
    return '₹5L – ₹15L Base Cover';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Demographic Profile & Rules Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Demographic parameters calibrate the deterministic advisory engine's target multiples.
          </p>
        </div>

        <Link
          to="/advisory"
          className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
        >
          <span>View Advisory Diagnostics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Update Form */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <h2 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Personal Demographic Inputs</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 28"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  City Tier / Healthcare Zone
                </label>
                <select
                  name="cityTier"
                  value={formData.cityTier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="metro">Metro (Tier 1: Delhi, Mumbai, Bengaluru, etc.)</option>
                  <option value="tier2">Tier 2 (Pune, Ahmedabad, Chandigarh, etc.)</option>
                  <option value="town">Town / Rural Center</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Number of Dependents
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Children, non-earning parents, or spouse.
                </p>
              </div>

              <div className="flex flex-col justify-center">
                <div className="flex items-start space-x-2 pt-4">
                  <input
                    type="checkbox"
                    id="hasFamilyToggle"
                    name="hasFamily"
                    checked={formData.hasFamily}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 text-emerald-500 rounded bg-slate-950 border-slate-700 focus:ring-emerald-500"
                  />
                  <label htmlFor="hasFamilyToggle" className="text-xs text-slate-300 cursor-pointer">
                    Family Floater Active (Applies 2x health insurance multiplier)
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-90 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Updating...' : 'Save Demographics'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Rules Diagnostic Impact Sidebar */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Calculated Rule Multipliers
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400">Emergency Fund Target Buffer:</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {formData.dependents > 0 || formData.hasFamily ? '6x - 12x Months' : '3x Months'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {formData.dependents > 0 || formData.hasFamily
                    ? 'Expanded buffer applied due to family dependencies.'
                    : 'Standard baseline buffer for self-contained earner.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400">Healthcare Cover Benchmark:</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {formData.hasFamily || formData.dependents > 0
                    ? `2x Floater: ${getTierBenchmarkLabel(formData.cityTier).replace('Base', 'Family')}`
                    : getTierBenchmarkLabel(formData.cityTier)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Calibrated for {formData.cityTier.toUpperCase()} healthcare inflation and hospitalization indices.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400">Term Life Benchmark:</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {formData.dependents > 0 || formData.hasFamily ? '10x – 15x Annual Income' : 'Optional / Self-Cover'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
