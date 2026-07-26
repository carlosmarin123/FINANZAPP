import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Account } from '../types';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';
import {
  Wallet,
  Building2,
  CreditCard,
  TrendingUp,
  Plus,
  ArrowLeftRight,
  ShieldCheck,
  X,
  PlusCircle,
} from 'lucide-react';

export const AccountsSection: React.FC = () => {
  const { accounts, currency, addAccount, addTransaction } = useFinance();
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // New account state
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('bank');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [maskedNum, setMaskedNum] = useState('•••• 1234');

  // Quick transfer state
  const [fromAccId, setFromAccId] = useState(accounts[0]?.id || '');
  const [toAccId, setToAccId] = useState(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const initialBalance = parseFloat(balance) || 0;

    addAccount({
      name: name.trim(),
      type,
      balance: initialBalance,
      accountNumberMasked: maskedNum || '•••• 0000',
      color: type === 'bank' ? '#4edea3' : type === 'investment' ? '#7bd0ff' : '#ffb3af',
      institution: institution || 'Entidad Bancaria',
    });

    setIsAddAccountOpen(false);
    setName('');
    setBalance('');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || !fromAccId || !toAccId || fromAccId === toAccId) {
      alert('Por favor selecciona cuentas de origen y destino válidas e introduce un importe.');
      return;
    }

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      description: `Traspaso entre cuentas`,
      categoryId: 'cat-inversiones-div',
      amount: amt,
      type: 'transfer',
      accountId: fromAccId,
      toAccountId: toAccId,
      tags: ['Traspaso', 'Interno'],
      status: 'completed',
    });

    setIsTransferOpen(false);
    setTransferAmount('');
  };

  const getTypeIcon = (type: Account['type']) => {
    switch (type) {
      case 'bank':
        return Building2;
      case 'investment':
        return TrendingUp;
      case 'card':
        return CreditCard;
      default:
        return Wallet;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[12px] font-mono font-medium uppercase tracking-wider text-[#86948a]">
            Cuentas & Activos
          </span>
          <h3 className="text-xl font-bold text-[#dde4dd] font-sans mt-0.5">
            Estructura de Capital ({accounts.length} Cuentas)
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="bg-[#0f172a] hover:bg-[#2d3748] border border-[#334155] text-[#7bd0ff] px-4 py-2 rounded-lg text-xs font-semibold font-sans flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Traspaso entre Cuentas</span>
          </button>

          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="bg-[#4edea3] hover:bg-[#3ebe8f] text-[#003824] px-4 py-2 rounded-lg text-xs font-bold font-sans flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva Cuenta</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = getTypeIcon(acc.type);
          const isNegative = acc.balance < 0;

          return (
            <div
              key={acc.id}
              className="bg-[#1e293b] p-6 rounded-xl border border-[#334155] hover:border-[#86948a] transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#334155]"
                    style={{ backgroundColor: `${acc.color}15`, color: acc.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-[#0f172a] text-[#86948a] px-2.5 py-1 rounded-full border border-[#334155]">
                    {acc.type}
                  </span>
                </div>

                <h4 className="font-bold text-base text-[#dde4dd] font-sans">{acc.name}</h4>
                <p className="text-xs text-[#86948a] font-mono mt-0.5">{acc.institution || 'Banco'}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#334155] flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#86948a] uppercase block">
                    {acc.accountNumberMasked}
                  </span>
                  <span className="text-xs text-[#bbcabf] font-sans flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
                    Protegida
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#86948a] uppercase block">
                    Saldo Actual
                  </span>
                  <span
                    className={`text-xl font-bold font-mono ${
                      isNegative ? 'text-[#ffb3af]' : 'text-[#4edea3]'
                    }`}
                  >
                    {formatCurrency(acc.balance, currency)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <h4 className="font-bold text-lg text-[#dde4dd] font-sans">Añadir Cuenta o Tarjeta</h4>
              <button
                onClick={() => setIsAddAccountOpen(false)}
                className="text-[#86948a] hover:text-[#dde4dd]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[#86948a] font-mono mb-1">Nombre de la Cuenta *</label>
                <input
                  type="text"
                  placeholder="p.ej. Banco Santander Nomina"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#0f172a] border border-[#334155] text-[#dde4dd] px-3 py-2 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-[#86948a] font-mono mb-1">Tipo de Activo</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Account['type'])}
                  className="w-full bg-[#0f172a] border border-[#334155] text-[#dde4dd] px-3 py-2 rounded-lg outline-none"
                >
                  <option value="bank">Cuenta Bancaria</option>
                  <option value="investment">Fondo / Inversión</option>
                  <option value="card">Tarjeta de Crédito</option>
                  <option value="cash">Efectivo</option>
                  <option value="crypto">Criptoactivos</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#86948a] font-mono mb-1">
                    Saldo Inicial ({getCurrencySymbol(currency)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] text-[#4edea3] font-mono font-bold px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#86948a] font-mono mb-1">Enmascarado</label>
                  <input
                    type="text"
                    placeholder="•••• 5678"
                    value={maskedNum}
                    onChange={(e) => setMaskedNum(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] text-[#dde4dd] font-mono px-3 py-2 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#86948a] font-mono mb-1">Entidad Financiera</label>
                <input
                  type="text"
                  placeholder="p.ej. Santander, BBVA, Degiro"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#334155] text-[#dde4dd] px-3 py-2 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 bg-[#0f172a] text-[#86948a] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4edea3] text-[#003824] font-bold rounded-lg"
                >
                  Guardar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <h4 className="font-bold text-lg text-[#dde4dd] font-sans">Traspaso Interno</h4>
              <button
                onClick={() => setIsTransferOpen(false)}
                className="text-[#86948a] hover:text-[#dde4dd]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[#86948a] font-mono mb-1">Desde la Cuenta</label>
                <select
                  value={fromAccId}
                  onChange={(e) => setFromAccId(e.target.value)}
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
                <label className="block text-[#86948a] font-mono mb-1">Hacia la Cuenta</label>
                <select
                  value={toAccId}
                  onChange={(e) => setToAccId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#334155] text-[#dde4dd] px-3 py-2 rounded-lg outline-none"
                >
                  {accounts
                    .filter((a) => a.id !== fromAccId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatCurrency(a.balance, currency)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[#86948a] font-mono mb-1">
                  Importe a Traspasar ({getCurrencySymbol(currency)})
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  required
                  className="w-full bg-[#0f172a] border border-[#334155] text-[#7bd0ff] font-mono font-bold text-lg px-3 py-2 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 bg-[#0f172a] text-[#86948a] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7bd0ff] text-[#00354a] font-bold rounded-lg"
                >
                  Ejecutar Traspaso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
