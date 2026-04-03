import { Link, useLocation } from "wouter";
import { useFinance } from "@/store/financeStore";
import {
  LayoutDashboard, ArrowLeftRight, Lightbulb, Settings, Bell,
  Shield, Eye, Sun, Moon, CreditCard, Menu, X
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/insights", icon: Lightbulb, label: "Insights" },
  { href: "/cards", icon: CreditCard, label: "Cards" },
];

const BOTTOM_ITEMS = [
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole, darkMode, toggleDarkMode } = useFinance();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex bg-background transition-colors duration-300">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 transition-colors duration-500">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-500/3" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-amber-400/6 blur-3xl dark:bg-amber-600/4" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — icon only, slim */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col items-center py-5 transition-transform duration-300",
          "w-16 bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/50",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-6 h-px bg-sidebar-border/50 mb-4" />

        {/* Main nav */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = location === href;
            return (
              <Tooltip key={href} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    data-testid={`nav-${label.toLowerCase()}`}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative group",
                      active
                        ? "bg-primary text-primary-foreground shadow-lg shadow-amber-500/25"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {active && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[1px] w-0.5 h-5 bg-primary rounded-l-full" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-px bg-sidebar-border/50 mb-2" />
          {/* Dark mode */}
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <button
                onClick={toggleDarkMode}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-all"
                data-testid="toggle-dark-mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">{darkMode ? "Light Mode" : "Dark Mode"}</TooltipContent>
          </Tooltip>

          {BOTTOM_ITEMS.map(({ icon: Icon, label }) => (
            <Tooltip key={label} delayDuration={300}>
              <TooltipTrigger asChild>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-all">
                  <Icon className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">{label}</TooltipContent>
            </Tooltip>
          ))}

          {/* Avatar */}
          <div className="mt-2 w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-bold text-white shadow-md cursor-pointer">
            {role === "admin" ? "A" : "V"}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-16 relative z-10">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-4 py-3 md:hidden border-b border-border/40">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-lg glass-card flex items-center justify-center"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">F</span>
          </div>
          <button onClick={toggleDarkMode} className="w-9 h-9 rounded-lg glass-card flex items-center justify-center">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Role banner (subtle) */}
        <div className="hidden md:flex items-center justify-end px-6 pt-4 pb-0 gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {role === "admin" ? <Shield className="w-3 h-3 text-primary" /> : <Eye className="w-3 h-3" />}
            <span>Role:</span>
          </div>
          <Select value={role} onValueChange={(v) => setRole(v as "admin" | "viewer")}>
            <SelectTrigger
              className="h-7 w-28 text-xs bg-card/50 border-border/50 text-foreground px-2.5"
              data-testid="select-role"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <main className="flex-1 overflow-auto scrollbar-thin">
          {children}
        </main>
      </div>

      {/* Mobile close button */}
      {mobileOpen && (
        <button
          className="fixed top-4 left-[72px] z-40 w-8 h-8 rounded-full glass-card flex items-center justify-center md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
