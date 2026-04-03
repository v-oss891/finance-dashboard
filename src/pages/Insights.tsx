import { useMemo } from "react";
import { useFinance } from "@/store/financeStore";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Trophy, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import { format, parseISO } from "date-fns";

const COLORS = ["#f59e0b", "#22c55e", "#60a5fa", "#a78bfa", "#f87171", "#34d399", "#fb923c"];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function Insights() {
  const { transactions } = useFinance();

  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const m = t.date.slice(0, 7);
      if (!months[m]) months[m] = { income: 0, expense: 0 };
      if (t.type === "income") months[m].income += t.amount;
      else months[m].expense += t.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: format(parseISO(`${month}-01`), "MMM yy"),
        monthKey: month,
        income: Math.round(data.income),
        expense: Math.round(data.expense),
        savings: Math.round(data.income - data.expense),
        savingsRate: data.income > 0 ? Math.round(((data.income - data.expense) / data.income) * 100) : 0,
      }));
  }, [transactions]);

  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];

  const categorySpending = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats)
      .map(([name, total]) => ({ name, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const currentMonthSpending = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === "expense" && t.date.startsWith("2026-04")).forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats)
      .map(([name, total]) => ({ category: name, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const topCategory = categorySpending[0];
  const bottomCategory = categorySpending[categorySpending.length - 1];

  const incomeChange = prevMonth
    ? ((currentMonth?.income || 0) - prevMonth.income) / prevMonth.income * 100
    : 0;
  const expenseChange = prevMonth
    ? ((currentMonth?.expense || 0) - prevMonth.expense) / prevMonth.expense * 100
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-md border border-border/40 rounded-xl p-2.5 shadow-xl text-xs">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.fill || p.color }}>
              {p.name}: {formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-5 lg:p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-foreground">Insights</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Financial analysis and patterns</p>
      </div>

      {/* Key Insights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4" data-testid="insight-top-category">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Top Category</p>
              <p className="text-base font-bold text-foreground mt-0.5">{topCategory?.name || "—"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{topCategory ? formatCurrency(topCategory.total) : "No data"}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4" data-testid="insight-income-change">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${incomeChange >= 0 ? "bg-green-500/15" : "bg-red-500/15"}`}>
              <TrendingUp className={`w-4 h-4 ${incomeChange >= 0 ? "text-green-400" : "text-red-400"}`} />
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Income MoM</p>
              <p className={`text-base font-bold mt-0.5 flex items-center gap-1 ${incomeChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {incomeChange >= 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {Math.abs(incomeChange).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{currentMonth ? formatCurrency(currentMonth.income) : "—"} this month</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4" data-testid="insight-expense-change">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${expenseChange <= 0 ? "bg-green-500/15" : "bg-amber-500/15"}`}>
              {expenseChange <= 0
                ? <TrendingDown className="w-4 h-4 text-green-400" />
                : <AlertTriangle className="w-4 h-4 text-amber-400" />
              }
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Expenses MoM</p>
              <p className={`text-base font-bold mt-0.5 flex items-center gap-1 ${expenseChange <= 0 ? "text-green-400" : "text-amber-400"}`}>
                {expenseChange <= 0 ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                {Math.abs(expenseChange).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{currentMonth ? formatCurrency(currentMonth.expense) : "—"} this month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="chart-monthly-comparison">
        <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Savings Rate */}
        <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="chart-savings-rate">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Savings Rate</h3>
          <div className="space-y-3">
            {monthlyData.map((m) => (
              <div key={m.monthKey} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground font-medium">{m.month}</span>
                  <span className={`text-xs font-bold ${m.savingsRate >= 0 ? "text-primary" : "text-red-400"}`}>
                    {m.savingsRate}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      m.savingsRate >= 20 ? "bg-green-400" : m.savingsRate >= 0 ? "bg-primary" : "bg-red-400"
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, m.savingsRate))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* This month's spending */}
        <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="chart-top-categories">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">This Month's Spending</h3>
            <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground">April 2026</Badge>
          </div>
          {currentMonthSpending.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No expense data</p>
          ) : (
            <div className="space-y-3">
              {currentMonthSpending.map((item, idx) => {
                const maxVal = currentMonthSpending[0].total;
                const pct = Math.round((item.total / maxVal) * 100);
                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                        <span className="text-xs text-foreground">{item.category}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{formatCurrency(item.total)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: COLORS[idx % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Radar chart */}
      <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="chart-category-radar">
        <h3 className="text-sm font-semibold text-foreground mb-3">All-time Spending by Category</h3>
        {categorySpending.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No expense data</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={categorySpending.slice(0, 8)}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Radar name="Total Spent" dataKey="total" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip
                formatter={(v: number) => formatCurrency(v)}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Observations */}
      <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="card-observations">
        <h3 className="text-sm font-semibold text-foreground mb-3">Key Observations</h3>
        <div className="space-y-2.5">
          {topCategory && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/80 leading-relaxed">
                <span className="font-semibold text-foreground">{topCategory.name}</span> is your biggest spending category at{" "}
                <span className="font-semibold text-primary">{formatCurrency(topCategory.total)}</span> overall.
              </p>
            </div>
          )}
          {currentMonth && prevMonth && (
            <div className={`flex items-start gap-3 p-3 rounded-xl border ${expenseChange > 10 ? "bg-red-500/8 border-red-500/15" : "bg-green-500/8 border-green-500/15"}`}>
              {expenseChange > 10
                ? <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                : <TrendingDown className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              }
              <p className="text-xs text-foreground/80 leading-relaxed">
                {expenseChange > 10
                  ? <>Spending is up <span className="font-semibold text-red-400">{expenseChange.toFixed(1)}%</span> vs last month. Review your budget.</>
                  : <>Expenses {expenseChange <= 0 ? "decreased" : "stayed stable"} compared to last month — solid financial discipline!</>
                }
              </p>
            </div>
          )}
          {currentMonth && (
            <div className={`flex items-start gap-3 p-3 rounded-xl border ${currentMonth.savingsRate >= 20 ? "bg-green-500/8 border-green-500/15" : "bg-primary/8 border-primary/15"}`}>
              <TrendingUp className={`w-4 h-4 shrink-0 mt-0.5 ${currentMonth.savingsRate >= 20 ? "text-green-400" : "text-primary"}`} />
              <p className="text-xs text-foreground/80 leading-relaxed">
                Savings rate this month is{" "}
                <span className={`font-semibold ${currentMonth.savingsRate >= 20 ? "text-green-400" : "text-primary"}`}>
                  {currentMonth.savingsRate}%
                </span>.{" "}
                {currentMonth.savingsRate >= 20
                  ? "Excellent — above the recommended 20% threshold."
                  : "Aim for at least 20% savings rate for long-term financial health."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
