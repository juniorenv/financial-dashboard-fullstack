import { Link } from "@tanstack/react-router";
import { CalendarDays, DollarSign } from "lucide-react";

import { useExchangeRate } from "@/hooks/useExchangeRate";
import { formatExchangeRate } from "@/lib/utils";

export function Topbar() {
  const { data: exchange, isLoading } = useExchangeRate();

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-600/10 px-3 py-1.5 text-sm font-semibold text-emerald-200 no-underline"
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          <span>Dashboard Financeiro</span>
        </Link>

        <div className="ml-auto flex items-center gap-3 text-xs text-slate-300">
          <div className="hidden items-center gap-1 sm:flex">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span>{today}</span>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1">
            <DollarSign className="h-3 w-3 text-emerald-400" />
            {isLoading || !exchange ? (
              <span className="text-[0.7rem] text-slate-400">
                Carregando câmbio...
              </span>
            ) : (
              <span className="text-[0.7rem] text-slate-300">
                1 USD = {formatExchangeRate(exchange.rate)} BRL
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

