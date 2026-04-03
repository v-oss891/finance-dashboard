import { useState } from "react";
import { useFinance } from "@/store/financeStore";
import { Plus, Wifi, CreditCard, MoreHorizontal, Eye, EyeOff, ArrowUpRight, ArrowDownRight, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const CARDS_DATA = [
  {
    id: "c1",
    bank: "US BANK",
    type: "VIP card",
    number: "7859 5562 8823 6254",
    expiry: "02/26",
    cvv: "412",
    holder: "John Admin",
    limit: 10000,
    spent: 2674,
    color: "from-neutral-800 to-neutral-950",
    active: true,
  },
  {
    id: "c2",
    bank: "UK BANK",
    type: "Debit card",
    number: "5348 4839 9012 6254",
    expiry: "08/27",
    cvv: "203",
    holder: "John Admin",
    limit: 5000,
    spent: 840,
    color: "from-amber-800/70 to-neutral-800",
    active: true,
  },
  {
    id: "c3",
    bank: "US BANK",
    type: "Credit card",
    number: "3454 7387 6611 4920",
    expiry: "11/25",
    cvv: "719",
    holder: "John Admin",
    limit: 8000,
    spent: 3200,
    color: "from-stone-700 to-stone-900",
    active: false,
  },
];

const RECENT_CARD_TXN = [
  { id: 1, label: "Amazon Purchase", date: "Apr 08", amount: -67.30, icon: "🛍️" },
  { id: 2, label: "Netflix", date: "Apr 03", amount: -17.99, icon: "🎬" },
  { id: 3, label: "Salary Deposit", date: "Apr 01", amount: +5800, icon: "💰" },
  { id: 4, label: "Coffee Shop", date: "Mar 28", amount: -12.40, icon: "☕" },
  { id: 5, label: "Dividend Income", date: "Mar 22", amount: +280, icon: "📈" },
];

export default function Cards() {
  const { role } = useFinance();
  const { toast } = useToast();
  const [selectedCard, setSelectedCard] = useState(CARDS_DATA[0].id);
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});

  const activeCard = CARDS_DATA.find(c => c.id === selectedCard) || CARDS_DATA[0];
  const spentPct = Math.min(100, Math.round((activeCard.spent / activeCard.limit) * 100));
  const isVisible = showNumbers[selectedCard];

  const maskNumber = (num: string) =>
    num.replace(/(\d{4}) (\d{4}) (\d{4}) (\d{4})/, "$1 **** **** $4");

  return (
    <div className="p-4 md:p-5 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">My Cards</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{CARDS_DATA.length} active cards</p>
        </div>
        {role === "admin" && (
          <Button
            size="sm"
            className="h-8 px-3 text-xs gap-1.5 shadow-lg shadow-amber-500/20"
            onClick={() => toast({ title: "Add card", description: "Card management coming soon." })}
            data-testid="button-add-card"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Card
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card selector + detail */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card carousel */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {CARDS_DATA.map(card => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card.id)}
                data-testid={`card-select-${card.id}`}
                className={`shrink-0 rounded-2xl p-4 w-64 text-left transition-all duration-200 relative overflow-hidden ${
                  selectedCard === card.id
                    ? "ring-2 ring-primary shadow-lg shadow-amber-500/20 scale-[1.02]"
                    : "opacity-70 hover:opacity-90"
                } bg-gradient-to-br ${card.color} border border-white/5`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{card.bank}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{card.type}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-white/50 rotate-90" />
                    <CreditCard className="w-3.5 h-3.5 text-white/50" />
                  </div>
                </div>
                <p className="text-sm font-medium text-white/90 tracking-wider font-mono mb-4">
                  {isVisible && selectedCard === card.id ? card.number : maskNumber(card.number)}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-white/40 uppercase">Expires</p>
                    <p className="text-xs text-white/70 font-medium">{card.expiry}</p>
                  </div>
                  {!card.active && (
                    <Badge variant="outline" className="text-[9px] border-red-500/40 text-red-400 bg-red-500/10">Frozen</Badge>
                  )}
                  {card.active && selectedCard === card.id && (
                    <Badge variant="outline" className="text-[9px] border-green-500/40 text-green-400 bg-green-500/10">Active</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Selected card detail */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Card Details</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNumbers(prev => ({ ...prev, [selectedCard]: !prev[selectedCard] }))}
                  data-testid="button-toggle-visibility"
                >
                  {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {isVisible ? "Hide" : "Reveal"}
                </Button>
                {role === "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => toast({ title: activeCard.active ? "Card frozen" : "Card unfrozen", description: `${activeCard.bank} card has been ${activeCard.active ? "frozen" : "unfrozen"}.` })}
                  >
                    {activeCard.active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {activeCard.active ? "Freeze" : "Unfreeze"}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Card Number</p>
                <p className="text-sm font-mono font-medium text-foreground">
                  {isVisible ? activeCard.number : maskNumber(activeCard.number)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Card Holder</p>
                <p className="text-sm font-medium text-foreground">{activeCard.holder}</p>
              </div>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Expiry Date</p>
                <p className="text-sm font-medium text-foreground">{activeCard.expiry}</p>
              </div>
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">CVV</p>
                <p className="text-sm font-mono font-medium text-foreground">
                  {isVisible ? activeCard.cvv : "•••"}
                </p>
              </div>
            </div>

            {/* Spending limit */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Monthly limit usage</span>
                <span className="text-xs font-semibold text-foreground">
                  ${activeCard.spent.toLocaleString()} / ${activeCard.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    spentPct > 80 ? "bg-red-400" : spentPct > 60 ? "bg-amber-400" : "bg-primary"
                  }`}
                  style={{ width: `${spentPct}%` }}
                />
              </div>
              <p className={`text-[10px] mt-1.5 ${spentPct > 80 ? "text-red-400" : "text-muted-foreground"}`}>
                {spentPct}% used · ${(activeCard.limit - activeCard.spent).toLocaleString()} remaining
              </p>
            </div>
          </div>
        </div>

        {/* Recent transactions for this card */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-1">
            {RECENT_CARD_TXN.map(txn => (
              <div
                key={txn.id}
                className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-base shrink-0">
                  {txn.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{txn.label}</p>
                  <p className="text-xs text-muted-foreground">{txn.date}</p>
                </div>
                <span className={`text-sm font-semibold shrink-0 ${txn.amount > 0 ? "text-green-500" : "text-red-400"}`}>
                  {txn.amount > 0 ? "+" : ""}${Math.abs(txn.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Send Money", icon: ArrowUpRight, color: "text-amber-500" },
                { label: "Request", icon: ArrowDownRight, color: "text-green-500" },
                { label: "Details", icon: CreditCard, color: "text-blue-400" },
                { label: "More", icon: MoreHorizontal, color: "text-muted-foreground" },
              ].map(action => (
                <button
                  key={action.label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/8 transition-colors"
                  onClick={() => toast({ title: action.label, description: "Feature coming soon." })}
                >
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                  <span className="text-[10px] text-muted-foreground">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
