import { createFileRoute } from "@tanstack/react-router";
import { CheckCheck, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TBody, THead, TD, TH, TR } from "@/components/ui/table";
import {
  useDeleteReceivable,
  useMarkAsReceived,
  useReceivables,
  useReceivablesSummary,
} from "@/hooks/useReceivables";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";
import type { Receivable } from "@/schemas/receivable.schema";
import { CreateReceivableDialog } from "#/components/receivables/CreateReceivableDialog";
import { useState } from "react";
import { EditReceivableDialog } from "#/components/receivables/EditReceivableDialog";

export const Route = createFileRoute("/receivables/")({
  component: ReceivablesPage,
});

function ReceivablesPage() {
  const { data, isLoading, isFetching, refetch } = useReceivables();
  const { totalPending, totalReceived, countPending, countOverdue } = useReceivablesSummary(data);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const markAsReceived = useMarkAsReceived();
  const remove         = useDeleteReceivable();

  // 1. Combined busy state: True se estiver carregando inicialmente, atualizando ou mutacionando
  const isGlobalBusy = isFetching || markAsReceived.isPending || remove.isPending;

  return (
    <div className="space-y-6">

      {/* ── Cabeçalho ─────────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Contas a receber
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-50">
            Receitas e clientes
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Registre as entradas de caixa e acompanhe o fluxo de recebimentos.
          </p>
        </div>

        {/* Totais — só PENDING em "a receber", só RECEIVED em "recebido" */}
        <div className="flex flex-col items-end gap-1 text-right text-xs text-slate-400">
          <span>
            Total a receber:{" "}
            <span className="font-semibold text-emerald-300">
              {formatCurrency(totalPending)}
            </span>
          </span>
          <span>
            Total recebido:{" "}
            <span className="font-semibold text-slate-300">
              {formatCurrency(totalReceived)}
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

            <CreateReceivableDialog disabled={isGlobalBusy} />
          </div>
        </div>

        {/* 3. Aplica opacidade na tabela toda quando ocupado */}
        <div className={isGlobalBusy ? "opacity-60 transition-opacity" : ""}>
          <Table>
            <THead>
              <TR>
                <TH>Cliente</TH>
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
                    Carregando contas a receber...
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
                <ReceivableRow
                  key={item.id}
                  item={item}
                  onMarkAsReceived={() => markAsReceived.mutate(item.id)}
                  onRemove={() => remove.mutate(item.id)}
                  onEdit={() => setEditingReceivable(item)}
                  isBusy={isGlobalBusy} // 4. Passa o estado global para desabilitar ações da linha
                />
              ))}
            </TBody>
          </Table>
        </div>
      </section>
      {editingReceivable && (
        <EditReceivableDialog
          receivable={editingReceivable}
          open={!!editingReceivable}
          onClose={() => setEditingReceivable(null)}
        />
      )}
    </div>
  );
}

// ─── Linha da tabela ──────────────────────────────────────────────────────────

interface ReceivableRowProps {
  item: Receivable
  onMarkAsReceived: () => void
  onRemove: () => void
  onEdit: () => void
  isBusy: boolean
}

function ReceivableRow({
  item,
  onMarkAsReceived,
  onRemove,
  onEdit,
  isBusy,
}: ReceivableRowProps) {
  // Só considera vencida se ainda estiver pendente — conta recebida não é vencida
  const overdue = item.status === "PENDING" && isOverdue(item.dueDate);

  return (
    <TR>
      {/* Cliente */}
      <TD>
        <button
          type="button"
          onClick={onEdit}
          disabled={isBusy}
          className="text-left text-sm font-medium text-emerald-200 hover:underline disabled:pointer-events-none disabled:opacity-50"
        >
          {item.client}
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
            item.status === "RECEIVED"
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-slate-800 text-slate-200"
          }`}
        >
          {item.status === "RECEIVED" ? "Recebido" : "Pendente"}
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
              onClick={onMarkAsReceived}
              disabled={isBusy} // 6. Botões desabilitados durante fetch ou mutation
              title="Marcar como recebido"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isBusy} // 7. Botões desabilitados durante fetch ou mutation title="Excluir conta"
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400" />
          </Button>
        </div>
      </TD>
    </TR>
  );
}
