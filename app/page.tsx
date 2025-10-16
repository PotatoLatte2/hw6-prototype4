'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  calculateMonthlySummary,
  filterTransactionsByMonth,
  formatCurrency,
  formatPercentage,
  getMonthYear,
  type Transaction,
} from '@/lib/summary';
import transactionsData from '@/data/transactions.json';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
];

export default function Home() {
  const [monthOffset, setMonthOffset] = useState(0);

  const { year, month } = useMemo(
    () => getMonthYear(monthOffset),
    [monthOffset]
  );

  const summary = useMemo(() => {
    const filtered = filterTransactionsByMonth(
      transactionsData as Transaction[],
      year,
      month
    );
    return calculateMonthlySummary(filtered);
  }, [year, month]);

  const chartData = summary.categories.map((cat, idx) => ({
    name: cat.category,
    amount: cat.amount,
    fill: COLORS[idx % COLORS.length],
  }));

  const currentMonth = getMonthYear(0);
  const lastMonth = getMonthYear(-1);

  const monthLabel =
    monthOffset === 0
      ? `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`
      : `${lastMonth.year}-${String(lastMonth.month).padStart(2, '0')}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Budget Manager
          </h1>
          <Select
            value={monthOffset.toString()}
            onValueChange={(value) => setMonthOffset(parseInt(value, 10))}
          >
            <SelectTrigger
              className="w-[160px] bg-white"
              aria-label="Select month"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Current Month</SelectItem>
              <SelectItem value="-1">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardDescription>Total Spending</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900">
              {formatCurrency(summary.total)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{monthLabel}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary.categories.map((cat, idx) => (
                <Badge
                  key={cat.category}
                  variant="secondary"
                  className="px-3 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: COLORS[idx % COLORS.length] + '20',
                    color: COLORS[idx % COLORS.length],
                    border: `1px solid ${COLORS[idx % COLORS.length]}40`,
                  }}
                >
                  {cat.category} — {formatCurrency(cat.amount)} (
                  {formatPercentage(cat.percentage)})
                </Badge>
              ))}
              {summary.categories.length === 0 && (
                <p className="text-sm text-slate-500">
                  No transactions for this month
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-sm text-slate-500">
                  No data available for this month
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
