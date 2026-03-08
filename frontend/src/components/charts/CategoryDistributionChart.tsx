import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { DashboardCategoryDistribution } from "@/services/dashboard.service";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: DashboardCategoryDistribution
}

const COLORS = [
  "#22c55e", "#38bdf8", "#f97316", "#eab308", "#a855f7",
  "#ec4899", "#14b8a6", "#575AF2", "#f43f5e", "#945100",
  "#84cc16", "#1d4ed8", "#be123c", "#0f766e", "#64748b",
];

// ─── Legenda customizada em grid ──────────────────────────────────────────────

interface LegendItem {
  name: string
  value: number
  color: string
}

function ChartLegend({ items }: { items: LegendItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-1.5 min-w-0"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span
            className="truncate text-xs text-slate-400"
            title={item.name}
          >
            {item.name}
          </span>
          <span className="ml-auto shrink-0 text-xs font-medium text-slate-300">
            {total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : "0%"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Tooltip customizado ──────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; payload: { color: string } }[]
  total: number
}

function CustomTooltip({ active, payload, total }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const pct  = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-100">{item.name}</p>
      <p className="mt-0.5 text-slate-300">{formatCurrency(item.value)}</p>
      <p className="text-slate-500">{pct}% do total</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

type Tab = "payables" | "receivables";

export function CategoryDistributionChart({ data }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("payables");

  const payables = data.payables.map((item, i) => ({
    name: item.category || "Sem categoria",
    value: item.total,
    color: COLORS[i % COLORS.length],
  }));

  const receivables = data.receivables.map((item, i) => ({
    name: item.category || "Sem categoria",
    value: item.total,
    color: COLORS[i % COLORS.length],
  }));

  const activeData  = activeTab === "payables" ? payables : receivables;
  const activeTotal = activeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="mb-3 flex gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("payables")}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "payables"
              ? "bg-slate-800 text-slate-100"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          A pagar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("receivables")}
          className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "receivables"
              ? "bg-slate-800 text-slate-100"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          A receber
        </button>
      </div>

      {/* ── Donut centralizado ──────────────────────────────────────────── */}
      <ResponsiveContainer
        width="100%"
        height={260}
      >
        <PieChart>
          <Pie
            data={activeData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}  // donut — espaço central para valor total
            outerRadius={110}
            paddingAngle={2}
            minAngle={10}
          >
            {activeData.map((item) => (
              <Cell
                key={item.name}
                fill={item.color}
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip total={activeTotal} />}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* ── Total no centro (posicionado sobre o donut via CSS) ─────────── */}
      <div className="-mt-36 mb-24 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-xs text-slate-500">Total</p>
        <p className="text-sm font-semibold text-slate-200">
          {formatCurrency(activeTotal)}
        </p>
      </div>

      {/* ── Legenda em grid ─────────────────────────────────────────────── */}
      <ChartLegend items={activeData} />
    </div>
  );
}
