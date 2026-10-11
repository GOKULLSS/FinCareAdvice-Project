import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'default', // 'emerald', 'cyan', 'amber', 'rose'
  className = '',
}) => {
  const badgeStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    default: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div
      className={`bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-sm hover:border-slate-700/80 transition-all ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
          </div>
        </div>

        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <Icon className="w-5 h-5 text-emerald-400" />
          </div>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/40">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {badge && (
            <span
              className={`px-2 py-0.5 rounded-md font-mono text-[11px] border ${
                badgeStyles[badgeType] || badgeStyles.default
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
