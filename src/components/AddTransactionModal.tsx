import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { X, Plus, Save } from 'lucide-react';

export const AddTransactionModal: React.FC = () => {
  const {
    isAddTxModalOpen,
    setIsAddTxModalOpen,
    editingTx,
    setEditingTx,
    categories,
    accounts,
    currency,
    addTransaction,
    updateTransaction,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type);
      setDescription(editingTx.description);
      setAmount(editingTx.amount.toString());
      setCategoryId(editingTx.categoryId);
      setAccountId(editingTx.accountId);
      setToAccountId(editingTx.toAccountId || '');
      setDate(editingTx.date);
      setTagsInput(editingTx.tags ? editingTx.tags.join(', ') : '');
      setNotes(editingTx.notes || '');
    } else {
      // Defaults
      setType('expense');
      setDescription('');
      setAmount('');
      setCategoryId(categories.find((c) => c.type === 'expense')?.id || '');
      setAccountId(accounts[0]?.id || '');
      setToAccountId('');
      setDate(new Date().toISOString().split('T')[0]);
      setTagsInput('');
      setNotes('');
    }
  }, [editingTx, isAddTxModalOpen, categories, accounts]);

  if (!isAddTxModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor introduce un importe válido mayor que 0');
      return;
    }

    if (!description.trim()) {
      alert('Por favor introduce una descripción para el movimiento');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingTx) {
      updateTransaction({
        ...editingTx,
        type,
        description: description.trim(),
        amount: parsedAmount,
        categoryId: categoryId || categories[0].id,
        accountId: accountId || accounts[0].id,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        tags,
        notes,
      });
    } else {
      addTransaction({
        type,
        description: description.trim(),
        amount: parsedAmount,
        categoryId: categoryId || categories[0].id,
        accountId: accountId || accounts[0].id,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date,
        tags,
        notes,
        status: 'completed',
      });
    }

    setIsAddTxModalOpen(false);
    setEditingTx(null);
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#334155] pb-3">
          <h3 className="font-bold text-lg text-[#dde4dd] font-sans">
            {editingTx ? 'Editar Movimiento' : 'Añadir Nuevo Movimiento'}
          </h3>
          <button
            onClick={() => {
              setIsAddTxModalOpen(false);
              setEditingTx(null);
            }}
            className="text-[#86948a] hover:text-[#dde4dd] p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#0f172a] rounded-lg border border-[#334155]">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const firstExp = categories.find((c) => c.type === 'expense');
                if (firstExp) setCategoryId(firstExp.id);
              }}
              className={`py-2 rounded-md font-semibold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#ffb3af]/20 text-[#ffb3af] border border-[#ffb3af]/40'
                  : 'text-[#86948a] hover:text-[#dde4dd]'
              }`}
            >
              Gasto (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const firstInc = categories.find((c) => c.type === 'income');
                if (firstInc) setCategoryId(firstInc.id);
              }}
              className={`py-2 rounded-md font-semibold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/40'
                  : 'text-[#86948a] hover:text-[#dde4dd]'
              }`}
            >
              Ingreso (+)
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-2 rounded-md font-semibold transition-all cursor-pointer ${
                type === 'transfer'
                  ? 'bg-[#7bd0ff]/20 text-[#7bd0ff] border border-[#7bd0ff]/40'
                  : 'text-[#86948a] hover:text-[#dde4dd]'
              }`}
            >
              Traspaso (⇄)
            </button>
          </div>

          {/* Amount & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#86948a] font-mono text-[11px] uppercase mb-1">
                Importe *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#0f172a] border border-[#334155] focus:border-[#4edea3] rounded-lg px-3 py-2 text-base font-mono text-[#4edea3] font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-[#86948a] font-mono text-[11px] uppercase mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-[#0f172a] border border-[#334155] focus:border-[#7bd0ff] rounded-lg px-3 py-2 text-xs font-mono text-[#dde4dd] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#86948a] font-mono text-[11px] uppercase mb-1">
              Concepto / Descripción *
            </label>
            <input
              type="text"
              placeholder="p.ej. Compra Supermercado Mercadona"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-[#0f172a] border border-[#334155] focus:border-[#7bd0ff] rounded-lg px-3 py-2 text-sm text-[#dde4dd] outline-none"
            />
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {type !== 'transfer' && (
              <div>
                <label className="block text-[#86948a] font-mono text-[11px] uppercase mb-1">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#334155] text-xs text-[#dde4dd] px-3 py-2 rounded-lg outline-none"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={type === 'transfer' ? 'col-span-1' : ''}>
              <label className="block text-[#86948a] font-mono text-[11px] uppercase mb-1">
                {type === 'transfer' ? 'Cuenta Origen' : 'Cuenta'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] text-xs text-[#dde4dd] px-3 py-2 rounded-lg outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatCurrency(a.balance, currency)})
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="block text-[#86948a] font-mono text-[11px] uppercase mb-1">
                  Cuenta Destino
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#334155] text-xs text-[#dde4dd] px-3 py-2 rounded-lg outline-none"
                >
                  <option value="">Seleccionar cuenta...</option>
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatCurrency(a.balance, currency)})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[#86948a] font-mono text-[11px] uppercase mb-1">
              Etiquetas (separadas por coma)
            </label>
            <input
              type="text"
              placeholder="p.ej. Casa, Comida, Trabajo"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#334155] focus:border-[#7bd0ff] rounded-lg px-3 py-2 text-xs text-[#dde4dd] outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#334155]">
            <button
              type="button"
              onClick={() => {
                setIsAddTxModalOpen(false);
                setEditingTx(null);
              }}
              className="px-4 py-2 rounded-lg bg-[#0f172a] hover:bg-[#2d3748] border border-[#334155] text-[#86948a] font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#4edea3] hover:bg-[#3ebe8f] text-[#003824] font-bold flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{editingTx ? 'Guardar Cambios' : 'Registrar Movimiento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
