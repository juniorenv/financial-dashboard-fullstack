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
          width={110}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: "#020617",
            borderRadius: 8,
            border: "1px solid #1e293b",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          name="Receitas"
          stroke="#22c55e"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Despesas"
          stroke="#fb7185"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="balance"
          name="Saldo"
          stroke="#38bdf8"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

