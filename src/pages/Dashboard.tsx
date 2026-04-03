import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useFinance } from "@/store/financeStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Search, Wifi, CreditCard
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import TransactionDialog from "@/components/TransactionDialog";
import { format, parseISO } from "date-fns";

function formatCurrency(n: number, compact = false) {
  if (compact && n >= 1000) {
    return `$${(n / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const MOCK_CARDS = [
  { bank: "US BANK", type: "VIP card", number: "7859 5562 **** 6254", expiry: "02/26", dark: true },
  { bank: "UK BANK", type: "Debit card", number: "5348 4839 **** 6254", expiry: "02/26", dark: false },
  { bank: "US BANK", type: "Credit card", number: "3454 7387 ****4920", expiry: "02/26", dark: false, highlight: true },
];

type TimePeriod = "D" | "W" | "M" | "Y";
type ChartTab = "Outcome" | "Income";

export default function Dashboard() {
  const { transactions, role } = useFinance();
  const [showDialog, setShowDialog] = useState(false);
  const [period, setPeriod] = useState<TimePeriod>("M");
  const [chartTab, setChartTab] = useState<ChartTab>("Outcome");

  const now = new Date();
  const dayName = format(now, "EEEE, MMM dd yyyy");

  const summary = useMemo(() => {
    const all = transactions;
    const totalIncome = all.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = all.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const netBalance = totalIncome - totalExpense;
    // Investment = income from Investment category
    const investment = all.filter(t => t.category === "Investment" && t.type === "income").reduce((s, t) => s + t.amount, 0);
    return { totalIncome, totalExpense, netBalance, investment };
  }, [transactions]);

  const chartData = useMemo(() => {
    if (period === "M") {
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
          label: format(parseISO(`${month}-01`), "MMM yy"),
          value: chartTab === "Income" ? data.income : data.expense,
        }));
    }
    if (period === "W") {
      // Last 7 days
      const days: Record<string, { income: number; expense: number }> = {};
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = format(d, "yyyy-MM-dd");
        days[key] = { income: 0, expense: 0 };
      }
      transactions.forEach(t => {
        if (days[t.date]) {
          if (t.type === "income") days[t.date].income += t.amount;
          else days[t.date].expense += t.amount;
        }
      });
      return Object.entries(days).map(([date, data]) => ({
        label: format(parseISO(date), "EEE"),
        value: chartTab === "Income" ? data.income : data.expense,
      }));
    }
    if (period === "Y") {
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
          label: format(parseISO(`${month}-01`), "MMM"),
          value: chartTab === "Income" ? data.income : data.expense,
        }));
    }
    // Day - hourly mock
    return Array.from({ length: 12 }, (_, i) => ({
      label: `${i * 2}h`,
      value: Math.random() * 300 + 50,
    }));
  }, [transactions, period, chartTab]);

  const currentValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((s, d) => s + d.value, 0);
  }, [chartData]);

  const recentTransactions = useMemo(() =>
    [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)
  , [transactions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-md border border-border/40 rounded-xl p-2.5 shadow-xl text-xs">
          <p className="text-primary font-semibold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-5 lg:p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-foreground text-base">Hello, {role === "admin" ? "Admin" : "Viewer"}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{dayName}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 glass-card rounded-xl px-3 h-8 text-muted-foreground">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <input
              placeholder="Search..."
              className="bg-transparent text-xs outline-none w-32 text-foreground placeholder:text-muted-foreground"
              data-testid="input-search-top"
            />
          </div>
          {role === "admin" && (
            <Button
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 shadow-lg shadow-amber-500/20"
              onClick={() => setShowDialog(true)}
              data-testid="button-add-transaction"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left/center: balance + chart + recent txns */}
        <div className="xl:col-span-2 space-y-4">
          {/* Balance cards row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Balance card */}
            <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="card-total-balance">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">My balance</span>
                <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>+42%</span>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {formatCurrency(summary.netBalance)}
              </p>
            </div>

            {/* Investment card */}
            <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="card-investment">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium">Investment</span>
                <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12%</span>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {formatCurrency(summary.investment || 1160)}
              </p>
            </div>
          </div>

          {/* Chart card */}
          <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="chart-area">
            {/* Tab row */}
            <div className="flex items-center justify-between mb-4">
              {/* Outcome / Income sliding toggle */}
              <div className="relative flex items-center p-1 bg-black/25 rounded-xl border border-white/5">
                {/* Sliding pill */}
                <div
                  className="absolute top-1 bottom-1 rounded-[10px] bg-primary shadow-lg shadow-amber-500/25 transition-all duration-300 ease-in-out"
                  style={{
                    width: "calc(50% - 4px)",
                    left: chartTab === "Outcome" ? "4px" : "calc(50%)",
                  }}
                />
                {(["Outcome", "Income"] as ChartTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    className={`relative z-10 px-5 py-1.5 rounded-[10px] text-xs font-semibold transition-colors duration-200 w-24 text-center ${
                      chartTab === tab ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`tab-${tab.toLowerCase()}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Period selector — sliding pill */}
              <div className="relative flex items-center p-1 bg-black/25 rounded-xl border border-white/5">
                {/* Sliding pill */}
                <div
                  className="absolute top-1 bottom-1 rounded-[8px] bg-primary shadow-md shadow-amber-500/20 transition-all duration-300 ease-in-out"
                  style={{
                    width: "calc(25% - 2px)",
                    left: `calc(${["D","W","M","Y"].indexOf(period)} * 25% + 4px)`,
                  }}
                />
                {(["D", "W", "M", "Y"] as TimePeriod[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`relative z-10 w-8 h-7 rounded-[8px] text-xs font-semibold transition-colors duration-200 text-center ${
                      period === p ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`period-${p}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{formatCurrency(currentValue)}</span>
              <div className="flex items-center gap-1 text-xs text-red-400">
                <TrendingDown className="w-3 h-3" />
                <span>50%</span>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#f59e0b", stroke: "rgba(245,158,11,0.3)", strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions */}
          <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="card-recent-transactions">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
              <Link href="/transactions" className="text-xs text-primary hover:text-primary/80 transition-colors">
                View all
              </Link>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0"
                    data-testid={`transaction-row-${tx.id}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === "income" ? "bg-green-500/15" : "bg-red-500/15"
                    }`}>
                      {tx.type === "income"
                        ? <ArrowUpRight className="w-4 h-4 text-green-400" />
                        : <ArrowDownRight className="w-4 h-4 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{format(parseISO(tx.date), "MMM d, yyyy")} · {tx.category}</p>
                    </div>
                    <span className={`text-sm font-semibold shrink-0 ${
                      tx.type === "income" ? "text-green-400" : "text-red-400"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: My Cards panel */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="panel-my-cards">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">My cards</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{MOCK_CARDS.length} active cards</p>
              </div>
              {role === "admin" && (
                <button
                  className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-amber-500/20 hover:bg-primary/90 transition-colors"
                  data-testid="button-add-card"
                >
                  <Plus className="w-4 h-4 text-primary-foreground" />
                </button>
              )}
            </div>

            {/* Cards list */}
            <div className="space-y-3">
              {MOCK_CARDS.map((card, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-4 relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.01] ${
                    card.dark
                      ? "bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5"
                      : "bg-gradient-to-br from-neutral-700/60 to-neutral-800/60 border border-white/5"
                  }`}
                  data-testid={`card-item-${idx}`}
                >
                  {/* Card shimmer */}
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/3 -translate-y-1/2 translate-x-1/2 blur-xl" />

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{card.bank}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{card.type}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-white/50 rotate-90" />
                      <CreditCard className="w-3.5 h-3.5 text-white/50" />
                    </div>
                  </div>

                  <p className="text-sm font-medium text-white/90 tracking-wider font-mono mb-3">{card.number}</p>

                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-white/40">{card.expiry}</p>
                    {card.highlight && (
                      <span className="text-[10px] text-primary font-medium cursor-pointer hover:text-primary/80">
                        All cards →
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="glass-card rounded-2xl p-4 md:p-5" data-testid="panel-quick-stats">
            <h3 className="text-sm font-semibold text-foreground mb-3">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">Income</span>
                </div>
                <span className="text-sm font-semibold text-green-400">
                  {formatCurrency(transactions.filter(t => t.type === "income" && t.date.startsWith("2026-04")).reduce((s, t) => s + t.amount, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span className="text-xs text-muted-foreground">Expenses</span>
                </div>
                <span className="text-sm font-semibold text-red-400">
                  {formatCurrency(transactions.filter(t => t.type === "expense" && t.date.startsWith("2026-04")).reduce((s, t) => s + t.amount, 0))}
                </span>
              </div>
              <div className="pt-1 border-t border-border/30 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Net savings</span>
                <span className="text-sm font-bold text-primary">
                  {formatCurrency(
                    transactions.filter(t => t.date.startsWith("2026-04")).reduce((s, t) =>
                      t.type === "income" ? s + t.amount : s - t.amount, 0
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransactionDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </div>
  );
}
