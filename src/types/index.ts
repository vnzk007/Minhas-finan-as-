export interface DailyClosing {
  id: string;
  date: string; // YYYY-MM-DD
  grossEarnings: number; // Total bruto ganho no dia
  breakdown?: {
    uber?: number;
    app99?: number;
    deliveries?: number;
    privateRides?: number;
    other?: number;
  };
  kmDriven?: number; // Km rodado no dia
  hoursWorked?: number; // Horas trabalhadas
  ridesCount?: number; // Quantidade de corridas/entregas
  notes?: string;
  createdAt: string;
}

export type FuelType = 'Gasolina Comum' | 'Gasolina Aditivada' | 'Etanol' | 'GNV' | 'Diesel';

export interface FuelExpense {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  amount: number; // R$ total pago no posto
  fuelType: FuelType;
  liters?: number;
  pricePerLiter?: number;
  odometerKm?: number;
  stationName?: string;
  notes?: string;
  createdAt: string;
}

export type OtherExpenseCategory = 'Alimentação' | 'Manutenção' | 'Pedágio' | 'Lavagem' | 'Outro';

export interface OtherExpense {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  category: OtherExpenseCategory;
  createdAt: string;
}

export interface DaySummary {
  date: string;
  closing?: DailyClosing;
  fuelExpenses: FuelExpense[];
  otherExpenses: OtherExpense[];
  totalGross: number;
  totalFuel: number;
  totalOther: number;
  totalExpenses: number;
  netProfit: number;
  kmDriven: number;
  hoursWorked: number;
}

export interface MonthSummary {
  monthKey: string; // YYYY-MM
  monthLabel: string; // Ex: "Outubro de 2026"
  daysWorkedCount: number;
  totalGross: number;
  totalFuel: number;
  totalOther: number;
  totalExpenses: number;
  netProfit: number;
  averageProfitPerDay: number;
  totalKm: number;
  totalHours: number;
  profitPerHour: number;
  profitPerKm: number;
  totalLiters: number;
}
