/**
 * Formato retornado pela $queryRaw do fluxo de caixa.
 * Prisma retorna campos Decimal como string — convertemos para number no service.
 * Uso exclusivamente interno — nunca exposto pela API.
 */
export interface CashFlowRawRow {
  month: string; // 'Formato: YYYY-MM'
  income: string;
  expenses: string;
}
