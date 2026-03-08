import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, CircleAlert } from "lucide-react";

import {
  CashFlowChart,
  CategoryDistributionChart,
  PayablesVsReceivablesChart,
} from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { formatCurrency, formatCurrencyUSD, formatExchangeRate } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();
  const { data: exchange } = useExchangeRate();

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-400">Carregando dashboard...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-700/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
        <CircleAlert className="h-4 w-4" />
        <span>Não foi possível carregar os dados do dashboard.</span>
      </div>
    );
  }

  const saldoBRL = data.kpis.projectedBalance;
  const usdRate = exchange?.rate ?? 0;
  const saldoUSD = usdRate > 0 ? saldoBRL / usdRate : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Visão geral
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-50 md:text-3xl">
            Saúde financeira da empresa
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Acompanhe o fluxo de caixa, contas a pagar e a receber em tempo real.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 text-right text-xs text-slate-400">
          <span>Saldo projetado em BRL e USD com base no câmbio atual.</span>
          {exchange && (
            <span className="text-[0.7rem]">
              Taxa {exchange.from}/{exchange.to}:{" "}
              {formatExchangeRate(exchange.rate)} - Atualizado em{" "}
              {new Date(exchange.fetchedAt).toLocaleTimeString("pt-BR")}
            </span>
          )}
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Total a receber</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-emerald-300">
              {formatCurrency(data.kpis.totalReceivable)}
            </p>
            <p className="mt-1 text-xs text-slate-100">
              Inclui todas as receitas futuras ainda não recebidas.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Total a pagar</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-rose-300">
              {formatCurrency(data.kpis.totalPayable)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Compromissos financeiros futuros com fornecedores.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Total pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-amber-300">
              {formatCurrency(data.kpis.totalPending)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Soma de contas ainda não pagas nem recebidas.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Saldo projetado</CardTitle>
            <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200">
              USD
            </Badge>
          </CardHeader>
          <CardContent>
            <p
              className="text-xl font-semibold"
              style={{ color: saldoBRL >= 0 ? "#4ade80" : "#fb7185" }}
            >
              {formatCurrency(saldoBRL)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {exchange ? (
                <>
                  Equivalente a{" "}
                  <span className="font-semibold text-emerald-300">
                    {formatCurrencyUSD(saldoUSD)}
                  </span>{" "}
                  em USD.
                </>
              ) : (
                "Carregando câmbio para converter em USD."
              )}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Contas vencidas:{" "}
              <span className="font-semibold text-amber-300">
                {data.kpis.overdueCount}
              </span>
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contas a pagar vs a receber</CardTitle>
          </CardHeader>
          <CardContent>
            <PayablesVsReceivablesChart
              data={data.payablesVsReceivables}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart
              data={data.categoryDistribution}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de caixa mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={data.cashFlow} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

