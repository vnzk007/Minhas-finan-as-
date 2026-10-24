import React from 'react';
import { DaySummary } from '../types';
import { formatCurrency } from '../utils/calculations';
import { CheckCircle2, Fuel, Plus, Clock, Navigation, DollarSign, Edit3, AlertCircle } from 'lucide-react';

interface TodayCardProps {
  todaySummary: DaySummary;
  onOpenClosingModal: () => void;
  onOpenFuelModal: () => void;
  onOpenExpenseModal: () => void;
}

export const TodayCard: React.FC<TodayCardProps> = ({
  todaySummary,
  onOpenClosingModal,
  onOpenFuelModal,
  onOpenExpenseModal,
}) => {
  const hasClosed = !!todaySummary.closing;

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Hoje
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-600 font-medium">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-1">
            {hasClosed ? 'Dia Fechado com Sucesso' : 'Fechamento do Dia'}
          </h2>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasClosed ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lançado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              Pendente (anote no fim do dia)
            </span>
          )}
        </div>
      </div>

      {hasClosed ? (
        /* Estado: Dia já fechado */
        <div className="mt-5 space-y-5">
          {/* Grade de Destaque do Lucro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="text-xs font-medium text-neutral-500">Faturamento Bruto</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-neutral-900">
                {formatCurrency(todaySummary.totalGross)}
              </div>
              {todaySummary.closing?.ridesCount && (
                <div className="mt-1 text-xs text-neutral-500">
                  {todaySummary.closing.ridesCount} corridas/entregas
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="text-xs font-medium text-amber-800 flex items-center justify-between">
                <span>Gasolina / Combustível</span>
                <Fuel className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-amber-950">
                - {formatCurrency(todaySummary.totalFuel)}
              </div>
              <div className="mt-1 text-xs text-amber-700">
                {todaySummary.fuelExpenses.length > 0
                  ? `${todaySummary.fuelExpenses.length} abastecimento(s)`
                  : 'Nenhum abastecimento'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="text-xs font-medium text-neutral-500">Outros Gastos</div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-neutral-900">
                - {formatCurrency(todaySummary.totalOther)}
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                {todaySummary.otherExpenses.length} item(s) registrado(s)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-600 text-white shadow-xs">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                Lucro Líquido no Bolso
              </div>
              <div className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums">
                {formatCurrency(todaySummary.netProfit)}
              </div>
              <div className="mt-1 text-xs text-emerald-100">
                Dinheiro livre após despesas
              </div>
            </div>
          </div>

          {/* Métricas de Produtividade (Km e Horas) */}
          {(todaySummary.kmDriven > 0 || todaySummary.hoursWorked > 0) && (
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-neutral-600 border-t border-neutral-100">
              {todaySummary.kmDriven > 0 && (
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-neutral-400" />
                  <span>
                    <strong className="text-neutral-900 font-mono tabular-nums">
                      {todaySummary.kmDriven} km
                    </strong>{' '}
                    rodados ({formatCurrency(todaySummary.netProfit / todaySummary.kmDriven)}/km líquido)
                  </span>
                </div>
              )}
              {todaySummary.hoursWorked > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>
                    <strong className="text-neutral-900 font-mono tabular-nums">
                      {todaySummary.hoursWorked}h
                    </strong>{' '}
                    trabalhadas ({formatCurrency(todaySummary.netProfit / todaySummary.hoursWorked)}/h líquida)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Ações do dia */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={onOpenClosingModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Fechamento de Hoje</span>
            </button>
            <button
              onClick={onOpenFuelModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>+ Anotar Abastecimento</span>
            </button>
            <button
              onClick={onOpenExpenseModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Outro Gasto</span>
            </button>
          </div>
        </div>
      ) : (
        /* Estado: Dia ainda não fechado */
        <div className="mt-5 space-y-4">
          <p className="text-sm text-neutral-600 leading-relaxed">
            Trabalhe com tranquilidade durante o dia. Quando parar o carro ou a moto, venha aqui e coloque o total do seu faturamento em <strong>1 minuto</strong>.
          </p>

          {/* Abastecimentos de hoje (se houver antes de fechar) */}
          {todaySummary.fuelExpenses.length > 0 && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-700" />
                <span>
                  Você já registrou <strong>{formatCurrency(todaySummary.totalFuel)}</strong> em combustível hoje.
                </span>
              </div>
              <button
                onClick={onOpenFuelModal}
                className="text-amber-800 font-semibold underline hover:text-amber-950 cursor-pointer"
              >
                + Outro
              </button>
            </div>
          )}

          {/* Botões de Ação Principal Grandes */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={onOpenClosingModal}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Lançar Faturamento de Hoje</span>
            </button>

            <button
              onClick={onOpenFuelModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all active:scale-98 cursor-pointer"
            >
              <Fuel className="w-4 h-4 text-amber-800" />
              <span>Passei no Posto (Gasolina)</span>
            </button>

            <button
              onClick={onOpenExpenseModal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Outro Gasto</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
