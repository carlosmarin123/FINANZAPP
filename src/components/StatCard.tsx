import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Currency } from '../types';

interface StatCardProps {
  title: string;
  amount: number;
  currency: Currency;
  icon: LucideIcon;
  trendPercent?: number;
  trendText?: string;
  type?: 'emerald' | 'sky' | 'rose' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  currency,
  icon: Icon,
  trendPercent,
  trendText,
  type = 'neutral',
}) => {
  const colorStyles = {
    emerald: {
      border: 'border-[#3c4a42] hover:border-[#4edea3]/50',
      iconBg: 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30',
      value: 'text-[#4edea3]',
      trend: 'text-[#4edea3] bg-[#4edea3]/10',
    },
    sky: {
      border: 'border-[#3c4a42] hover:border-[#7bd0ff]/50',
      iconBg: 'bg-[#7bd0ff]/10 text-[#7bd0ff] border-[#7bd0ff]/30',
      value: 'text-[#7bd0ff]',
      trend: 'text-[#7bd0ff] bg-[#7bd0ff]/10',
    },
    rose: {
      border: 'border-[#3c4a42] hover:border-[#ffb3af]/50',
      iconBg: 'bg-[#ffb3af]/10 text-[#ffb3af] border-[#ffb3af]/30',
      value: 'text-[#ffb3af]',
      trend: 'text-[#ffb3af] bg-[#ffb3af]/10',
    },
    neutral: {
      border: 'border-[#3c4a42] hover:border-[#86948a]',
      iconBg: 'bg-[#242c27] text-[#dde4dd] border-[#3c4a42]',
      value: 'text-[#dde4dd]',
      trend: 'text-[#bbcabf] bg-[#242c27]',
    },
  }[type];

  return (
    <div
      className={`bg-[#1e293b] p-6 rounded-xl border ${colorStyles.border} transition-all duration-200 shadow-sm flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[12px] font-mono font-medium tracking-wider uppercase text-[#86948a]">
            {title}
          </span>
          <div className={`text-2xl md:text-3xl font-bold font-mono tracking-tight mt-2 ${colorStyles.value}`}>
            {formatCurrency(amount, currency)}
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trendPercent !== undefined || trendText) && (
        <div className="mt-4 pt-3 border-t border-[#334155] flex items-center justify-between text-xs">
          {trendPercent !== undefined && (
            <span
              className={`font-mono font-medium px-2 py-0.5 rounded-full text-[11px] ${
                trendPercent >= 0
                  ? 'bg-[#4edea3]/15 text-[#4edea3]'
                  : 'bg-[#ffb3af]/15 text-[#ffb3af]'
              }`}
            >
              {trendPercent >= 0 ? `+${trendPercent.toFixed(1)}%` : `${trendPercent.toFixed(1)}%`}
            </span>
          )}
          {trendText && <span className="text-[#bbcabf] font-sans text-right">{trendText}</span>}
        </div>
      )}
    </div>
  );
};
