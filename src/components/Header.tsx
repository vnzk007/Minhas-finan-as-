import React from 'react';
import { Plus, Database, Fuel } from 'lucide-react';

export type TabKey = 'today' | 'month' | 'fuel';

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenClosingModal: () => void;
  onOpenFuelModal: () => void;
  onOpenStorageModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenClosingModal,
  onOpenFuelModal,
  onOpenStorageModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1: Brand title, single element, one line */}
        <button
          onClick={() => onTabChange('today')}
          className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 text-left cursor-pointer flex items-center gap-2"
        >
          <span>Diária & Tanque</span>
        </button>

        {/* Zone 2: 3-4 nav links, single-line text with subtle hover */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <button
            onClick={() => onTabChange('today')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'today'
                ? 'text-neutral-950 font-bold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => onTabChange('month')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'month'
                ? 'text-neutral-950 font-bold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900'
            }`}
          >
            Histórico do Mês
          </button>
          <button
            onClick={() => onTabChange('fuel')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeTab === 'fuel'
                ? 'text-neutral-950 font-bold border-b-2 border-neutral-900'
                : 'hover:text-neutral-900'
            }`}
          >
            Gasolina
          </button>
        </nav>

        {/* Zone 3: 1 primary action + backup icon */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenStorageModal}
            title="Dados e Backup Local"
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenFuelModal}
            title="Anotar Gasolina"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Fuel className="w-3.5 h-3.5 text-amber-700" />
            <span>Gasolina</span>
          </button>

          <button
            onClick={onOpenClosingModal}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Fechar o Dia</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav row (Bottom fixed or sticky bar) */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-neutral-100 bg-neutral-50/90 text-xs font-semibold">
        <button
          onClick={() => onTabChange('today')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'today'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => onTabChange('month')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'month'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Histórico do Mês
        </button>
        <button
          onClick={() => onTabChange('fuel')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'fuel'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Gasolina
        </button>
      </div>
    </header>
  );
};
