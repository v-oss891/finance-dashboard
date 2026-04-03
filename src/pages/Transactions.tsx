import { useState, useMemo } from "react";
import { useFinance, CATEGORIES, type Transaction } from "@/store/financeStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit2, Trash2, ArrowUpDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import TransactionDialog from "@/components/TransactionDialog";
import { format, parseISO } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

type SortKey = "date" | "amount" | "description";
type SortDir = "asc" | "desc";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function Transactions() {
  const { transactions, deleteTransaction, role } = useFinance();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showDialog, setShowDialog] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (filterType !== "all") result = result.filter(t => t.type === filterType);
    if (filterCategory !== "all") result = result.filter(t => t.category === filterCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      else cmp = a.description.localeCompare(b.description);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [transactions, search, filterType, filterCategory, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setDeleteTxId(null);
    toast({ title: "Transaction deleted", description: "The transaction has been removed." });
  };

  const netTotal = filtered.reduce((s, t) => t.type === "income" ? s + t.amount : s - t.amount, 0);
  const totalIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-4 md:p-5 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Transactions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} of {transactions.length} records</p>
        </div>
        {role === "admin" && (
          <Button
            onClick={() => { setEditTx(undefined); setShowDialog(true); }}
            size="sm"
            className="h-8 px-3 text-xs gap-1.5 shadow-lg shadow-amber-500/20"
            data-testid="button-add-transaction"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Income</p>
          <p className="text-sm font-bold text-green-400">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Expenses</p>
          <p className="text-sm font-bold text-red-400">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Net</p>
          <p className={`text-sm font-bold ${netTotal >= 0 ? "text-primary" : "text-red-400"}`}>
            {netTotal >= 0 ? "+" : ""}{formatCurrency(netTotal)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs bg-black/20 border-border/40"
              data-testid="input-search"
            />
          </div>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
            <SelectTrigger className="w-full sm:w-30 h-8 text-xs bg-black/20 border-border/40" data-testid="select-filter-type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-36 h-8 text-xs bg-black/20 border-border/40" data-testid="select-filter-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort("date")} data-testid="sort-date">
                    Date <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => handleSort("description")} data-testid="sort-description">
                    Description <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <button className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors" onClick={() => handleSort("amount")} data-testid="sort-amount">
                    Amount <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                {role === "admin" && (
                  <th className="text-right px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={role === "admin" ? 6 : 5} className="text-center py-12 text-muted-foreground text-sm">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border/20 last:border-0 hover:bg-white/2 transition-colors"
                    data-testid={`transaction-row-${tx.id}`}
                  >
                    <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {format(parseISO(tx.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{tx.description}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className="text-[10px] font-normal border-border/40 text-muted-foreground">
                        {tx.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                        {tx.type === "income" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-sm font-semibold text-right ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </td>
                    {role === "admin" && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-white/5"
                            onClick={() => handleEdit(tx)}
                            data-testid={`button-edit-${tx.id}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-white/5"
                            onClick={() => setDeleteTxId(tx.id)}
                            data-testid={`button-delete-${tx.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y divide-border/20">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No transactions found</div>
          ) : (
            filtered.map((tx) => (
              <div key={tx.id} className="px-4 py-3.5 flex items-center gap-3" data-testid={`transaction-row-mobile-${tx.id}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-green-500/15" : "bg-red-500/15"}`}>
                  {tx.type === "income"
                    ? <ArrowUpRight className="w-4 h-4 text-green-400" />
                    : <ArrowDownRight className="w-4 h-4 text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{format(parseISO(tx.date), "MMM d")} · {tx.category}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-sm font-semibold ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                  {role === "admin" && (
                    <div className="flex gap-0.5 ml-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-white/5" onClick={() => handleEdit(tx)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 hover:text-destructive hover:bg-white/5" onClick={() => setDeleteTxId(tx.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <TransactionDialog
        open={showDialog}
        onClose={() => { setShowDialog(false); setEditTx(undefined); }}
        editTx={editTx}
      />

      <AlertDialog open={!!deleteTxId} onOpenChange={(v) => { if (!v) setDeleteTxId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This transaction will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTxId && handleDelete(deleteTxId)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
