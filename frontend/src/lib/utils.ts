export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatExchangeRate(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatCurrencyUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Retorna "hoje" no fuso local como meia-noite UTC.
 * Mesma lógica do getToday() do backend.
 */
function getLocalToday(): Date {
  const localStr = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  return new Date(`${localStr}T00:00:00.000Z`);
}

/**
 * Formata datas vindas de colunas DATE do Prisma.
 * Usa UTC para não mudar o dia por causa do fuso.
 */
export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";

  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();

  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Verifica se a conta está vencida.
 * Alinhado com o backend: dueDate <= hoje (lte)
 */
export function isOverdue(dueDate: string | Date): boolean {
  const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  if (Number.isNaN(date.getTime())) return false;

  const today = getLocalToday();

  // dueDate do Prisma (coluna DATE) = meia-noite UTC
  // Vencido quando dueDate <= hoje (mesmo critério lte do backend)
  return date.getTime() <= today.getTime();
}
