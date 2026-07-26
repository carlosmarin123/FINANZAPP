import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { Currency, TimePeriod } from '../types';
import { Menu, Sparkles, Search, Plus, Bell } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const {
    selectedTab,
    currency,
    setCurrency,
    timePeriod,
    setTimePeriod,
    setIsAddTxModalOpen,
    setIsAiPanelOpen,
    filters,
    setFilters,
  } = useFinance();

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Resumen General',
      subtitle: 'Visión consolidada de patrimonio, ingresos y liquidez',
    },
    transactions: {
      title: 'Historial de Movimientos',
      subtitle: 'Registro detallado, categorización y búsquedas',
    },
    budgets: {
      title: 'Presupuestos y Control',
      subtitle: 'Límites mensuales de gasto por categoría',
    },
    accounts: {
      title: 'Cuentas e Inversiones',
      subtitle: 'Saldos bancarios, tarjetas y fondos de inversión',
    },
    goals: {
      title: 'Metas de Ahorro',
      subtitle: 'Planes de ahorro a corto y largo plazo',
    },
    analytics: {
      title: 'Analítica y Tendencias',
      subtitle: 'Gráficos avanzados de comportamiento financiero',
    },
    'ai-advisor': {
      title: 'Asistente Financiero IA',
      subtitle: 'Recomendaciones inteligentes personalizadas',
    },
  };

  const currentInfo = titleMap[selectedTab] || {
    title: 'FinanzApp',
    subtitle: 'Gestión Financiera',
  };

  const currencies: { code: Currency; symbol: string; label: string }[] = [
    { code: 'BOB', symbol: 'Bs.', label: 'BOB (Bs. Bolivianos)' },
    { code: 'USD', symbol: '$', label: 'USD ($ Dólares)' },
  ];

  const periods: TimePeriod[] = ['1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <header className="sticky top-0 z-30 bg-[#0e1511]/90 backdrop-blur-md border-b border-[#3c4a42] px-4 md:px-8 py-4">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Mobile Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-lg bg-[#1a211d] border border-[#3c4a42] text-[#dde4dd] hover:text-[#4edea3]"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#dde4dd] font-sans">
                {currentInfo.title}
              </h2>
              <p className="text-xs text-[#bbcabf] font-sans hidden sm:block">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Mobile Quick Action */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="p-2 rounded-lg bg-[#4edea3] text-[#003824]"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Controls: Period, Currency, Search, AI */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-48 md:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#86948a]" />
            <input
              type="text"
              placeholder="Buscar p.ej. Mercadona..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-[#161d19] border border-[#3c4a42] focus:border-[#7bd0ff] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#dde4dd] placeholder-[#86948a] outline-none transition-all font-sans"
            />
          </div>

          {/* Time Period Selector */}
          <div className="hidden lg:flex items-center bg-[#161d19] border border-[#3c4a42] p-0.5 rounded-lg text-xs font-mono">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setTimePeriod(p)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  timePeriod === p
                    ? 'bg-[#242c27] text-[#4edea3] font-bold shadow-sm'
                    : 'text-[#86948a] hover:text-[#dde4dd]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Currency Selector */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-[#161d19] border border-[#3c4a42] focus:border-[#4edea3] text-xs font-mono text-[#dde4dd] px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#161d19] text-[#dde4dd]">
                {c.label}
              </option>
            ))}
          </select>

          {/* AI Insights Button */}
          <button
            onClick={() => setIsAiPanelOpen(true)}
            className="flex items-center gap-1.5 bg-[#242c27] hover:bg-[#2f3632] border border-[#3c4a42] hover:border-[#7bd0ff] text-[#7bd0ff] px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7bd0ff] animate-pulse" />
            <span className="hidden sm:inline">Análisis IA</span>
          </button>
        </div>
      </div>
    </header>
  );
};
