import { Link } from "@tanstack/react-router";
import {
  Banknote,
  BarChart3,
  MoveRight,
  WalletCards,
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-900/70 px-4 py-6 md:block">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
          <Banknote className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Empresa X
          </p>
          <p className="text-sm font-semibold text-slate-50">
            Dashboard Financeiro
          </p>
        </div>
      </div>

      <nav className="space-y-1 text-sm">
        <SidebarLink
          to="/dashboard"
          label="Dashboard"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <SidebarLink
          to="/payables"
          label="Contas a pagar"
          icon={<WalletCards className="h-4 w-4" />}
        />
        <SidebarLink
          to="/receivables"
          label="Contas a receber"
          icon={<MoveRight className="h-4 w-4 -scale-x-100" />}
        />
      </nav>
    </aside>
  );
}

interface SidebarLinkProps {
  to: string
  label: string
  icon: React.ReactNode
}

function SidebarLink({ to, label, icon }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-slate-300 transition hover:bg-slate-800 hover:text-slate-50 [&.active]:bg-emerald-500/10 [&.active]:text-emerald-300"
      activeProps={{ className: "active" }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

