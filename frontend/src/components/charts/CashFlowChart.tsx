import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardCashFlowItem } from "@/services/dashboard.service";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: DashboardCashFlowItem[]
}

// ─── Cores ────────────────────────────────────────────────────────────────────
const COLORS = {
  income: "#22c55e",
  expenses: "#fb7185",
  balance: "#38bdf8",
  projectedIncome: "#86efac",
  projectedExpenses: "#fda4af",
  projectedBalance: "#7dd3fc",
} as const;

// ─── Tooltip customizado ──────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const d = payload[0]?.payload as DashboardCashFlowItem & { label: string };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs shadow-xl min-w-55">
      <p className="mb-2 font-semibold text-slate-300">{label}</p>

      {/* ── Realizado ── */}
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Realizado
      </p>
      <div className="space-y-1 mb-2">
        <div className="flex justify-between gap-4">
          <span style={{ color: COLORS.income }}>Recebido</span>
          <span className="font-medium text-slate-100">{formatCurrency(d.income)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: COLORS.expenses }}>Pago</span>
          <span className="font-medium text-slate-100">{formatCurrency(d.expenses)}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-slate-800 pt-1">
          <span style={{ color: COLORS.balance }}>Saldo realizado</span>
          <span
            className="font-semibold"
            style={{ color: d.balance >= 0 ? COLORS.balance : COLORS.expenses }}
          >
            {formatCurrency(d.balance)}
          </span>
        </div>
      </div>

      {/* ── Projetado ── */}
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Projetado
      </p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span style={{ color: COLORS.projectedIncome }}>Receita</span>
          <span className="font-medium text-slate-100">{formatCurrency(d.projectedIncome)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: COLORS.projectedExpenses }}>Despesa</span>
          <span className="font-medium text-slate-100">{formatCurrency(d.projectedExpenses)}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-slate-800 pt-1">
          <span style={{ color: COLORS.projectedBalance }}>Saldo projetado</span>
          <span
            className="font-semibold"
            style={{ color: d.projectedBalance >= 0 ? COLORS.projectedBalance : COLORS.projectedExpenses }}
          >
            {formatCurrency(d.projectedBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function CashFlowChart({ data }: Props) {
  const chartData = data.map((item) => ({
    ...item,
    label: item.month,
  }));

  return (
    <ResponsiveContainer
      width="100%"
      height={280}
    >
      <LineChart data={chartData}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e293b"
        />
        <XAxis
          dataKey="label"
          stroke="#94a3b8"
        />
        <YAxis
          tickFormatter={(value) => formatCurrency(Number(value))}
          stroke="#94a3b8"
          width={120}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-slate-300">{value}</span>
          )}
        />

        {/* ── Realizado ─────────────────────────────────────────────────── */}
        <Line
          type="monotone"
          dataKey="income"
          name="Recebido"
          stroke={COLORS.income}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Pago"
          stroke={COLORS.expenses}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="balance"
          name="Saldo realizado"
          stroke={COLORS.balance}
          strokeWidth={2}
          dot={false}
        />

        {/* ── Projetado (tracejado, cores mais claras) ───────────────────── */}
        <Line
          type="monotone"
          dataKey="projectedIncome"
          name="Receita projetada"
          stroke={COLORS.projectedIncome}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="projectedExpenses"
          name="Despesa projetada"
          stroke={COLORS.projectedExpenses}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="projectedBalance"
          name="Saldo projetado"
          stroke={COLORS.projectedBalance}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
