import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { NavigationTab } from '../types';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  Target,
  BarChart3,
  Bot,
  Plus,
  RefreshCw,
  Download,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const {
    selectedTab,
    setSelectedTab,
    setIsAddTxModalOpen,
    summary,
    currency,
    resetToDemoData,
    exportTransactionsCSV,
  } = useFinance();

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Resumen General', icon: LayoutDashboard },
    { id: 'transactions', label: 'Movimientos', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Presupuestos', icon: PieChart },
    { id: 'accounts', label: 'Cuentas y Tarjetas', icon: Wallet },
    { id: 'goals', label: 'Metas de Ahorro', icon: Target },
    { id: 'analytics', label: 'Analítica', icon: BarChart3 },
    { id: 'ai-advisor', label: 'Asistente AI', icon: Bot },
  ];

  const handleSelect = (id: NavigationTab) => {
    setSelectedTab(id);
    if (onMobileClose) onMobileClose();
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-[280px] bg-[#161d19] border-r border-[#3c4a42] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
        mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#3c4a42] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4edea3]/15 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3] shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-[#dde4dd] font-sans">
                Finanz<span className="text-[#4edea3]">App</span>
              </h1>
              <p className="text-[11px] font-mono text-[#bbcabf] uppercase tracking-wider">
                Patrimonio & Control
              </p>
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <div className="p-4">
          <button
            onClick={() => {
              setIsAddTxModalOpen(true);
              if (onMobileClose) onMobileClose();
            }}
            className="w-full bg-[#4edea3] hover:bg-[#3ebe8f] text-[#003824] font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md text-sm font-sans cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Añadir Movimiento</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#242c27] text-[#4edea3] border border-[#3c4a42] shadow-sm'
                    : 'text-[#bbcabf] hover:text-[#dde4dd] hover:bg-[#1a211d]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4edea3]' : 'text-[#86948a]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'ai-advisor' && (
                  <span className="text-[10px] font-mono bg-[#7bd0ff]/20 text-[#7bd0ff] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                    IA
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Summary & Utilities */}
      <div className="p-4 border-t border-[#3c4a42] bg-[#09100c]/60 space-y-4">
        {/* Total Wealth Mini Widget */}
        <div className="bg-[#1a211d] p-3.5 rounded-lg border border-[#3c4a42]">
          <span className="text-[11px] font-mono uppercase text-[#86948a] tracking-wider block">
            Patrimonio Total
          </span>
          <div className="text-lg font-bold font-mono text-[#4edea3] mt-0.5">
            {formatCurrency(summary.totalWealth, currency)}
          </div>
          <div className="text-[12px] text-[#bbcabf] mt-1 flex items-center gap-1.5 font-sans">
            <span className="text-[#4edea3] font-mono font-medium">
              +{summary.wealthGrowthPercent}%
            </span>
            <span>este trimestre</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center justify-between text-xs text-[#86948a] pt-1 px-1">
          <button
            onClick={exportTransactionsCSV}
            title="Exportar Transacciones a CSV"
            className="flex items-center gap-1.5 hover:text-[#4edea3] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              if (confirm('¿Restablecer datos de ejemplo iniciales?')) {
                resetToDemoData();
              }
            }}
            title="Restablecer Datos de Demostración"
            className="flex items-center gap-1.5 hover:text-[#ffb3af] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
