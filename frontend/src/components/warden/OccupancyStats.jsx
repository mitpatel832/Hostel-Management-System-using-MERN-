import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-brass-50 text-brass-600 border-brass-200/60',
  trend,
  trendPositive = true
}) => {
  return (
    <div className="bg-white rounded-2xl border border-ledger-200/60 shadow-card hover:shadow-card-hover p-5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-ledger-500 uppercase tracking-[0.1em] font-sans">
          {title}
        </span>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shadow-xs ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-2xl sm:text-3xl font-black font-display text-ink tracking-tight">
          {value}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-ledger-500 font-medium truncate font-sans">{subtitle}</p>
          {trend && (
            <span
              className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md font-sans ${
                trendPositive
                  ? 'bg-sage-50 text-sage-700'
                  : 'bg-danger-light text-danger'
              }`}
            >
              {trendPositive ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              )}
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
