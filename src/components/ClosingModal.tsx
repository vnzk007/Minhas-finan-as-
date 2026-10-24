import React, { useState, useEffect } from 'react';
import { DailyClosing } from '../types';
import { getTodayDateString } from '../utils/calculations';
import { X, Check, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (closing: Omit<DailyClosing, 'id' | 'createdAt'>) => void;
  existingClosing?: DailyClosing;
  initialDate?: string;
}

export const ClosingModal: React.FC<ClosingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingClosing,
  initialDate,
}) => {
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [grossEarnings, setGrossEarnings] = useState('');
  const [kmDriven, setKmDriven] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [ridesCount, setRidesCount] = useState('');
  const [notes, setNotes] = useState('');

  // Apps breakdown (optional)
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [uber, setUber] = useState('');
  const [app99, setApp99] = useState('');
  const [deliveries, setDeliveries] = useState('');
  const [privateRides, setPrivateRides] = useState('');

  useEffect(() => {
    if (existingClosing) {
      setDate(existingClosing.date);
      setGrossEarnings(String(existingClosing.grossEarnings));
      setKmDriven(existingClosing.kmDriven ? String(existingClosing.kmDriven) : '');
      setHoursWorked(existingClosing.hoursWorked ? String(existingClosing.hoursWorked) : '');
      setRidesCount(existingClosing.ridesCount ? String(existingClosing.ridesCount) : '');
      setNotes(existingClosing.notes || '');

      if (existingClosing.breakdown) {
        setUber(existingClosing.breakdown.uber ? String(existingClosing.breakdown.uber) : '');
        setApp99(existingClosing.breakdown.app99 ? String(existingClosing.breakdown.app99) : '');
        setDeliveries(existingClosing.breakdown.deliveries ? String(existingClosing.breakdown.deliveries) : '');
        setPrivateRides(existingClosing.breakdown.privateRides ? String(existingClosing.breakdown.privateRides) : '');
        if (
          existingClosing.breakdown.uber ||
          existingClosing.breakdown.app99 ||
          existingClosing.breakdown.deliveries ||
          existingClosing.breakdown.privateRides
        ) {
          setShowBreakdown(true);
        }
      }
    } else {
      setDate(initialDate || getTodayDateString());
      setGrossEarnings('');
      setKmDriven('');
      setHoursWorked('');
      setRidesCount('');
      setNotes('');
      setUber('');
      setApp99('');
      setDeliveries('');
      setPrivateRides('');
      setShowBreakdown(false);
    }
  }, [existingClosing, initialDate, isOpen]);

  if (!isOpen) return null;

  // Auto-sum if breakdown is filled
  const handleBreakdownChange = (field: 'uber' | '99' | 'deliveries' | 'private', val: string) => {
    const u = field === 'uber' ? parseFloat(val) || 0 : parseFloat(uber) || 0;
    const n = field === '99' ? parseFloat(val) || 0 : parseFloat(app99) || 0;
    const d = field === 'deliveries' ? parseFloat(val) || 0 : parseFloat(deliveries) || 0;
    const p = field === 'private' ? parseFloat(val) || 0 : parseFloat(privateRides) || 0;
    const sum = u + n + d + p;
    if (sum > 0) {
      setGrossEarnings(sum.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const earnings = parseFloat(grossEarnings.replace(',', '.'));
    if (isNaN(earnings) || earnings < 0) return;

    onSave({
      date,
      grossEarnings: earnings,
      breakdown: showBreakdown
        ? {
            uber: uber ? parseFloat(uber.replace(',', '.')) : undefined,
            app99: app99 ? parseFloat(app99.replace(',', '.')) : undefined,
            deliveries: deliveries ? parseFloat(deliveries.replace(',', '.')) : undefined,
            privateRides: privateRides ? parseFloat(privateRides.replace(',', '.')) : undefined,
          }
        : undefined,
      kmDriven: kmDriven ? parseFloat(kmDriven.replace(',', '.')) : undefined,
      hoursWorked: hoursWorked ? parseFloat(hoursWorked.replace(',', '.')) : undefined,
      ridesCount: ridesCount ? parseInt(ridesCount, 10) : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              {existingClosing ? 'Editar Fechamento do Dia' : 'Fechar o Dia'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Sem lançar corrida por corrida: só anote quanto fez no total!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Data do Fechamento
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-mono tabular-nums bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
            />
          </div>

          {/* Faturamento Total (Grande Destaque) */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Quanto você faturou hoje no total? (R$)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-700 font-mono">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                required
                placeholder="0,00"
                value={grossEarnings}
                onChange={(e) => setGrossEarnings(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-2xl font-bold font-mono tabular-nums text-emerald-900 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
              />
            </div>
            <p className="text-[11px] text-emerald-700 mt-1.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 shrink-0" />
              Soma total que apareceu no app ou na sua conta hoje.
            </p>
          </div>

          {/* Botão para abrir detalhamento por app (opcional) */}
          <div>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer py-1"
            >
              {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{showBreakdown ? 'Ocultar divisão por app' : 'Quer separar por app? (Uber, 99, Particular...)'}</span>
            </button>

            {showBreakdown && (
              <div className="mt-2.5 grid grid-cols-2 gap-2.5 p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Uber (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={uber}
                    onChange={(e) => {
                      setUber(e.target.value);
                      handleBreakdownChange('uber', e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-600 mb-1">99 (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={app99}
                    onChange={(e) => {
                      setApp99(e.target.value);
                      handleBreakdownChange('99', e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Entregas / iFood (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={deliveries}
                    onChange={(e) => {
                      setDeliveries(e.target.value);
                      handleBreakdownChange('deliveries', e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-600 mb-1">Corrida Particular (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={privateRides}
                    onChange={(e) => {
                      setPrivateRides(e.target.value);
                      handleBreakdownChange('private', e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dados operacionais opcionais: Km, Horas, Corridas */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Km Rodados
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 160"
                value={kmDriven}
                onChange={(e) => setKmDriven(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Horas na Rua
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 8.5"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Viagens
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Ex: 19"
                value={ridesCount}
                onChange={(e) => setRidesCount(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Observação do dia (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Chuva à noite, trânsito pesado na serra..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white"
            />
          </div>

          {/* Botões de Ação */}
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
              className="px-6 py-2.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              Salvar Fechamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
