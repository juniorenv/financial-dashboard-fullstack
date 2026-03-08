import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DashboardPayablesVsReceivables } from "@/services/dashboard.service";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: DashboardPayablesVsReceivables
}

export function PayablesVsReceivablesChart({ data }: Props) {
  const chartData = [
    {
      name: "Pagas / Recebidas",
      "Pagas (fornecedores)": data.totalPaid,
      "Recebidas (clientes)": data.totalReceived,
    },
    {
      name: "Pendentes",
      "A pagar": data.totalPendingPayable,
      "A receber": data.totalPendingReceivable,
    },
  ];

  return (
    <ResponsiveContainer
      width="100%"
      height={440}
    >
      <BarChart
        data={chartData}
        stackOffset="sign"
      >
        <XAxis
          dataKey="name"
          stroke="#94a3b8"
        />
        <YAxis
          tickFormatter={(value) => formatCurrency(Number(value))}
          stroke="#94a3b8"
          width={120}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: "#020617",
            borderRadius: 8,
            border: "1px solid #1e293b",
          }}
          cursor={{ fill: "#1e293b", opacity: 0.4 }}
        />
        <Legend />
        <Bar
          dataKey="Pagas (fornecedores)"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="Recebidas (clientes)"
          fill="#38bdf8"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="A pagar"
          fill="#fb7185"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="A receber"
          fill="#facc15"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

