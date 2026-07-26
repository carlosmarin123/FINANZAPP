import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { formatCurrency } from './utils/formatters';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GoogleSheetsSyncBar } from './components/GoogleSheetsSyncBar';
import { StatCard } from './components/StatCard';
import { WealthChart } from './components/WealthChart';
import { CategoryPieChart } from './components/CategoryPieChart';
import { TransactionList } from './components/TransactionList';
import { BudgetSection } from './components/BudgetSection';
import { AccountsSection } from './components/AccountsSection';
import { GoalsSection } from './components/GoalsSection';
import { AiAssistant } from './components/AiAssistant';
import { AddTransactionModal } from './components/AddTransactionModal';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Bot,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { summary, currency, setSelectedTab, setIsAddTxModalOpen, setIsAiPanelOpen } = useFinance();

  return (
    <div className="space-y-6">
      {/* Live Google Sheets CSV Sync Bar */}
      <GoogleSheetsSyncBar />

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Patrimonio Total"
          amount={summary.totalWealth}
          currency={currency}
          icon={Wallet}
          trendPercent={summary.wealthGrowthPercent}
          trendText="vs. trimestre anterior"
          type="emerald"
        />
        <StatCard
          title="Ingresos Mensuales"
          amount={summary.monthlyIncome}
          currency={currency}
          icon={TrendingUp}
          trendPercent={summary.incomeVsLastMonthPercent}
          trendText="vs. mes anterior"
          type="emerald"
        />
        <StatCard
          title="Gastos Mensuales"
          amount={summary.monthlyExpenses}
          currency={currency}
          icon={TrendingDown}
          trendPercent={summary.expenseVsLastMonthPercent}
          trendText="vs. mes anterior"
          type="rose"
        />
        <StatCard
          title="Tasa de Ahorro Neto"
          amount={summary.netSavings}
          currency={currency}
          icon={PiggyBank}
          trendPercent={summary.savingsRatePercent}
          trendText={`Ahorro (${summary.savingsRatePercent.toFixed(0)}%)`}
          type="sky"
        />
      </div>

      {/* Main Analytical Section: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WealthChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryPieChart />
        </div>
      </div>

      {/* AI Financial Tip Banner */}
      <div className="bg-[#1e293b] p-5 rounded-xl border border-[#3c4a42] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm bg-gradient-to-r from-[#1e293b] via-[#1a211d] to-[#1e293b]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#7bd0ff]/15 border border-[#7bd0ff]/40 flex items-center justify-center text-[#7bd0ff] shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#dde4dd] font-sans flex items-center gap-2">
              <span>Recomendación Inteligente FinanzApp</span>
              <span className="text-[10px] font-mono bg-[#4edea3]/20 text-[#4edea3] px-2 py-0.5 rounded-full border border-[#4edea3]/30">
                Optimizado
              </span>
            </h4>
            <p className="text-xs text-[#bbcabf] font-sans mt-0.5">
              Tu tasa de ahorro mensual del{' '}
              <strong className="text-[#4edea3]">{summary.savingsRatePercent.toFixed(1)}%</strong> supera
              el objetivo recomendado del 20%. Puedes destinar {formatCurrency(300, currency)} extra a tu meta de 'Entrada Hipoteca'.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAiPanelOpen(true)}
          className="bg-[#242c27] hover:bg-[#2f3632] border border-[#3c4a42] hover:border-[#7bd0ff] text-[#7bd0ff] px-4 py-2 rounded-lg text-xs font-semibold font-sans flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          <Bot className="w-4 h-4" />
          <span>Consultar Asistente IA</span>
        </button>
      </div>

      {/* Recent Movements Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#dde4dd] font-sans">Movimientos Recientes</h3>
          <button
            onClick={() => setSelectedTab('transactions')}
            className="text-xs font-mono text-[#7bd0ff] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Ver todos ({summary.monthlyExpenses > 0 ? 'Registro completo' : ''})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <TransactionList />
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { selectedTab, isAiPanelOpen, setIsAiPanelOpen } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0e1511] text-[#dde4dd] font-sans antialiased flex flex-col md:flex-row">
      {/* Fixed Desktop / Mobile Drawer Sidebar */}
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Main Work Area */}
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen min-w-0">
        <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 p-4 md:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {selectedTab === 'dashboard' && <DashboardContent />}
              {selectedTab === 'transactions' && (
                <div className="space-y-6">
                  <GoogleSheetsSyncBar />
                  <TransactionList />
                </div>
              )}
              {selectedTab === 'budgets' && <BudgetSection />}
              {selectedTab === 'accounts' && <AccountsSection />}
              {selectedTab === 'goals' && <GoalsSection />}
              {selectedTab === 'analytics' && (
                <div className="space-y-6">
                  <WealthChart />
                  <CategoryPieChart />
                </div>
              )}
              {selectedTab === 'ai-advisor' && <AiAssistant />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* AI Assistant Overlay Slide-over Drawer if opened from Header */}
      {isAiPanelOpen && selectedTab !== 'ai-advisor' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md h-full bg-[#1e293b] border-l border-[#334155] p-4 shadow-2xl flex flex-col">
            <AiAssistant />
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <AddTransactionModal />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
