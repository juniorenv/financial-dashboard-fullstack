import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateReceivable } from "@/hooks/useReceivables";
import {
  type CreateReceivableDto,
  createReceivableSchema,
  type Receivable,
} from "@/schemas/receivable.schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const CATEGORY_SUGGESTIONS = [
  "Prestação de Serviços",
  "Venda de Produtos",
  "Comissão",
  "Mensalidade",
  "Consultoria",
  "Aluguel de Equipamentos",
  "Suporte Técnico",
  "Licenciamento",
  "Outros",
];

interface Props {
  receivable: Receivable
  open: boolean
  onClose: () => void
}

export function EditReceivableDialog({ receivable, open, onClose }: Props) {
  const { mutateAsync, isPending } = useUpdateReceivable(receivable.id);

  const form = useForm<CreateReceivableDto>({
    resolver: zodResolver(createReceivableSchema),
    mode: "onBlur",
    defaultValues: toFormValues(receivable),
  });

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(receivable));
    }
  }, [open, receivable, form]);

  async function onSubmit(values: CreateReceivableDto) {
    try {
      await mutateAsync({
        ...values,
        amount: values.amount.replace(",", "."),
      });

      toast.success("Conta atualizada com sucesso!");
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar conta.",
      );
    }
  }

  function handleOpenChange(next: boolean) {
    if (isPending) return;
    if (!next) onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar conta a receber</DialogTitle>
          <DialogDescription>
            Atualize os dados da receita de{" "}
            <span className="font-medium text-emerald-400">{receivable.client}</span>.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-receivable-form"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup className="gap-4">

            {/* ── Cliente ────────────────────────────────────────────────── */}
            <Controller
              name="client"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-receivable-client">
                    Cliente <span className="text-rose-400">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="edit-receivable-client"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* ── Valor e Vencimento ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-receivable-amount">
                      Valor (R$) <span className="text-rose-400">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="edit-receivable-amount"
                      inputMode="decimal"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="dueDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-receivable-due-date">
                      Vencimento <span className="text-rose-400">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="edit-receivable-due-date"
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* ── Categoria ──────────────────────────────────────────────── */}
            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-receivable-category">
                    Categoria
                  </FieldLabel>
                  <Input
                    {...field}
                    id="edit-receivable-category"
                    list="edit-receivable-category-suggestions"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <datalist id="edit-receivable-category-suggestions">
                    {CATEGORY_SUGGESTIONS.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                      />
                    ))}
                  </datalist>
                  <FieldDescription>
                    Opcional. Usado nos gráficos de distribuição.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* ── Descrição ──────────────────────────────────────────────── */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-receivable-description">
                    Descrição
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="edit-receivable-description"
                    rows={3}
                    className="resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Opcional. Aparece abaixo do nome do cliente na tabela.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-receivable-status">Status</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="receivable-status"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="RECEIVED">Recebido</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter className="mt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="edit-receivable-form"
            size="sm"
            disabled={isPending}
          >
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Converte Receivable (API) → valores do formulário (string) ───────────────

function toFormValues(receivable: Receivable): CreateReceivableDto {
  return {
    client: receivable.client,
    amount: Number(receivable.amount).toFixed(2).replace(".", ","),
    dueDate: receivable.dueDate.slice(0, 10),
    category: receivable.category    ?? "",
    description: receivable.description ?? "",
    status: receivable.status,
  };
}
