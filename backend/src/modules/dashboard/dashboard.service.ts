import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PayableStatus, ReceivableStatus } from 'src/generated/prisma/enums';
import {
  CashFlowDataPointDto,
  CategoryDataPointDto,
  CategoryDistributionDto,
  DashboardKpisDto,
  DashboardResponseDto,
  PayablesVsReceivablesDto,
} from './dto/dashboard-response.dto';
import { CashFlowRawRow } from './interfaces/cash-flow-raw-row.interface';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getDashboard(): Promise<DashboardResponseDto> {
    const [kpis, payablesVsReceivables, categoryDistribution, cashFlow] =
      await Promise.all([
        this.getKpis(),
        this.getPayablesVsReceivables(),
        this.getCategoryDistribution(),
        this.getCashFlow(),
      ]);

    return { kpis, payablesVsReceivables, categoryDistribution, cashFlow };
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────

  private async getKpis(): Promise<DashboardKpisDto> {
    const today = new Date();

    const [payableAgg, receivableAgg, overduePayables, overdueReceivables] =
      await Promise.all([
        // Soma de todos os payables PENDING
        this.prismaService.payable.aggregate({
          _sum: { amount: true },
          where: { status: PayableStatus.PENDING },
        }),

        // Soma de todos os receivables PENDING
        this.prismaService.receivable.aggregate({
          _sum: { amount: true },
          where: { status: ReceivableStatus.PENDING },
        }),

        // Contagem de payables vencidos
        this.prismaService.payable.count({
          where: {
            status: PayableStatus.PENDING,
            dueDate: { lt: today },
          },
        }),

        // Contagem de receivables vencidos
        this.prismaService.receivable.count({
          where: {
            status: ReceivableStatus.PENDING,
            dueDate: { lt: today },
          },
        }),
      ]);

    const totalPayable = Number(payableAgg._sum.amount ?? 0);
    const totalReceivable = Number(receivableAgg._sum.amount ?? 0);

    /**
    Retorna um objeto com:
        Total a Pagar
        Total a Receber
        Total Pendente
        Saldo Projetado
        Contas Vencidas
    */
    return {
      totalPayable,
      totalReceivable,
      totalPending: totalPayable + totalReceivable,
      projectedBalance: totalReceivable - totalPayable,
      overdueCount: overduePayables + overdueReceivables,
    };
  }

  // ─── Gráfico 1 — Barras: Pagar vs Receber ────────────────────────────────

  private async getPayablesVsReceivables(): Promise<PayablesVsReceivablesDto> {
    const [paidAgg, pendingPayableAgg, receivedAgg, pendingReceivableAgg] =
      await Promise.all([
        this.prismaService.payable.aggregate({
          _sum: { amount: true },
          where: { status: PayableStatus.PAID },
        }),
        this.prismaService.payable.aggregate({
          _sum: { amount: true },
          where: { status: PayableStatus.PENDING },
        }),
        this.prismaService.receivable.aggregate({
          _sum: { amount: true },
          where: { status: ReceivableStatus.RECEIVED },
        }),
        this.prismaService.receivable.aggregate({
          _sum: { amount: true },
          where: { status: ReceivableStatus.PENDING },
        }),
      ]);

    return {
      totalPaid: Number(paidAgg._sum.amount ?? 0),
      totalPendingPayable: Number(pendingPayableAgg._sum.amount ?? 0),
      totalReceived: Number(receivedAgg._sum.amount ?? 0),
      totalPendingReceivable: Number(pendingReceivableAgg._sum.amount ?? 0),
    };
  }

  // ─── Gráfico 2 — Pizza/Donut: Distribuição por Categoria ─────────────────

  private async getCategoryDistribution(): Promise<CategoryDistributionDto> {
    const [payableGroups, receivableGroups] = await Promise.all([
      this.prismaService.payable.groupBy({
        by: ['category'],
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      this.prismaService.receivable.groupBy({
        by: ['category'],
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
    ]);

    const toDataPoints = (
      groups: { category: string | null; _sum: { amount: unknown } }[],
    ): CategoryDataPointDto[] =>
      groups.map((g) => ({
        category: g.category ?? 'Sem categoria',
        total: Number(g._sum.amount ?? 0),
      }));

    return {
      payables: toDataPoints(payableGroups),
      receivables: toDataPoints(receivableGroups),
    };
  }

  // ─── Gráfico 3 — Linha: Fluxo de Caixa por Mês ───────────────────────────

  private async getCashFlow(): Promise<CashFlowDataPointDto[]> {
    /**
     * $queryRaw com UNION ALL para buscar payables e receivables
     * agrupados por mês em uma única query.
     *
     * Retorna as linhas ordenadas por mês, cobrindo os últimos 12 meses.
     */
    const rows = await this.prismaService.$queryRaw<CashFlowRawRow[]>`
      SELECT
        TO_CHAR(due_date, 'YYYY-MM') AS month,
        SUM(CASE WHEN type = 'income'   THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expenses' THEN amount ELSE 0 END) AS expenses
      FROM (
        SELECT due_date, amount, 'income' AS type
        FROM receivables
        WHERE due_date >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'

        UNION ALL

        SELECT due_date, amount, 'expenses' AS type
        FROM payables
        WHERE due_date >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
      ) AS combined
      GROUP BY month
      ORDER BY month ASC
    `;

    return rows.map((row) => {
      const income = Number(row.income);
      const expenses = Number(row.expenses);

      return {
        month: row.month,
        income,
        expenses,
        balance: income - expenses,
      };
    });
  }
}
