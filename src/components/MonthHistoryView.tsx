import React, { useState } from 'react';
import { MonthSummary, DaySummary, DailyClosing, FuelExpense, OtherExpense } from '../types';
import { formatCurrency, formatDateBR, getWeekdayName } from '../utils/calculations';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Fuel,
  TrendingUp,
  Clock,
  Navigation,
  FileSpreadsheet,
  Share2,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Receipt,
  CheckCircle2,
} from 'lucide-react';

interface MonthHistoryViewProps {
  currentMonthKey: string;
  onMonthChange: (monthKey: string) => void;
  monthSummary: MonthSummary;
  daySummaries: DaySummary[];
  onEditClosing: (closing: DailyClosing) => void;
  onDeleteClosing: (id: string) => void;
  onEditFuel: (fuel: FuelExpense) => void;
  onDeleteFuel: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  availableMonths: string[];
}

export const MonthHistoryView: React.FC<MonthHistoryViewProps> = ({
  currentMonthKey,
  onMonthChange,
  monthSummary,
  daySummaries,
  onEditClosing,
  onDeleteClosing,
  onEditFuel,
  onDeleteFuel,
  onDeleteExpense,
  availableMonths,
}) => {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  // Navegar entre meses
  const handlePrevMonth = () => {
    const [year, month] = currentMonthKey.split('-').map(Number);
    let prevY = year;
    let prevM = month - 1;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    const key = `${prevY}-${String(prevM).padStart(2, '0')}`;
    onMonthChange(key);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonthKey.split('-').map(Number);
    let nextY = year;
    let nextM = month + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    const key = `${nextY}-${String(nextM).padStart(2, '0')}`;
    onMonthChange(key);
  };

  const toggleExpand = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  // Copiar resumo formatado para o WhatsApp
  const handleCopyWhatsAppSummary = () => {
    const text = `📊 *RESUMO MENSAL - ${monthSummary.monthLabel.toUpperCase()}*
--------------------------------
💰 *Lucro Líquido:* ${formatCurrency(monthSummary.netProfit)}
💵 *Faturamento Bruto:* ${formatCurrency(monthSummary.totalGross)}
⛽ *Gasolina Total:* ${formatCurrency(monthSummary.totalFuel)} (${monthSummary.totalGross > 0 ? Math.round((monthSummary.totalFuel / monthSummary.totalGross) * 100) : 0}%)
🍔 *Outros Gastos:* ${formatCurrency(monthSummary.totalOther)}

📅 *Dias Trabalhados:* ${monthSummary.daysWorkedCount} dias
🎯 *Média por Dia:* ${formatCurrency(monthSummary.averageProfitPerDay)}/dia
🚗 *Km Total Rodado:* ${monthSummary.totalKm} km (${formatCurrency(monthSummary.profitPerKm)}/km líquido)
⏱️ *Horas Trabalhadas:* ${monthSummary.totalHours}h (${formatCurrency(monthSummary.profitPerHour)}/h líquida)
--------------------------------
Salvo no meu Diária & Tanque`;

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Exportar para arquivo CSV
  const handleExportCSV = () => {
    const headers = ['Data', 'Dia', 'Bruto (R$)', 'Gasolina (R$)', 'Outros (R$)', 'Líquido (R$)', 'Km', 'Horas', 'Corridas', 'Observações'];
    const rows = daySummaries.map((d) => [
      formatDateBR(d.date),
      getWeekdayName(d.date),
      d.totalGross.toFixed(2),
      d.totalFuel.toFixed(2),
      d.totalOther.toFixed(2),
      d.netProfit.toFixed(2),
      d.kmDriven || 0,
      d.hoursWorked || 0,
      d.closing?.ridesCount || 0,
      `"${d.closing?.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fechamento_${currentMonthKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fuelPercentage =
    monthSummary.totalGross > 0
      ? Math.round((monthSummary.totalFuel / monthSummary.totalGross) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Barra de Seleção do Mês */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              title="Mês anterior"
              className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              title="Próximo mês"
              className="w-9 h-9 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neutral-500" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
              {monthSummary.monthLabel}
            </h1>
          </div>
        </div>

        {/* Ações de Relatório */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyWhatsAppSummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedToast ? 'Copiado!' : 'Copiar Resumo'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Baixar Planilha (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* PLACAR DO MÊS (Grandes Números Consolidados) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lucro Líquido Real */}
        <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Lucro Líquido no Bolso
            </div>
            <div className="mt-2 text-3xl sm:text-4xl font-extrabold font-mono tabular-nums">
              {formatCurrency(monthSummary.netProfit)}
            </div>
          </div>
          <div className="mt-3 text-xs text-emerald-100 flex items-center justify-between">
            <span>{monthSummary.daysWorkedCount} dias trabalhados</span>
            <span className="font-semibold">{formatCurrency(monthSummary.averageProfitPerDay)}/dia</span>
          </div>
        </div>

        {/* Faturamento Bruto */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-neutral-500">Faturamento Bruto Total</div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {formatCurrency(monthSummary.totalGross)}
            </div>
          </div>
          <div className="mt-3 text-xs text-neutral-500">
            Total recebido de todos os apps
          </div>
        </div>

        {/* Gasolina Total */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-amber-800 flex items-center justify-between">
              <span>Gasto com Combustível</span>
              <Fuel className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {formatCurrency(monthSummary.totalFuel)}
            </div>
          </div>
          <div className="mt-3 text-xs text-neutral-600 flex items-center justify-between">
            <span>{fuelPercentage}% do faturamento</span>
            {monthSummary.totalLiters > 0 && (
              <span className="font-mono">{monthSummary.totalLiters.toFixed(1)} Litros</span>
            )}
          </div>
        </div>

        {/* Outras Despesas */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-medium text-neutral-500 flex items-center justify-between">
              <span>Outros Gastos na Rua</span>
              <Receipt className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums text-neutral-900">
              {formatCurrency(monthSummary.totalOther)}
            </div>
          </div>
          <div className="mt-3 text-xs text-neutral-500">
            Alimentação, pedágio, lavagem, etc.
          </div>
        </div>
      </div>

      {/* Faixa de Médias & Eficiência Operacional */}
      {(monthSummary.totalKm > 0 || monthSummary.totalHours > 0) && (
        <div className="bg-neutral-900 text-white rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">Eficiência no Mês:</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm">
            {monthSummary.totalKm > 0 && (
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-neutral-400" />
                <span>
                  <strong className="font-mono tabular-nums">{monthSummary.totalKm} km</strong> rodados
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {formatCurrency(monthSummary.profitPerKm)}/km líq.
                </span>
              </div>
            )}

            {monthSummary.totalHours > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>
                  <strong className="font-mono tabular-nums">{monthSummary.totalHours}h</strong> trabalhadas
                </span>
                <span className="text-neutral-400">·</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {formatCurrency(monthSummary.profitPerHour)}/h líq.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LISTA / HISTÓRICO DIA A DIA DO MÊS */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Histórico Diário ({daySummaries.length} dias registrados)
            </h2>
            <p className="text-xs text-neutral-500">
              Clique em qualquer dia para ver os detalhes completos ou editar.
            </p>
          </div>
        </div>

        {daySummaries.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm font-medium text-neutral-600">
              Nenhum fechamento registrado em {monthSummary.monthLabel}.
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Use os botões no topo para fazer o fechamento do dia ou anotar combustível.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {daySummaries.map((day) => {
              const isExpanded = expandedDate === day.date;
              const hasData = day.totalGross > 0 || day.totalFuel > 0 || day.totalOther > 0;

              return (
                <div key={day.date} className="transition-colors hover:bg-neutral-50/70">
                  {/* Linha principal do dia */}
                  <div
                    onClick={() => toggleExpand(day.date)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    {/* Data e Dia da Semana */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-center py-1 px-1.5 bg-neutral-100 rounded-xl">
                        <div className="text-[10px] font-semibold uppercase text-neutral-500">
                          {getWeekdayName(day.date).slice(0, 3)}
                        </div>
                        <div className="text-base font-bold font-mono text-neutral-900 leading-tight">
                          {day.date.split('-')[2]}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-neutral-900">
                          {formatDateBR(day.date)}
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                          {day.closing ? (
                            <span className="text-emerald-700 font-medium">Dia Fechado</span>
                          ) : (
                            <span className="text-amber-700">Apenas Abastecimento</span>
                          )}
                          {day.kmDriven > 0 && <span>· {day.kmDriven} km</span>}
                          {day.hoursWorked > 0 && <span>· {day.hoursWorked}h</span>}
                        </div>
                      </div>
                    </div>

                    {/* Resumo Financeiro da Linha */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      {/* Bruto */}
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-semibold text-neutral-400">Bruto</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-neutral-900">
                          {formatCurrency(day.totalGross)}
                        </div>
                      </div>

                      {/* Gasolina */}
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-semibold text-amber-700">Gasolina</div>
                        <div className="text-sm font-bold font-mono tabular-nums text-amber-800">
                          {day.totalFuel > 0 ? `- ${formatCurrency(day.totalFuel)}` : '—'}
                        </div>
                      </div>

                      {/* Lucro Líquido */}
                      <div className="text-right min-w-[100px]">
                        <div className="text-[10px] uppercase font-semibold text-emerald-700">Líquido</div>
                        <div
                          className={`text-base font-extrabold font-mono tabular-nums ${
                            day.netProfit > 0 ? 'text-emerald-600' : 'text-neutral-900'
                          }`}
                        >
                          {formatCurrency(day.netProfit)}
                        </div>
                      </div>

                      {/* Ícone de expandir */}
                      <div className="text-neutral-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 bg-neutral-50/80 border-t border-neutral-100 space-y-4 text-xs">
                      {/* Detalhamento de corridas e ganhos */}
                      {day.closing && (
                        <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between font-semibold text-neutral-800">
                            <span>Informações do Fechamento</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (day.closing) onEditClosing(day.closing);
                              }}
                              className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900 text-xs font-medium cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Editar
                            </button>
                          </div>

                          {day.closing.breakdown && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-neutral-600">
                              {day.closing.breakdown.uber !== undefined && (
                                <div>
                                  Uber: <strong className="font-mono text-neutral-900">{formatCurrency(day.closing.breakdown.uber)}</strong>
                                </div>
                              )}
                              {day.closing.breakdown.app99 !== undefined && (
                                <div>
                                  99: <strong className="font-mono text-neutral-900">{formatCurrency(day.closing.breakdown.app99)}</strong>
                                </div>
                              )}
                              {day.closing.breakdown.deliveries !== undefined && (
                                <div>
                                  Entregas: <strong className="font-mono text-neutral-900">{formatCurrency(day.closing.breakdown.deliveries)}</strong>
                                </div>
                              )}
                              {day.closing.breakdown.privateRides !== undefined && (
                                <div>
                                  Particular: <strong className="font-mono text-neutral-900">{formatCurrency(day.closing.breakdown.privateRides)}</strong>
                                </div>
                              )}
                            </div>
                          )}

                          {day.closing.notes && (
                            <p className="text-neutral-600 italic pt-1 border-t border-neutral-100">
                              "{day.closing.notes}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Lista de Abastecimentos do dia */}
                      {day.fuelExpenses.length > 0 && (
                        <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-2">
                          <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                            <Fuel className="w-3.5 h-3.5 text-amber-700" />
                            <span>Abastecimentos Registrados</span>
                          </div>

                          <div className="space-y-1.5 divide-y divide-neutral-100">
                            {day.fuelExpenses.map((fuel) => (
                              <div key={fuel.id} className="pt-1.5 flex items-center justify-between text-neutral-600">
                                <div>
                                  <strong className="text-neutral-900">{fuel.fuelType}</strong>
                                  {fuel.time && <span> às {fuel.time}</span>}
                                  {fuel.stationName && <span> ({fuel.stationName})</span>}
                                  {fuel.liters && (
                                    <span className="text-neutral-500 font-mono"> · {fuel.liters} L</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-neutral-900">
                                    {formatCurrency(fuel.amount)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditFuel(fuel);
                                    }}
                                    title="Editar combustível"
                                    className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteFuel(fuel.id);
                                    }}
                                    title="Excluir combustível"
                                    className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lista de Outros Gastos do dia */}
                      {day.otherExpenses.length > 0 && (
                        <div className="p-3 bg-white border border-neutral-200 rounded-xl space-y-2">
                          <div className="font-semibold text-neutral-800 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-neutral-600" />
                            <span>Outros Gastos na Rua</span>
                          </div>

                          <div className="space-y-1.5 divide-y divide-neutral-100">
                            {day.otherExpenses.map((other) => (
                              <div key={other.id} className="pt-1.5 flex items-center justify-between text-neutral-600">
                                <div>
                                  <strong className="text-neutral-900">{other.description}</strong>
                                  <span className="text-neutral-500"> ({other.category})</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-neutral-900">
                                    {formatCurrency(other.amount)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteExpense(other.id);
                                    }}
                                    title="Excluir gasto"
                                    className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Botão para excluir o fechamento do dia se necessário */}
                      {day.closing && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (day.closing && confirm(`Excluir o fechamento do dia ${formatDateBR(day.date)}?`)) {
                                onDeleteClosing(day.closing.id);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir fechamento deste dia
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
