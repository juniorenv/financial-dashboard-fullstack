export interface DashboardKpisDto {
  /** Soma dos valores com status PENDING em payables */
  totalPayable: number;
  /** Soma dos valores com status PENDING em receivables */
  totalReceivable: number;
  /** totalPayable + totalReceivable */
  totalPending: number;
  /** totalReceivable - totalPayable */
  projectedBalance: number;
  /** Contas com dueDate < hoje e status PENDING (payables + receivables) */
  overdueCount: number;
}

export interface PayablesVsReceivablesDto {
  totalPaid: number;
  totalPendingPayable: number;
  totalReceived: number;
  totalPendingReceivable: number;
}

export interface CategoryDataPointDto {
  category: string;
  total: number;
}

export interface CategoryDistributionDto {
  payables: CategoryDataPointDto[];
  receivables: CategoryDataPointDto[];
}

export interface CashFlowDataPointDto {
  month: string; // Formato: 'YYYY-MM'
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardResponseDto {
  kpis: DashboardKpisDto;
  payablesVsReceivables: PayablesVsReceivablesDto;
  categoryDistribution: CategoryDistributionDto;
  cashFlow: CashFlowDataPointDto[];
}
