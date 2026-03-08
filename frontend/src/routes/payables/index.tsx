import { createFileRoute } from "@tanstack/react-router";
import { CheckCheck, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TBody, THead, TD, TH, TR } from "@/components/ui/table";
import {
  useMarkAsPaid,
  usePayables,
  usePayablesSummary,
  useRemovePayable,
} from "@/hooks/usePayables";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";
import type { Payable } from "@/schemas/payable.schema";
import { CreatePayableDialog } from "#/components/payables/CreatePayableDialog";
import { useState } from "react";
import { EditPayableDialog } from "@/components/payables/EditPayableDialog";

export const Route = createFileRoute("/payables/")({
  component: PayablesPage,
});

function PayablesPage() {
  const { data, isLoading, isFetching, refetch } = usePayables();
  const { totalPending, totalPaid, countPending, countOverdue } = usePayablesSummary(data);
  const markAsPaid = useMarkAsPaid();
  const remove = useRemovePayable();
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null);

  // 1. Combined busy state: True se estiver carregando inicialmente, atualizando ou mutacionando
  const isGlobalBusy = isFetching || markAsPaid.isPending || remove.isPending;

  return (
    <div className="space-y-6">

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Contas a pagar
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-50">
            Gestão de contas com fornecedores
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Cadastre, edite e acompanhe o status das contas a pagar.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 text-right text-xs text-slate-400">
          <span>
            Total em aberto:{" "}
            <span className="font-semibold text-rose-300">
              {formatCurrency(totalPending)}
            </span>
          </span>
          <span>
            Total pago:{" "}
            <span className="font-semibold text-emerald-300">
              {formatCurrency(totalPaid)}
            </span>
          </span>
          <div className="flex items-center gap-1">
            <span>
              Pendentes:{" "}
              <span className="font-semibold text-amber-300">{countPending}</span>
            </span>
            <span>
              Vencidos:{" "}
              <span className={`font-semibold ${countOverdue > 0 ? "text-rose-400" : "text-slate-400"}`}>
                {countOverdue}
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* ── Tabela ────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-200">
            Contas cadastradas
          </h2>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              disabled={isGlobalBusy} // 2. Desabilitado quando ocupado
            >
              <RefreshCw className={`mr-1 h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
              Atualizar
            </Button>

            <CreatePayableDialog disabled={isGlobalBusy} />
          </div>
        </div>

        {/* 3. Aplica opacidade na tabela toda quando ocupado */}
        <div className={isGlobalBusy ? "opacity-60 transition-opacity" : ""}>
          <Table>
            <THead>
              <TR>
                <TH>Fornecedor</TH>
                <TH>Categoria</TH>
                <TH>Vencimento</TH>
                <TH className="text-right">Valor</TH>
                <TH>Status</TH>
                <TH className="text-right">Ações</TH>
              </TR>
            </THead>

            <TBody>
              {isLoading && (
                <TR>
                  <TD
                    colSpan={6}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    Carregando contas a pagar...
                  </TD>
                </TR>
              )}

              {!isLoading && (!data || data.length === 0) && (
                <TR>
                  <TD
                    colSpan={6}
                    className="py-8 text-center text-sm text-slate-400"
                  >
                    Nenhuma conta cadastrada até o momento.
                  </TD>
                </TR>
              )}

              {data?.map((item) => (
                <PayableRow
                  key={item.id}
                  item={item}
                  onMarkAsPaid={() => markAsPaid.mutate(item.id)}
                  onRemove={() => remove.mutate(item.id)}
                  onEdit={() => setEditingPayable(item)}
                  isBusy={isGlobalBusy} // 4. Passa o estado global para desabilitar ações da linha
                />
              ))}
            </TBody>
          </Table>
        </div>
      </section>
      {editingPayable && (
        <EditPayableDialog
          payable={editingPayable}
          open={!!editingPayable}
          onClose={() => setEditingPayable(null)}
        />
      )}
    </div>
  );
}

// ─── Linha da tabela ──────────────────────────────────────────────────────────

interface PayableRowProps {
  item: Payable
  onMarkAsPaid: () => void
  onRemove: () => void
  onEdit: () => void
  isBusy: boolean
}

function PayableRow({
  item,
  onMarkAsPaid,
  onRemove,
  onEdit,
  isBusy,
}: PayableRowProps) {
  // Só considera vencida se ainda estiver pendente — conta recebida não é vencida
  const overdue = item.status === "PENDING" && isOverdue(item.dueDate);

  return (
    <TR>
      {/* Fornecedor */}
      <TD>
        <button
          type="button"
          onClick={onEdit}
          disabled={isBusy}
          className="text-left text-sm font-medium text-emerald-200 hover:underline disabled:pointer-events-none disabled:opacity-50"
        >
          {item.supplier}
        </button>
        {item.description && (
          <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
        )}
      </TD>

      {/* Categoria */}
      <TD>
        <span className="text-sm text-slate-300">
          {item.category ?? <span className="text-slate-500">—</span>}
        </span>
      </TD>

      {/* Vencimento */}
      <TD>
        <p className={`text-sm ${overdue ? "text-amber-300" : "text-slate-100"}`}>
          {formatDate(item.dueDate)}
        </p>
        {overdue && (
          <p className="mt-0.5 text-xs text-amber-400">Vencida</p>
        )}
      </TD>

      {/* Valor */}
      <TD className="text-right text-sm font-semibold text-slate-100">
        {formatCurrency(Number(item.amount))}
      </TD>

      {/* Status */}
      <TD>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            item.status === "PAID"
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-slate-800 text-slate-200"
          }`}
        >
          {item.status === "PAID" ? "Pago" : "Pendente"}
        </span>
      </TD>

      {/* Ações */}
      <TD className="text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Marcar como recebido — só aparece para PENDING */}
          {item.status === "PENDING" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onMarkAsPaid}
              disabled={isBusy} // 6. Botões desabilitados durante fetch ou mutation
              title="Marcar como pago"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isBusy} // 7. Botões desabilitados durante fetch ou mutation
            title="Excluir conta"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
          </Button>
        </div>
      </TD>
    </TR>
  );
}
