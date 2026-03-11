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
import { useEffect, useMemo, useState } from "react";
import { EditPayableDialog } from "@/components/payables/EditPayableDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export const Route = createFileRoute("/payables/")({
  component: PayablesPage,
});

function PayablesPage() {
  // ── Queries & mutations ──────────────────────────────────────────────────
  const { data, isLoading, isFetching, refetch } = usePayables();
  const markAsPaid = useMarkAsPaid();
  const remove = useRemovePayable();

  // ── Estado local ─────────────────────────────────────────────────────────
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null);
  const [deletingPayable, setDeletingPayable] = useState<Payable | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');

  // ── Dados derivados ───────────────────────────────────────────────────────
  const monthOptions = useMemo(() => {
    if (!data) return []
    const months = [...new Set(data.map((item) => item.dueDate.slice(0, 7)))]
    return months.sort().reverse()
  }, [data])

  // Reseta o filtro de mês se o mês selecionado não existe mais nos dados
  useEffect(() => {
    if (filterMonth && !monthOptions.includes(filterMonth)) {
      setFilterMonth('');
      setFilterStatus('ALL');
    }
  }, [monthOptions, filterMonth])

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((item) => {
      const matchMonth = filterMonth ? item.dueDate.slice(0, 7) === filterMonth : true
      const matchStatus = filterStatus === 'ALL' ? true : item.status === filterStatus
      return matchMonth && matchStatus
    })
  }, [data, filterMonth, filterStatus])

  const { totalPending, totalPaid, countPending, countOverdue } = usePayablesSummary(filteredData);

  // ── Computed simples ──────────────────────────────────────────────────────
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
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro de mês */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todos os meses</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {new Date(month + '-02').toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </option>
              ))}
            </select>

            {/* Filtro de status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="h-8 rounded-md border border-slate-700 bg-slate-900 px-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Todos os status</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
            </select>

            {/* Limpar filtros — só aparece quando algum filtro está ativo */}
            {(filterMonth || filterStatus !== 'ALL') && (
              <button
                type="button"
                onClick={() => { setFilterMonth(''); setFilterStatus('ALL') }}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
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

              {!isLoading && filteredData.length === 0 && (data?.length ?? 0) > 0 && (
                <TR>
                  <TD colSpan={6} className="py-8 text-center text-sm text-slate-400">
                    Nenhuma conta encontrada para os filtros selecionados.
                  </TD>
                </TR>
              )}

              {filteredData?.map((item) => (
                <PayableRow
                  key={item.id}
                  item={item}
                  onMarkAsPaid={() => markAsPaid.mutate(item.id)}
                  onRemove={() => setDeletingPayable(item)}
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

      <ConfirmDialog
        open={!!deletingPayable}
        onOpenChange={(open) => !open && setDeletingPayable(null)}
        title="Excluir conta a pagar"
        description={`Tem certeza que deseja excluir a conta de "${deletingPayable?.supplier}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (deletingPayable) {
            remove.mutate(deletingPayable.id);
          }
        }}
        isLoading={remove.isPending}
      />
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
