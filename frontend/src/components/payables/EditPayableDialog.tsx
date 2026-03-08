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
import { useUpdatePayable } from "@/hooks/usePayables";
import {
  type CreatePayableDto,
  createPayableSchema,
  type Payable,
} from "@/schemas/payable.schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const CATEGORY_SUGGESTIONS = [
  "Folha de Pagamento",
  "Aluguel / Fornecedor",
  "Impostos e Tributos",
  "Marketing",
  "Manutenção",
  "Energia Elétrica",
  "Telefone e Internet",
  "Água e Saneamento",
  "Serviços Terceirizados",
  "Outros",
];

interface Props {
  payable: Payable
  open: boolean
  onClose: () => void
}

export function EditPayableDialog({ payable, open, onClose }: Props) {
  const { mutateAsync, isPending } = useUpdatePayable(payable.id);

  const form = useForm<CreatePayableDto>({
    resolver: zodResolver(createPayableSchema),
    mode: "onBlur",
    defaultValues: toFormValues(payable),
  });

  // Quando o dialog abre com um payable diferente, reseta o form com os novos valores
  useEffect(() => {
    if (open) {
      form.reset(toFormValues(payable));
    }
  }, [open, payable, form]);

  async function onSubmit(values: CreatePayableDto) {
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
          <DialogTitle>Editar conta a pagar</DialogTitle>
          <DialogDescription>
            Atualize os dados do compromisso com{" "}
            <span className="font-medium text-emerald-400">{payable.supplier}</span>.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-payable-form"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <FieldGroup className="gap-4">

            {/* ── Fornecedor ─────────────────────────────────────────────── */}
            <Controller
              name="supplier"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-payable-supplier">
                    Fornecedor <span className="text-rose-400">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="edit-payable-supplier"
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
                    <FieldLabel htmlFor="edit-payable-amount">
                      Valor (R$) <span className="text-rose-400">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="edit-payable-amount"
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
                    <FieldLabel htmlFor="edit-payable-due-date">
                      Vencimento <span className="text-rose-400">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="edit-payable-due-date"
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
                  <FieldLabel htmlFor="edit-payable-category">
                    Categoria
                  </FieldLabel>
                  <Input
                    {...field}
                    id="edit-payable-category"
                    list="edit-category-suggestions"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <datalist id="edit-category-suggestions">
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
                  <FieldLabel htmlFor="edit-payable-description">
                    Descrição
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="edit-payable-description"
                    rows={3}
                    className="resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Opcional. Aparece abaixo do nome do fornecedor na tabela.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* ── Seletor ──────────────────────────────────────────────── */}
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="payable-status">Status</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="edit-payable-status"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="PAID">Pago</SelectItem>
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
            form="edit-payable-form"
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

// ─── Converte Payable (API) → valores do formulário (string) ──────────────────

function toFormValues(payable: Payable): CreatePayableDto {
  return {
    supplier: payable.supplier,
    // Formata o número para string com vírgula para exibição no input
    amount: Number(payable.amount).toFixed(2).replace(".", ","),
    // dueDate vem como ISO string — pega só a parte da data (YYYY-MM-DD)
    dueDate: payable.dueDate.slice(0, 10),
    category: payable.category    ?? "",
    description: payable.description ?? "",
    status: payable.status,
  };
}
