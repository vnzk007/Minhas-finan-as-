import { DailyClosing, FuelExpense, OtherExpense, DaySummary, MonthSummary } from '../types';

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0);
};

export const formatDateBR = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const getWeekdayName = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00');
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[date.getDay()];
};

export const getMonthLabel = (yearMonth: string): string => {
  // yearMonth format: "2026-10"
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const monthIdx = parseInt(month, 10) - 1;
  return `${months[monthIdx] || month} de ${year}`;
};

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const buildDaySummary = (
  date: string,
  closings: DailyClosing[],
  fuelExpenses: FuelExpense[],
  otherExpenses: OtherExpense[]
): DaySummary => {
  const closing = closings.find((c) => c.date === date);
  const dayFuels = fuelExpenses.filter((f) => f.date === date);
  const dayOthers = otherExpenses.filter((o) => o.date === date);

  const totalGross = closing ? closing.grossEarnings : 0;
  const totalFuel = dayFuels.reduce((sum, f) => sum + f.amount, 0);
  const totalOther = dayOthers.reduce((sum, o) => sum + o.amount, 0);
  const totalExpenses = totalFuel + totalOther;
  const netProfit = totalGross - totalExpenses;
  const kmDriven = closing?.kmDriven || 0;
  const hoursWorked = closing?.hoursWorked || 0;

  return {
    date,
    closing,
    fuelExpenses: dayFuels,
    otherExpenses: dayOthers,
    totalGross,
    totalFuel,
    totalOther,
    totalExpenses,
    netProfit,
    kmDriven,
    hoursWorked,
  };
};

export const buildMonthSummary = (
  monthKey: string, // "2026-10"
  closings: DailyClosing[],
  fuelExpenses: FuelExpense[],
  otherExpenses: OtherExpense[]
): {
  summary: MonthSummary;
  daySummaries: DaySummary[];
} => {
  // Find all distinct dates in this month from closings and fuels and others
  const datesSet = new Set<string>();

  closings
    .filter((c) => c.date.startsWith(monthKey))
    .forEach((c) => datesSet.add(c.date));

  fuelExpenses
    .filter((f) => f.date.startsWith(monthKey))
    .forEach((f) => datesSet.add(f.date));

  otherExpenses
    .filter((o) => o.date.startsWith(monthKey))
    .forEach((o) => datesSet.add(o.date));

  // Sort dates descending (most recent first)
  const sortedDates = Array.from(datesSet).sort((a, b) => b.localeCompare(a));

  const daySummaries = sortedDates.map((date) =>
    buildDaySummary(date, closings, fuelExpenses, otherExpenses)
  );

  const daysWorkedCount = daySummaries.filter((d) => d.closing && d.totalGross > 0).length;
  const totalGross = daySummaries.reduce((sum, d) => sum + d.totalGross, 0);
  const totalFuel = daySummaries.reduce((sum, d) => sum + d.totalFuel, 0);
  const totalOther = daySummaries.reduce((sum, d) => sum + d.totalOther, 0);
  const totalExpenses = totalFuel + totalOther;
  const netProfit = totalGross - totalExpenses;
  const averageProfitPerDay = daysWorkedCount > 0 ? netProfit / daysWorkedCount : 0;

  const totalKm = daySummaries.reduce((sum, d) => sum + d.kmDriven, 0);
  const totalHours = daySummaries.reduce((sum, d) => sum + d.hoursWorked, 0);

  const profitPerHour = totalHours > 0 ? netProfit / totalHours : 0;
  const profitPerKm = totalKm > 0 ? netProfit / totalKm : 0;

  const monthFuels = fuelExpenses.filter((f) => f.date.startsWith(monthKey));
  const totalLiters = monthFuels.reduce((sum, f) => sum + (f.liters || 0), 0);

  const summary: MonthSummary = {
    monthKey,
    monthLabel: getMonthLabel(monthKey),
    daysWorkedCount,
    totalGross,
    totalFuel,
    totalOther,
    totalExpenses,
    netProfit,
    averageProfitPerDay,
    totalKm,
    totalHours,
    profitPerHour,
    profitPerKm,
    totalLiters,
  };

  return { summary, daySummaries };
};
