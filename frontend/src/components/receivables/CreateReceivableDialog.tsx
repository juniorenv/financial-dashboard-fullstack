import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useCreateReceivable } from "@/hooks/useReceivables";
import {
  type CreateReceivableDto,
  createReceivableSchema,
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
  disabled?: boolean
}

export function CreateReceivableDialog({ disabled }: Props) {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateReceivable();

  const form = useForm<CreateReceivableDto>({
    resolver: zodResolver(createReceivableSchema),
    mode: "onBlur",
    defaultValues: {
      client: "",
      amount: "",
      dueDate: "",
      category: "",
      description: "",
      status: "PENDING",
    },
  });

  async function onSubmit(values: CreateReceivableDto) {
    try {
      await mutateAsync({
        ...values,
        amount: values.amount.replace(",", "."),
      });

      toast.success("Conta criada com sucesso!");
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar conta.",
      );
    }
  }

  function handleOpenChange(next: boolean) {
    if (isPending) return;
    if (!next) form.reset();
    setOpen(next);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <span
          className="contents"
          aria-label="Abrir formulário de nova conta"
        >
          <Button
            type="button"
            size="sm"
            disabled={disabled}
          >
            <Plus className="mr-1 h-3 w-3" />
            Nova conta
          </Button>
        </span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conta a receber</DialogTitle>
          <DialogDescription>
            Preencha os dados da receita esperada do cliente.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-receivable-form"
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
                  <FieldLabel htmlFor="receivable-client">
                    Cliente <span className="text-rose-400">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="receivable-client"
                    placeholder="Ex: Empresa Parceira Ltda."
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
                    <FieldLabel htmlFor="receivable-amount">
                      Valor (R$) <span className="text-rose-400">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="receivable-amount"
                      placeholder="0,00"
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
                    <FieldLabel htmlFor="receivable-due-date">
                      Vencimento <span className="text-rose-400">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="receivable-due-date"
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
                  <FieldLabel htmlFor="receivable-category">
                    Categoria
                  </FieldLabel>
                  <Input
                    {...field}
                    id="receivable-category"
                    list="receivable-category-suggestions"
                    placeholder="Ex: Prestação de Serviços"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <datalist id="receivable-category-suggestions">
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
                  <FieldLabel htmlFor="receivable-description">
                    Descrição
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="receivable-description"
                    placeholder="Detalhes adicionais sobre a receita..."
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
                  <FieldLabel htmlFor="receivable-status">Status</FieldLabel>
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
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-receivable-form"
            size="sm"
            disabled={isPending}
          >
            {isPending ? "Salvando..." : "Salvar conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
