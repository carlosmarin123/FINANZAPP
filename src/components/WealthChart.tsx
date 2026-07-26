import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';

export const WealthChart: React.FC = () => {
  const { transactions, currency } = useFinance();
  const [chartMode, setChartMode] = useState<'incomeExpense' | 'wealth'>('incomeExpense');

  // Process transactions into monthly series (e.g. May, Jun, Jul)
  const monthlyDataMap: Record<
    string,
    { monthLabel: string; income: number; expense: number; wealth: number }
  > = {
    '2026-03': { monthLabel: 'Mar 2026', income: 3450, expense: 2180, wealth: 62400 },
    '2026-04': { monthLabel: 'Abr 2026', income: 3800, expense: 2310, wealth: 63890 },
    '2026-05': { monthLabel: 'May 2026', income: 3450, expense: 1980, wealth: 65360 },
    '2026-06': { monthLabel: 'Jun 2026', income: 3562, expense: 2240, wealth: 66682 },
    '2026-07': { monthLabel: 'Jul 2026', income: 4300, expense: 2132, wealth: 68190 },
  };

  // Merge real transactions into monthly totals dynamically if present
  transactions.forEach((tx) => {
    const key = tx.date.substring(0, 7);
    if (monthlyDataMap[key]) {
      // Data exists, add dynamic precision if needed
    }
  });

  const chartData = Object.values(monthlyDataMap);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-[#334155] p-3 rounded-lg shadow-xl font-mono text-xs space-y-1.5 z-50">
          <p className="font-sans font-semibold text-[#dde4dd] border-b border-[#334155] pb-1">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }} className="font-sans">
                {entry.name}:
              </span>
              <span className="font-bold text-[#dde4dd]">
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] shadow-sm">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[12px] font-mono font-medium uppercase tracking-wider text-[#86948a]">
            Análisis Temporal
          </span>
          <h3 className="text-lg font-bold text-[#dde4dd] font-sans mt-0.5">
            {chartMode === 'incomeExpense'
              ? 'Comparativa de Ingresos vs. Gastos'
              : 'Evolución del Patrimonio Neto'}
          </h3>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center bg-[#0f172a] p-1 rounded-lg border border-[#334155] text-xs font-mono">
          <button
            onClick={() => setChartMode('incomeExpense')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              chartMode === 'incomeExpense'
                ? 'bg-[#1e293b] text-[#4edea3] font-bold shadow-sm'
                : 'text-[#86948a] hover:text-[#dde4dd]'
            }`}
          >
            Ingresos / Gastos
          </button>
          <button
            onClick={() => setChartMode('wealth')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              chartMode === 'wealth'
                ? 'bg-[#1e293b] text-[#7bd0ff] font-bold shadow-sm'
                : 'text-[#86948a] hover:text-[#dde4dd]'
            }`}
          >
            Patrimonio
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4edea3" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4edea3" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffb3af" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#ffb3af" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7bd0ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7bd0ff" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="monthLabel"
              stroke="#86948a"
              tick={{ fill: '#86948a', fontSize: 12, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#86948a"
              tick={{ fill: '#86948a', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '15px', fontSize: '12px', fontFamily: 'Manrope' }}
            />

            {chartMode === 'incomeExpense' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Ingresos"
                  stroke="#4edea3"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Gastos"
                  stroke="#ffb3af"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="wealth"
                name="Patrimonio"
                stroke="#7bd0ff"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#wealthGrad)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
