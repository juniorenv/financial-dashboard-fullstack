import { api } from "@/lib/axios";

export interface DashboardKpis {
  totalPayable: number
  totalReceivable: number
  totalPending: number
  projectedBalance: number
  overdueCount: number
}

export interface DashboardPayablesVsReceivables {
  totalPaid: number
  totalPendingPayable: number
  totalReceived: number
  totalPendingReceivable: number
}

export interface DashboardCategoryItem {
  category: string
  total: number
}

export interface DashboardCategoryDistribution {
  payables: DashboardCategoryItem[]
  receivables: DashboardCategoryItem[]
}

export interface DashboardCashFlowItem {
  month: string
  income: number
  expenses: number
  balance: number
}

export interface DashboardResponse {
  kpis: DashboardKpis
  payablesVsReceivables: DashboardPayablesVsReceivables
  categoryDistribution: DashboardCategoryDistribution
  cashFlow: DashboardCashFlowItem[]
}

export const dashboardService = {
  getSummary: () => api.get<DashboardResponse>("/dashboard"),
};

