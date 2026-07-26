import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';
import { AlertTriangle, CheckCircle2, Edit2, Plus, PieChart } from 'lucide-react';

export const BudgetSection: React.FC = () => {
  const { budgets, categories, transactions, currency, saveBudget } = useFinance();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newLimitInput, setNewLimitInput] = useState('');

  // Calculate current month expenses per category
  const expenseMap: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      expenseMap[tx.categoryId] = (expenseMap[tx.categoryId] || 0) + tx.amount;
    }
  });

  const budgetList = categories
    .filter((cat) => cat.type === 'expense')
    .map((cat) => {
      const budget = budgets.find((b) => b.categoryId === cat.id);
      const limit = budget ? budget.monthlyLimit : cat.budgetLimit || 0;
      const spent = expenseMap[cat.id] || 0;
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      const isOver = spent > limit && limit > 0;
      const isWarning = percent >= 80 && !isOver;

      return {
        category: cat,
        limit,
        spent,
        percent,
        isOver,
        isWarning,
      };
    });

  const handleSaveBudget = (catId: string) => {
    const parsed = parseFloat(newLimitInput);
    if (!isNaN(parsed) && parsed >= 0) {
      saveBudget(catId, parsed);
    }
    setEditingCategoryId(null);
    setNewLimitInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#7bd0ff]" />
            <h3 className="text-xl font-bold text-[#dde4dd] font-sans">
              Control Presupuestario Mensual
            </h3>
          </div>
          <p className="text-xs text-[#bbcabf] font-sans mt-1">
            Establece límites de gasto por categoría para asegurar tu tasa de ahorro objetivo.
          </p>
        </div>
      </div>

      {/* Grid of Category Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetList.map((item) => {
          const { category, limit, spent, percent, isOver, isWarning } = item;
          const isEditing = editingCategoryId === category.id;

          return (
            <div
              key={category.id}
              className={`bg-[#1e293b] p-5 rounded-xl border transition-all shadow-sm ${
                isOver
                  ? 'border-[#ffb3af]/60 bg-[#ffb3af]/5'
                  : isWarning
                  ? 'border-[#fbbf24]/50 bg-[#fbbf24]/5'
                  : 'border-[#334155] hover:border-[#86948a]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#334155]"
                    style={{ backgroundColor: `${category.color}15`, color: category.color }}
                  >
                    <CategoryIcon name={category.iconName} size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#dde4dd] font-sans">{category.name}</h4>
                    <span className="text-[11px] font-mono text-[#86948a]">
                      Gastado: {formatCurrency(spent, currency)}
                    </span>
                  </div>
                </div>

                {isOver ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#ffb3af]/20 text-[#ffb3af] px-2 py-0.5 rounded-full border border-[#ffb3af]/40">
                    <AlertTriangle className="w-3 h-3" />
                    Excedido
                  </span>
                ) : isWarning ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#fbbf24]/20 text-[#fbbf24] px-2 py-0.5 rounded-full border border-[#fbbf24]/40">
                    <AlertTriangle className="w-3 h-3" />
                    Alerta 80%
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#4edea3]/20 text-[#4edea3] px-2 py-0.5 rounded-full border border-[#4edea3]/40">
                    <CheckCircle2 className="w-3 h-3" />
                    Bajo Control
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#86948a] text-[11px]">Progreso</span>
                  <span
                    className={`font-bold ${
                      isOver ? 'text-[#ffb3af]' : isWarning ? 'text-[#fbbf24]' : 'text-[#4edea3]'
                    }`}
                  >
                    {percent.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0f172a] rounded-full overflow-hidden border border-[#334155]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-[#ffb3af]' : isWarning ? 'bg-[#fbbf24]' : 'bg-[#4edea3]'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Limit Footer & Edit Form */}
              <div className="mt-4 pt-3 border-t border-[#334155] flex items-center justify-between text-xs font-mono">
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="number"
                      placeholder={`Límite ${getCurrencySymbol(currency)}`}
                      value={newLimitInput}
                      onChange={(e) => setNewLimitInput(e.target.value)}
                      className="w-24 bg-[#0f172a] border border-[#7bd0ff] rounded px-2 py-1 text-xs text-[#dde4dd]"
                    />
                    <button
                      onClick={() => handleSaveBudget(category.id)}
                      className="bg-[#4edea3] text-[#003824] px-2.5 py-1 rounded text-[11px] font-bold"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditingCategoryId(null)}
                      className="text-[#86948a] hover:text-[#dde4dd]"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-[#86948a]">
                      Límite:{' '}
                      <strong className="text-[#dde4dd]">
                        {limit > 0 ? formatCurrency(limit, currency) : 'Sin límite'}
                      </strong>
                    </span>
                    <button
                      onClick={() => {
                        setEditingCategoryId(category.id);
                        setNewLimitInput(limit.toString());
                      }}
                      className="text-[#7bd0ff] hover:underline flex items-center gap-1 font-sans text-[11px]"
                    >
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
