import * as z from "zod";

// ─── Schema base (shape completo de um Receivable vindo da API) ───────────────

export const receivableSchema = z.object({
  id: z.uuid(),
  client: z.string(),
  description: z.string().nullable(),
  amount: z.number(),
  dueDate: z.string(),
  category: z.string().nullable(),
  status: z.enum(["PENDING", "RECEIVED"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Receivable = z.infer<typeof receivableSchema>;

// ─── Schema de criação ────────────────────────────────────────────────────────

export const createReceivableSchema = z.object({
  client: z
    .string({ error: "Cliente é obrigatório." })
    .min(2, "Cliente deve ter pelo menos 2 caracteres.")
    .max(100, "Cliente deve ter no máximo 100 caracteres."),

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

  status: z.enum(["PENDING", "RECEIVED"]),

  description: z
    .string()
    .max(255, "Descrição deve ter no máximo 255 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type CreateReceivableDto = z.infer<typeof createReceivableSchema>;

// ─── Schema de atualização ────────────────────────────────────────────────────

export const updateReceivableSchema = createReceivableSchema.partial();

export type UpdateReceivableDto = z.infer<typeof updateReceivableSchema>;

// ─── Enum de status ───────────────────────────────────────────────────────────

export const receivableStatusSchema = z.enum(["PENDING", "RECEIVED"]);
