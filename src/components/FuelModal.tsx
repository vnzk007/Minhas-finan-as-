import React, { useState, useEffect } from 'react';
import { FuelExpense, FuelType } from '../types';
import { getTodayDateString } from '../utils/calculations';
import { X, Fuel, Check } from 'lucide-react';

interface FuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fuel: Omit<FuelExpense, 'id' | 'createdAt'>) => void;
  existingFuel?: FuelExpense;
}

export const FuelModal: React.FC<FuelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingFuel,
}) => {
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('');
  const [amount, setAmount] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('Gasolina Comum');
  const [liters, setLiters] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [stationName, setStationName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingFuel) {
      setDate(existingFuel.date);
      setTime(existingFuel.time || '');
      setAmount(String(existingFuel.amount));
      setFuelType(existingFuel.fuelType);
      setLiters(existingFuel.liters ? String(existingFuel.liters) : '');
      setOdometerKm(existingFuel.odometerKm ? String(existingFuel.odometerKm) : '');
      setStationName(existingFuel.stationName || '');
      setNotes(existingFuel.notes || '');
    } else {
      setDate(getTodayDateString());
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${mm}`);
      setAmount('');
      setFuelType('Gasolina Comum');
      setLiters('');
      setOdometerKm('');
      setStationName('');
      setNotes('');
    }
  }, [existingFuel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const parsedLiters = liters ? parseFloat(liters.replace(',', '.')) : undefined;
    const pricePerLiter =
      parsedLiters && parsedLiters > 0 ? Number((parsedAmount / parsedLiters).toFixed(2)) : undefined;

    onSave({
      date,
      time: time || undefined,
      amount: parsedAmount,
      fuelType,
      liters: parsedLiters,
      pricePerLiter,
      odometerKm: odometerKm ? parseFloat(odometerKm.replace(',', '.')) : undefined,
      stationName: stationName.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const fuelTypes: FuelType[] = [
    'Gasolina Comum',
    'Gasolina Aditivada',
    'Etanol',
    'GNV',
    'Diesel',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                {existingFuel ? 'Editar Abastecimento' : 'Anotei Gasolina'}
              </h2>
              <p className="text-xs text-neutral-500">
                Registrou no posto em 10 segundos!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Valor Pago no Posto (Campo Principal) */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
              Valor Pago na Bomba (R$)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-amber-800 font-mono">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                required
                placeholder="Ex: 80,00 ou 120,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-2xl font-bold font-mono tabular-nums text-amber-950 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
            </div>
            <p className="text-[11px] text-amber-800 mt-1.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 shrink-0" />
              Será abatido automaticamente do seu faturamento para achar o lucro real!
            </p>
          </div>

          {/* Tipo de combustível em botões rápidos */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Tipo de Combustível
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {fuelTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFuelType(type)}
                  className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer text-center ${
                    fuelType === type
                      ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Horário (Opcional)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Litros e Odômetro (Opcionais) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Litros colocados (Opcional)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 21.5"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Km do Odômetro (Opcional)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 78500"
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Nome do Posto */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Posto / Local (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Posto Shell da Radial, Ipiranga..."
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
            />
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              Salvar Gasolina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
