import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoal } from '../types';
import { formatCurrency, formatDateSpanish, getCurrencySymbol } from '../utils/formatters';
import { Target, Plus, PiggyBank, Calendar, X, Check } from 'lucide-react';

export const GoalsSection: React.FC = () => {
  const { goals, accounts, currency, addGoal, depositToGoal } = useFinance();
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);

  // New Goal Form
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('2027-12-31');
  const [category, setCategory] = useState('General');

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!title.trim() || isNaN(target) || target <= 0) {
      alert('Introduce un título y una meta económica válida.');
      return;
    }

    addGoal({
      title: title.trim(),
      targetAmount: target,
      currentAmount: parseFloat(currentAmount) || 0,
      deadline,
      category,
      color: '#4edea3',
    });

    setIsAddGoalOpen(false);
    setTitle('');
    setTargetAmount('');
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepositGoal) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0 || !selectedAccountId) {
      alert('Introduce un importe válido y selecciona la cuenta de origen.');
      return;
    }

    depositToGoal(activeDepositGoal.id, amt, selectedAccountId);
    setActiveDepositGoal(null);
    setDepositAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#4edea3]" />
            <h3 className="text-xl font-bold text-[#dde4dd] font-sans">
              Metas de Ahorro e Inversión
            </h3>
          </div>
          <p className="text-xs text-[#bbcabf] font-sans mt-1">
            Visualiza tu progreso hacia tus objetivos financieros clave a corto y largo plazo.
          </p>
        </div>

        <button
          onClick={() => setIsAddGoalOpen(true)}
          className="bg-[#4edea3] hover:bg-[#3ebe8f] text-[#003824] px-4 py-2 rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Crear Nueva Meta</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className={`bg-[#1e293b] p-6 rounded-xl border transition-all shadow-sm flex flex-col justify-between ${
                isCompleted
                  ? 'border-[#4edea3]/60 bg-[#4edea3]/5'
                  : 'border-[#334155] hover:border-[#86948a]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase bg-[#0f172a] text-[#7bd0ff] px-2.5 py-1 rounded-full border border-[#334155]">
                    {goal.category}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#4edea3]/20 text-[#4edea3] px-2 py-0.5 rounded-full border border-[#4edea3]/40">
                      <Check className="w-3 h-3" />
                      Completado
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-base text-[#dde4dd] font-sans">{goal.title}</h4>
                {goal.notes && (
                  <p className="text-xs text-[#86948a] font-sans mt-1">{goal.notes}</p>
                )}
              </div>

              <div className="mt-6 space-y-3">
                {/* Numbers */}
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#86948a] uppercase block">
                      Ahorrado
                    </span>
                    <span className="text-lg font-bold font-mono text-[#4edea3]">
                      {formatCurrency(goal.currentAmount, currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#86948a] uppercase block">
                      Objetivo
                    </span>
                    <span className="text-sm font-bold font-mono text-[#dde4dd]">
                      {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-[#86948a]">
                    <span>Fecha límite: {formatDateSpanish(goal.deadline)}</span>
                    <span className="text-[#4edea3] font-bold">{percent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0f172a] rounded-full overflow-hidden border border-[#334155]">
                    <div
                      className="h-full bg-[#4edea3] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Deposit action button */}
                {!isCompleted && (
                  <button
                    onClick={() => setActiveDepositGoal(goal)}
                    className="w-full mt-2 bg-[#0f172a] hover:bg-[#2d3748] border border-[#334155] text-[#4edea3] py-2 rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <PiggyBank className="w-4 h-4" />
                    <span>Hacer Aportación</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <h4 className="font-bold text-lg text-[#dde4dd] font-sans">Nueva Meta de Ahorro</h4>
              <button
                onClick={() => setIsAddGoalOpen(false)}
                className="text-[#86948a] hover:text-[#dde4dd]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[#86948a] font-mono mb-1">Título de la Meta *</label>
                <input
                  type="text"
                  placeholder="p.ej. Fondo de Emergencia, Vacaciones..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#0f172a] border border-[#334155] text-[#dde4dd] px-3 py-2 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86948a] font-mono mb-1">
                    Objetivo ({getCurrencySymbol(currency)}) *
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    className="w-full bg-[#0f172a] border border-[#334155] text-[#4edea3] font-mono font-bold px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#86948a] font-mono mb-1">
                    Monto Actual ({getCurrencySymbol(currency)})
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] text-[#dde4dd] font-mono px-3 py-2 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#86948a] font-mono mb-1">Fecha Límite *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full bg-[#0f172a] border border-[#334155] text-[#dde4dd] font-mono px-3 py-2 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="px-4 py-2 bg-[#0f172a] text-[#86948a] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4edea3] text-[#003824] font-bold rounded-lg"
                >
                  Crear Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {activeDepositGoal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <h4 className="font-bold text-lg text-[#dde4dd] font-sans">
                Aportar a: {activeDepositGoal.title}
              </h4>
              <button
                onClick={() => setActiveDepositGoal(null)}
                className="text-[#86948a] hover:text-[#dde4dd]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[#86948a] font-mono mb-1">Cuenta de Origen</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#334155] text-[#dde4dd] px-3 py-2 rounded-lg outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatCurrency(a.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#86948a] font-mono mb-1">
                  Importe de la Aportación ({getCurrencySymbol(currency)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="200.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  className="w-full bg-[#0f172a] border border-[#334155] text-[#4edea3] font-mono font-bold text-lg px-3 py-2 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setActiveDepositGoal(null)}
                  className="px-4 py-2 bg-[#0f172a] text-[#86948a] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4edea3] text-[#003824] font-bold rounded-lg"
                >
                  Confirmar Aportación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
