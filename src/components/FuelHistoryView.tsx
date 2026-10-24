import React, { useState } from 'react';
import { FuelExpense } from '../types';
import { formatCurrency, formatDateBR } from '../utils/calculations';
import { Fuel, Plus, Trash2, Edit2, Search } from 'lucide-react';

interface FuelHistoryViewProps {
  fuelExpenses: FuelExpense[];
  onOpenFuelModal: () => void;
  onEditFuel: (fuel: FuelExpense) => void;
  onDeleteFuel: (id: string) => void;
}

export const FuelHistoryView: React.FC<FuelHistoryViewProps> = ({
  fuelExpenses,
  onOpenFuelModal,
  onEditFuel,
  onDeleteFuel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedFuels = [...fuelExpenses].sort((a, b) => b.date.localeCompare(a.date));

  const filteredFuels = sortedFuels.filter((f) => {
    const term = searchTerm.toLowerCase();
    return (
      f.fuelType.toLowerCase().includes(term) ||
      (f.stationName && f.stationName.toLowerCase().includes(term)) ||
      f.date.includes(term) ||
      (f.notes && f.notes.toLowerCase().includes(term))
    );
  });

  const totalSpent = fuelExpenses.reduce((sum, f) => sum + f.amount, 0);
  const totalLiters = fuelExpenses.reduce((sum, f) => sum + (f.liters || 0), 0);
  const avgPerFill = fuelExpenses.length > 0 ? totalSpent / fuelExpenses.length : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Abastecimentos & Combustível
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Todos os abastecimentos anotados quando passou no posto.
          </p>
        </div>

        <button
          onClick={onOpenFuelModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
        >
          <Fuel className="w-4 h-4 text-amber-800" />
          <span>+ Anotar Abastecimento</span>
        </button>
      </div>

      {/* KPI Cards de Combustível */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <div className="text-xs font-medium text-neutral-500">Total Pago em Combustível</div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900">
            {formatCurrency(totalSpent)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {fuelExpenses.length} abastecimentos no histórico
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <div className="text-xs font-medium text-neutral-500">Volume Total Abastecido</div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900">
            {totalLiters > 0 ? `${totalLiters.toFixed(1)} L` : '—'}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            Soma dos litros registrados
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <div className="text-xs font-medium text-neutral-500">Média por Abastecida</div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900">
            {formatCurrency(avgPerFill)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            Ticket médio na bomba
          </div>
        </div>
      </div>

      {/* Tabela de Abastecimentos */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-neutral-900">
            Histórico de Notas do Posto ({filteredFuels.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por posto, combustível..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
            />
          </div>
        </div>

        {filteredFuels.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Fuel className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-600">Nenhum abastecimento encontrado.</p>
            <p className="text-xs text-neutral-400 mt-1">
              Passe no posto e anote rapidamente o valor pago.
            </p>
            <button
              onClick={onOpenFuelModal}
              className="mt-4 px-4 py-2 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer"
            >
              + Anotar Primeiro Abastecimento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 font-medium bg-neutral-50/50">
                  <th className="py-3 px-4 font-normal">Data & Hora</th>
                  <th className="py-3 px-4 font-normal">Combustível</th>
                  <th className="py-3 px-4 font-normal">Posto</th>
                  <th className="py-3 px-4 font-normal">Litros / Preço Litro</th>
                  <th className="py-3 px-4 font-normal">Odômetro</th>
                  <th className="py-3 px-4 font-normal text-right">Valor Pago</th>
                  <th className="py-3 px-4 font-normal text-right w-16">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredFuels.map((fuel) => (
                  <tr key={fuel.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-neutral-900">
                      {formatDateBR(fuel.date)}
                      {fuel.time && <span className="text-neutral-500 font-normal"> às {fuel.time}</span>}
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-800">
                      {fuel.fuelType}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {fuel.stationName || '—'}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 font-mono tabular-nums">
                      {fuel.liters ? `${fuel.liters} L` : '—'}
                      {fuel.pricePerLiter ? ` (${formatCurrency(fuel.pricePerLiter)}/L)` : ''}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 font-mono tabular-nums">
                      {fuel.odometerKm ? `${fuel.odometerKm} km` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(fuel.amount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditFuel(fuel)}
                          title="Editar"
                          className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o abastecimento de ${formatCurrency(fuel.amount)}?`)) {
                              onDeleteFuel(fuel.id);
                            }
                          }}
                          title="Excluir"
                          className="p-1 text-neutral-400 hover:text-rose-600 cursor-pointer rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
