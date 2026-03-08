import * as z from "zod";

// ─── Schema base (shape completo de um Payable vindo da API) ──────────────────

export const payableSchema = z.object({
  id: z.uuid(),
  supplier: z.string(),
  description: z.string().nullable(),
  amount: z.number(),
  dueDate: z.string(),
  category: z.string().nullable(),
  status: z.enum(["PENDING", "PAID"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Payable = z.infer<typeof payableSchema>;

// ─── Schema de criação (o que o formulário envia) ─────────────────────────────

export const createPayableSchema = z.object({
  supplier: z
    .string({ error: "Fornecedor é obrigatório." })
    .min(2, "Fornecedor deve ter pelo menos 2 caracteres.")
    .max(100, "Fornecedor deve ter no máximo 100 caracteres."),

  amount: z
    .string({ error: "Valor é obrigatório." })
    .min(1, "Valor é obrigatório.")
    .refine(
      (val) => {
        const normalized = val.replace(",", ".");
        const num = Number(normalized);
        if (isNaN(num) || num <= 0) return false;
        if (num > 99_999_999.99) return false;
        // Verifica casas decimais — pega o que vier após o ponto/vírgula
        const decimals = normalized.split(".")[1];
        if (decimals && decimals.length > 2) return false;
        return true;
      },
      { message: "Informe um valor válido (máx. R$ 99.999.999,99 com até 2 casas decimais)." },
    ),

  dueDate: z
    .string({ error: "Data de vencimento é obrigatória." })
    .min(1, "Data de vencimento é obrigatória.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida."),

  category: z
    .string()
    .max(50, "Categoria deve ter no máximo 50 caracteres.")
    .optional()
    .or(z.literal("")),

  status: z.enum(["PENDING", "PAID"]),

  description: z
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type CreatePayableDto = z.infer<typeof createPayableSchema>;

// ─── Schema de atualização (todos os campos opcionais) ────────────────────────

export const updatePayableSchema = createPayableSchema.partial();

export type UpdatePayableDto = z.infer<typeof updatePayableSchema>;

// ─── Enum de status ───────────────────────────────────────────────────────────

export const payableStatusSchema = z.enum(["PENDING", "PAID"]);
