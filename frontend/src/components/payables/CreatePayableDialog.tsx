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
import { useCreatePayable } from "@/hooks/usePayables";
import {
  type CreatePayableDto,
  createPayableSchema,
} from "@/schemas/payable.schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Categorias sugeridas — o usuário pode digitar qualquer valor
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
  disabled?: boolean
}

export function CreatePayableDialog({ disabled }: Props) {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreatePayable();

  const form = useForm<CreatePayableDto>({
    resolver: zodResolver(createPayableSchema),
    // mode onBlur: valida ao sair do campo — menos intrusivo que onChange
    mode: "onBlur",
    defaultValues: {
      supplier: "",
      amount: "",
      dueDate: "",
      category: "",
      description: "",
      status: "PENDING",
    },
  });

  async function onSubmit(values: CreatePayableDto) {
    try {
      await mutateAsync({
        ...values,
        // Normaliza o amount para número antes de enviar ao backend
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
    // Impede fechar enquanto está enviando
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
          <DialogTitle>Nova conta a pagar</DialogTitle>
          <DialogDescription>
            Preencha os dados do compromisso financeiro com o fornecedor.
          </DialogDescription>
        </DialogHeader>

        {/* id no form para o botão de submit no DialogFooter referenciar */}
        <form
          id="create-payable-form"
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
                  <FieldLabel htmlFor="payable-supplier">
                    Fornecedor <span className="text-rose-400">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="payable-supplier"
                    placeholder="Ex: Empresa de Energia S.A."
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* ── Valor e Vencimento (lado a lado) ───────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="payable-amount">
                      Valor (R$) <span className="text-rose-400">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="payable-amount"
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
                    <FieldLabel htmlFor="payable-due-date">
                      Vencimento <span className="text-rose-400">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="payable-due-date"
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
                  <FieldLabel htmlFor="payable-category">
                    Categoria
                  </FieldLabel>
                  {/* datalist: sugestões sem forçar o usuário a escolher uma */}
                  <Input
                    {...field}
                    id="payable-category"
                    list="category-suggestions"
                    placeholder="Ex: Energia Elétrica"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <datalist id="category-suggestions">
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
                  <FieldLabel htmlFor="payable-description">
                    Descrição
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="payable-description"
                    placeholder="Detalhes adicionais sobre a conta..."
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
                      id="payable-status"
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
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-payable-form"
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
