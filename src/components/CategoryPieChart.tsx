import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/formatters';

export const CategoryPieChart: React.FC = () => {
  const { transactions, categories, currency } = useFinance();

  // Aggregate current month expense transactions by category
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
        totalExpense += tx.amount;
      }
    });

    const items = categories
      .filter((cat) => cat.type === 'expense' && (map[cat.id] || 0) > 0)
      .map((cat) => {
        const amount = map[cat.id] || 0;
        const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return {
          id: cat.id,
          name: cat.name,
          amount,
          percent,
          color: cat.color,
          iconName: cat.iconName,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { items, totalExpense };
  }, [transactions, categories]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1e293b] border border-[#334155] p-2.5 rounded-lg shadow-xl font-mono text-xs">
          <p className="font-sans font-semibold text-[#dde4dd] flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: data.color }}
            />
            {data.name}
          </p>
          <div className="mt-1 flex items-center justify-between gap-4 text-[#86948a]">
            <span>Importe:</span>
            <span className="font-bold text-[#dde4dd]">
              {formatCurrency(data.amount, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[#86948a]">
            <span>Porcentaje:</span>
            <span className="font-bold text-[#4edea3]">{data.percent.toFixed(1)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[12px] font-mono font-medium uppercase tracking-wider text-[#86948a]">
              Distribución de Gastos
            </span>
            <h3 className="text-lg font-bold text-[#dde4dd] font-sans mt-0.5">
              Gastos por Categoría
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#86948a] font-sans block">Total Gastado</span>
            <span className="text-sm font-bold font-mono text-[#ffb3af]">
              {formatCurrency(categoryExpenses.totalExpense, currency)}
            </span>
          </div>
        </div>

        {/* Donut Chart */}
        {categoryExpenses.items.length > 0 ? (
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryExpenses.items}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {categoryExpenses.items.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} stroke="#1e293b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono text-[#86948a] uppercase">Categorías</span>
              <span className="text-base font-bold font-mono text-[#dde4dd]">
                {categoryExpenses.items.length}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-xs text-[#86948a] font-sans">
            Sin gastos registrados en el período actual
          </div>
        )}
      </div>

      {/* Top 4 Categories breakdown */}
      <div className="mt-4 space-y-2.5 pt-4 border-t border-[#334155]">
        {categoryExpenses.items.slice(0, 4).map((cat) => (
          <div key={cat.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="p-1 rounded-md bg-[#0f172a]"
                  style={{ color: cat.color }}
                >
                  <CategoryIcon name={cat.iconName} size={14} />
                </div>
                <span className="text-[#dde4dd] font-sans">{cat.name}</span>
              </div>
              <div className="font-mono text-right">
                <span className="text-[#dde4dd] font-medium mr-2">
                  {formatCurrency(cat.amount, currency)}
                </span>
                <span className="text-[#86948a] text-[11px]">{cat.percent.toFixed(0)}%</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
