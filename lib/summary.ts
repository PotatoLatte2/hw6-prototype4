export interface Transaction {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlySummary {
  total: number;
  categories: CategorySummary[];
}

export function getMonthYear(monthOffset: number = 0): { year: number; month: number } {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  return {
    year: targetDate.getFullYear(),
    month: targetDate.getMonth() + 1
  };
}

export function filterTransactionsByMonth(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
}

export function calculateMonthlySummary(transactions: Transaction[]): MonthlySummary {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const categories: CategorySummary[] = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return { total, categories };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(pct: number): string {
  return `${pct.toFixed(1)}%`;
}
