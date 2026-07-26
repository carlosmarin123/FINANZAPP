import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDateSpanish } from '../utils/formatters';
import { Transaction } from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Filter,
  Search,
  Trash2,
  Edit3,
  Calendar,
  X,
  Plus,
} from 'lucide-react';

export const TransactionList: React.FC = () => {
  const {
    filteredTransactions,
    categories,
    accounts,
    currency,
    filters,
    setFilters,
    deleteTransaction,
    setEditingTx,
    setIsAddTxModalOpen,
  } = useFinance();

  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);

  const getTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'income':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30">
            <ArrowDownLeft className="w-3 h-3" />
            Ingreso
          </span>
        );
      case 'expense':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#ffb3af]/15 text-[#ffb3af] border border-[#ffb3af]/30">
            <ArrowUpRight className="w-3 h-3" />
            Gasto
          </span>
        );
      case 'transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#7bd0ff]/15 text-[#7bd0ff] border border-[#7bd0ff]/30">
            <ArrowLeftRight className="w-3 h-3" />
            Traspaso
          </span>
        );
    }
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      categoryId: 'all',
      accountId: 'all',
      type: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'date-desc',
    });
  };

  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#334155] shadow-sm overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-[#334155] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[12px] font-mono font-medium uppercase tracking-wider text-[#86948a]">
              Registro Completo
            </span>
            <h3 className="text-xl font-bold text-[#dde4dd] font-sans mt-0.5">
              Movimientos Financieros ({filteredTransactions.length})
            </h3>
          </div>

          <button
            onClick={() => {
              setEditingTx(null);
              setIsAddTxModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-[#4edea3] hover:bg-[#3ebe8f] text-[#003824] font-semibold text-xs px-3.5 py-2 rounded-lg transition-all cursor-pointer font-sans"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo Movimiento</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86948a]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-[#0f172a] border border-[#334155] focus:border-[#7bd0ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#dde4dd] placeholder-[#86948a] outline-none font-sans"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as any }))}
            className="bg-[#0f172a] border border-[#334155] text-xs font-sans text-[#dde4dd] px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="all">Todos los tipos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
            <option value="transfer">Traspasos</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
            className="bg-[#0f172a] border border-[#334155] text-xs font-sans text-[#dde4dd] px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={filters.accountId}
            onChange={(e) => setFilters((prev) => ({ ...prev, accountId: e.target.value }))}
            className="bg-[#0f172a] border border-[#334155] text-xs font-sans text-[#dde4dd] px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="all">Todas las cuentas</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          <button
            onClick={clearFilters}
            className="bg-[#0f172a] hover:bg-[#2d3748] border border-[#334155] text-[#86948a] hover:text-[#dde4dd] text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Limpiar filtros</span>
          </button>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0f172a]/60 border-b border-[#334155] text-[11px] font-mono text-[#86948a] uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">FECHA</th>
              <th className="py-3 px-4 font-medium">BENEFICIARIO</th>
              <th className="py-3 px-4 font-medium">GLOSA</th>
              <th className="py-3 px-4 font-medium text-right">MONTO</th>
              <th className="py-3 px-4 font-medium text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155] text-xs font-sans">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';
                const beneficiaryName = tx.beneficiary || tx.description;
                const glosaDetail = tx.glosa || tx.notes || '—';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#2d3748] transition-colors group cursor-pointer"
                    onClick={() => setSelectedTxDetail(tx)}
                  >
                    {/* FECHA */}
                    <td className="py-3.5 px-4 font-mono text-[#dde4dd] text-xs font-semibold whitespace-nowrap">
                      {formatDateSpanish(tx.date, true)}
                    </td>

                    {/* BENEFICIARIO */}
                    <td className="py-3.5 px-4 font-semibold text-[#dde4dd] group-hover:text-[#4edea3] transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{beneficiaryName}</span>
                        {getTypeBadge(tx.type)}
                      </div>
                    </td>

                    {/* GLOSA */}
                    <td className="py-3.5 px-4 text-[#bbcabf] max-w-xs truncate" title={glosaDetail}>
                      {glosaDetail}
                    </td>

                    {/* MONTO */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm whitespace-nowrap">
                      <span
                        className={
                          isIncome
                            ? 'text-[#4edea3]'
                            : isExpense
                            ? 'text-[#ffb3af]'
                            : 'text-[#7bd0ff]'
                        }
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatCurrency(tx.amount, currency)}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td
                      className="py-3.5 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setEditingTx(tx);
                            setIsAddTxModalOpen(true);
                          }}
                          title="Editar"
                          className="p-1.5 rounded-md hover:bg-[#0f172a] text-[#86948a] hover:text-[#7bd0ff] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar movimiento "${tx.description}"?`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          title="Eliminar"
                          className="p-1.5 rounded-md hover:bg-[#0f172a] text-[#86948a] hover:text-[#ffb3af] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#86948a] font-sans">
                  No se encontraron registros en el CSV con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#334155] pb-3">
              <h4 className="font-bold text-lg text-[#dde4dd] font-sans">
                Detalle del Movimiento
              </h4>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="text-[#86948a] hover:text-[#dde4dd] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-sm">
              <div className="bg-[#0f172a] p-4 rounded-lg border border-[#334155] text-center">
                <span className="text-xs font-mono text-[#86948a] uppercase block">Importe</span>
                <span
                  className={`text-2xl font-bold font-mono mt-1 block ${
                    selectedTxDetail.type === 'income'
                      ? 'text-[#4edea3]'
                      : selectedTxDetail.type === 'expense'
                      ? 'text-[#ffb3af]'
                      : 'text-[#7bd0ff]'
                  }`}
                >
                  {formatCurrency(selectedTxDetail.amount, currency)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#86948a] block">Concepto</span>
                  <span className="font-semibold text-[#dde4dd]">{selectedTxDetail.description}</span>
                </div>
                <div>
                  <span className="text-[#86948a] block">Fecha</span>
                  <span className="font-mono text-[#dde4dd]">{formatDateSpanish(selectedTxDetail.date)}</span>
                </div>
                <div>
                  <span className="text-[#86948a] block">Categoría</span>
                  <span className="text-[#dde4dd]">
                    {categories.find((c) => c.id === selectedTxDetail.categoryId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-[#86948a] block">Cuenta</span>
                  <span className="font-mono text-[#dde4dd]">
                    {accounts.find((a) => a.id === selectedTxDetail.accountId)?.name}
                  </span>
                </div>
              </div>

              {selectedTxDetail.tags && selectedTxDetail.tags.length > 0 && (
                <div>
                  <span className="text-xs text-[#86948a] block mb-1">Etiquetas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTxDetail.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono bg-[#242c27] text-[#4edea3] px-2 py-0.5 rounded-md border border-[#3c4a42]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#334155]">
              <button
                onClick={() => {
                  setEditingTx(selectedTxDetail);
                  setSelectedTxDetail(null);
                  setIsAddTxModalOpen(true);
                }}
                className="bg-[#242c27] hover:bg-[#2f3632] border border-[#3c4a42] text-[#7bd0ff] px-3.5 py-1.5 rounded-lg text-xs font-semibold"
              >
                Editar
              </button>
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="bg-[#4edea3] text-[#003824] px-4 py-1.5 rounded-lg text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
