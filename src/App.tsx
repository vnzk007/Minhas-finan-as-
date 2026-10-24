import React, { useState, useEffect, useMemo } from 'react';
import { DailyClosing, FuelExpense, OtherExpense } from './types';
import { SAMPLE_CLOSINGS, SAMPLE_FUELS, SAMPLE_OTHERS } from './data/sampleData';
import {
  getTodayDateString,
  getCurrentMonthString,
  buildDaySummary,
  buildMonthSummary,
} from './utils/calculations';
import { Header, TabKey } from './components/Header';
import { TodayCard } from './components/TodayCard';
import { MonthHistoryView } from './components/MonthHistoryView';
import { FuelHistoryView } from './components/FuelHistoryView';
import { ClosingModal } from './components/ClosingModal';
import { FuelModal } from './components/FuelModal';
import { ExpenseModal } from './components/ExpenseModal';
import { StorageBackupModal } from './components/StorageBackupModal';
import { Fuel, DollarSign, Database, Check } from 'lucide-react';

const STORAGE_KEY_CLOSINGS = 'diaria_tanque_closings_v1';
const STORAGE_KEY_FUELS = 'diaria_tanque_fuels_v1';
const STORAGE_KEY_OTHERS = 'diaria_tanque_others_v1';

export default function App() {
  // Load from local storage or initialize with sample data
  const [closings, setClosings] = useState<DailyClosing[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CLOSINGS);
      return stored ? JSON.parse(stored) : SAMPLE_CLOSINGS;
    } catch {
      return SAMPLE_CLOSINGS;
    }
  });

  const [fuelExpenses, setFuelExpenses] = useState<FuelExpense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FUELS);
      return stored ? JSON.parse(stored) : SAMPLE_FUELS;
    } catch {
      return SAMPLE_FUELS;
    }
  });

  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_OTHERS);
      return stored ? JSON.parse(stored) : SAMPLE_OTHERS;
    } catch {
      return SAMPLE_OTHERS;
    }
  });

  // Persistent storage update
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLOSINGS, JSON.stringify(closings));
  }, [closings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FUELS, JSON.stringify(fuelExpenses));
  }, [fuelExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OTHERS, JSON.stringify(otherExpenses));
  }, [otherExpenses]);

  // Tab & Month Navigation State
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(getCurrentMonthString());

  // Modals state
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [editingClosing, setEditingClosing] = useState<DailyClosing | undefined>(undefined);
  const [closingInitialDate, setClosingInitialDate] = useState<string | undefined>(undefined);

  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [editingFuel, setEditingFuel] = useState<FuelExpense | undefined>(undefined);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<OtherExpense | undefined>(undefined);

  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculations
  const todayDate = getTodayDateString();
  const todaySummary = useMemo(() => {
    return buildDaySummary(todayDate, closings, fuelExpenses, otherExpenses);
  }, [todayDate, closings, fuelExpenses, otherExpenses]);

  const { summary: monthSummary, daySummaries } = useMemo(() => {
    return buildMonthSummary(currentMonthKey, closings, fuelExpenses, otherExpenses);
  }, [currentMonthKey, closings, fuelExpenses, otherExpenses]);

  // List of all months present in data
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    closings.forEach((c) => set.add(c.date.slice(0, 7)));
    fuelExpenses.forEach((f) => set.add(f.date.slice(0, 7)));
    otherExpenses.forEach((o) => set.add(o.date.slice(0, 7)));
    set.add(getCurrentMonthString());
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [closings, fuelExpenses, otherExpenses]);

  // Actions: Closings
  const handleSaveClosing = (closingData: Omit<DailyClosing, 'id' | 'createdAt'>) => {
    if (editingClosing) {
      setClosings((prev) =>
        prev.map((c) => (c.id === editingClosing.id ? { ...c, ...closingData } : c))
      );
      showToast('Fechamento atualizado com sucesso!');
    } else {
      // Check if closing already exists for this date
      const existing = closings.find((c) => c.date === closingData.date);
      if (existing) {
        setClosings((prev) =>
          prev.map((c) => (c.id === existing.id ? { ...c, ...closingData } : c))
        );
        showToast('Fechamento do dia atualizado!');
      } else {
        const newClosing: DailyClosing = {
          ...closingData,
          id: `close-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setClosings((prev) => [newClosing, ...prev]);
        showToast('Fechamento do dia salvo com sucesso!');
      }
    }
    setEditingClosing(undefined);
    setClosingInitialDate(undefined);
  };

  const handleDeleteClosing = (id: string) => {
    setClosings((prev) => prev.filter((c) => c.id !== id));
    showToast('Fechamento excluído.');
  };

  const handleOpenEditClosing = (closing: DailyClosing) => {
    setEditingClosing(closing);
    setIsClosingModalOpen(true);
  };

  const handleOpenNewClosing = (date?: string) => {
    setEditingClosing(undefined);
    setClosingInitialDate(date || getTodayDateString());
    setIsClosingModalOpen(true);
  };

  // Actions: Fuel
  const handleSaveFuel = (fuelData: Omit<FuelExpense, 'id' | 'createdAt'>) => {
    if (editingFuel) {
      setFuelExpenses((prev) =>
        prev.map((f) => (f.id === editingFuel.id ? { ...f, ...fuelData } : f))
      );
      showToast('Abastecimento atualizado!');
    } else {
      const newFuel: FuelExpense = {
        ...fuelData,
        id: `fuel-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setFuelExpenses((prev) => [newFuel, ...prev]);
      showToast('Gasolina anotada com sucesso!');
    }
    setEditingFuel(undefined);
  };

  const handleDeleteFuel = (id: string) => {
    setFuelExpenses((prev) => prev.filter((f) => f.id !== id));
    showToast('Abastecimento excluído.');
  };

  const handleOpenEditFuel = (fuel: FuelExpense) => {
    setEditingFuel(fuel);
    setIsFuelModalOpen(true);
  };

  const handleOpenNewFuel = () => {
    setEditingFuel(undefined);
    setIsFuelModalOpen(true);
  };

  // Actions: Other Expenses
  const handleSaveExpense = (expenseData: Omit<OtherExpense, 'id' | 'createdAt'>) => {
    if (editingExpense) {
      setOtherExpenses((prev) =>
        prev.map((o) => (o.id === editingExpense.id ? { ...o, ...expenseData } : o))
      );
      showToast('Despesa atualizada!');
    } else {
      const newExpense: OtherExpense = {
        ...expenseData,
        id: `other-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setOtherExpenses((prev) => [newExpense, ...prev]);
      showToast('Gasto registrado!');
    }
    setEditingExpense(undefined);
  };

  const handleDeleteExpense = (id: string) => {
    setOtherExpenses((prev) => prev.filter((o) => o.id !== id));
    showToast('Gasto excluído.');
  };

  const handleOpenNewExpense = () => {
    setEditingExpense(undefined);
    setIsExpenseModalOpen(true);
  };

  // Storage actions
  const handleImportData = (data: {
    closings: DailyClosing[];
    fuelExpenses: FuelExpense[];
    otherExpenses: OtherExpense[];
  }) => {
    setClosings(data.closings || []);
    setFuelExpenses(data.fuelExpenses || []);
    setOtherExpenses(data.otherExpenses || []);
    showToast('Dados restaurados com sucesso!');
  };

  const handleLoadSampleData = () => {
    setClosings(SAMPLE_CLOSINGS);
    setFuelExpenses(SAMPLE_FUELS);
    setOtherExpenses(SAMPLE_OTHERS);
    showToast('Dados de demonstração carregados!');
  };

  const handleClearAllData = () => {
    setClosings([]);
    setFuelExpenses([]);
    setOtherExpenses([]);
    localStorage.removeItem(STORAGE_KEY_CLOSINGS);
    localStorage.removeItem(STORAGE_KEY_FUELS);
    localStorage.removeItem(STORAGE_KEY_OTHERS);
    showToast('Todos os registros foram apagados.');
  };

  return (
    <div className="min-h-screen bg-neutral-50/70 text-neutral-900 pb-16">
      {/* Top Bar Contract Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenClosingModal={() => handleOpenNewClosing()}
        onOpenFuelModal={handleOpenNewFuel}
        onOpenStorageModal={() => setIsStorageModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Quick Helper Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white border border-neutral-200/80 rounded-xl text-xs text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">Como funciona:</span>
            <span>
              1. Passe no posto? Anote a gasolina. · 2. Fim do dia? Coloque quanto faturou. · 3. O histórico e lucro mensal saem prontos!
            </span>
          </div>
          <button
            onClick={() => setIsStorageModalOpen(true)}
            className="self-start sm:self-auto font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Salvo Localmente</span>
          </button>
        </div>

        {/* View Switch */}
        {activeTab === 'today' && (
          <div className="space-y-6">
            <TodayCard
              todaySummary={todaySummary}
              onOpenClosingModal={() => handleOpenNewClosing(todayDate)}
              onOpenFuelModal={handleOpenNewFuel}
              onOpenExpenseModal={handleOpenNewExpense}
            />

            {/* Quick Preview of the current Month's Totals right below Today */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-neutral-900">
                  Resumo Rápido de {monthSummary.monthLabel}
                </h3>
                <button
                  onClick={() => setActiveTab('month')}
                  className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 underline cursor-pointer"
                >
                  Ver Histórico Completo do Mês →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                  <div className="text-[11px] font-medium text-neutral-500">Lucro Líquido no Mês</div>
                  <div className="mt-1 text-xl font-extrabold font-mono tabular-nums text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthSummary.netProfit)}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-500">
                    {monthSummary.daysWorkedCount} dias trabalhados
                  </div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                  <div className="text-[11px] font-medium text-neutral-500">Faturamento Bruto</div>
                  <div className="mt-1 text-xl font-bold font-mono tabular-nums text-neutral-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthSummary.totalGross)}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-500">Total gerado</div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                  <div className="text-[11px] font-medium text-amber-800">Gasolina no Mês</div>
                  <div className="mt-1 text-xl font-bold font-mono tabular-nums text-amber-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthSummary.totalFuel)}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-500">Gasto no posto</div>
                </div>

                <div className="bg-white border border-neutral-200 rounded-xl p-4">
                  <div className="text-[11px] font-medium text-neutral-500">Média / Dia</div>
                  <div className="mt-1 text-xl font-bold font-mono tabular-nums text-neutral-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthSummary.averageProfitPerDay)}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-500">Líquido diário</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'month' && (
          <MonthHistoryView
            currentMonthKey={currentMonthKey}
            onMonthChange={setCurrentMonthKey}
            monthSummary={monthSummary}
            daySummaries={daySummaries}
            onEditClosing={handleOpenEditClosing}
            onDeleteClosing={handleDeleteClosing}
            onEditFuel={handleOpenEditFuel}
            onDeleteFuel={handleDeleteFuel}
            onDeleteExpense={handleDeleteExpense}
            availableMonths={availableMonths}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelHistoryView
            fuelExpenses={fuelExpenses}
            onOpenFuelModal={handleOpenNewFuel}
            onEditFuel={handleOpenEditFuel}
            onDeleteFuel={handleDeleteFuel}
          />
        )}
      </main>

      {/* Floating Action Button on Mobile */}
      <div className="sm:hidden fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
        <button
          onClick={handleOpenNewFuel}
          title="Anotar Gasolina"
          className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Fuel className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleOpenNewClosing()}
          title="Fechar o Dia"
          className="px-4 py-3 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-transform"
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Fechar o Dia</span>
        </button>
      </div>

      {/* Modals */}
      <ClosingModal
        isOpen={isClosingModalOpen}
        onClose={() => {
          setIsClosingModalOpen(false);
          setEditingClosing(undefined);
          setClosingInitialDate(undefined);
        }}
        onSave={handleSaveClosing}
        existingClosing={editingClosing}
        initialDate={closingInitialDate}
      />

      <FuelModal
        isOpen={isFuelModalOpen}
        onClose={() => {
          setIsFuelModalOpen(false);
          setEditingFuel(undefined);
        }}
        onSave={handleSaveFuel}
        existingFuel={editingFuel}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(undefined);
        }}
        onSave={handleSaveExpense}
        existingExpense={editingExpense}
      />

      <StorageBackupModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        closings={closings}
        fuelExpenses={fuelExpenses}
        otherExpenses={otherExpenses}
        onImportData={handleImportData}
        onLoadSampleData={handleLoadSampleData}
        onClearAllData={handleClearAllData}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
