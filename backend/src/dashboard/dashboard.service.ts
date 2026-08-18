import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [
      properties,
      availableProperties,
      tenants,
      owners,
      contracts,
      activeContracts,
      totalPaid,
      totalPending,
      pendingRents,
      recentPayments,
    ] = await Promise.all([
      this.prisma.property.count(),
      this.prisma.property.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.tenant.count(),
      this.prisma.owner.count(),
      this.prisma.contract.count(),
      this.prisma.contract.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),
      this.prisma.rent.aggregate({
        _sum: { amount: true },
        where: { status: 'PENDING' },
      }),
      this.prisma.rent.count({ where: { status: 'PENDING' } }),
      this.prisma.payment.findMany({
        include: { rent: { include: { contract: { include: { tenant: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      properties,
      availableProperties,
      tenants,
      owners,
      contracts,
      activeContracts,
      revenue: {
        collected: totalPaid._sum.amount || 0,
        pending: totalPending._sum.amount || 0,
      },
      pendingRents,
      recentPayments,
      occupancyRate:
        contracts > 0
          ? Math.round((activeContracts / contracts) * 100)
          : 0,
    };
  }

  async overview() {
    const now = new Date();
    const startToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startYear = new Date(now.getFullYear(), 0, 1);
    const startLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endLastYear = new Date(now.getFullYear(), 0, 1);

    const [
      todayCollected,
      todayExpected,
      todayExpenses,
      monthCollected,
      monthExpected,
      monthExpenses,
      monthPaymentsCount,
      yearCollected,
      lastYearCollected,
      yearExpenses,
      propertyCount,
      occupiedCount,
      tenants,
      activeContracts,
      ticketsInProgress,
      outstandingRents,
      recentPayments,
      last12Payments,
      last12Expenses,
      paymentsByMethod,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID', createdAt: { gte: startToday } },
      }),
      this.prisma.rent.aggregate({
        _sum: { amount: true },
        where: {
          status: { not: 'PAID' },
          dueDate: { gte: startToday, lt: endToday },
        },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startToday } },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID', createdAt: { gte: startMonth } },
      }),
      this.prisma.rent.aggregate({
        _sum: { amount: true },
        where: {
          status: { not: 'PAID' },
          dueDate: { gte: startMonth, lt: startMonthOfNext(now) },
        },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startMonth } },
      }),
      this.prisma.payment.count({
        where: { status: 'PAID', createdAt: { gte: startMonth } },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID', createdAt: { gte: startYear } },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          createdAt: { gte: startLastYear, lt: endLastYear },
        },
      }),
      this.prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startYear } },
      }),
      this.prisma.property.count(),
      this.prisma.property.count({ where: { status: 'RENTED' } }),
      this.prisma.tenant.count(),
      this.prisma.contract.count({ where: { status: 'ACTIVE' } }),
      this.prisma.maintenanceTicket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.rent.findMany({
        where: { status: { not: 'PAID' } },
        include: { contract: { include: { tenant: true, property: true } } },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.payment.findMany({
        include: {
          rent: true,
          contract: { include: { tenant: true, property: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.payment.findMany({
        where: {
          status: 'PAID',
          createdAt: {
            gte: new Date(
              now.getFullYear(),
              now.getMonth() - 11,
              1,
            ),
          },
        },
        select: { amount: true, createdAt: true },
      }),
      this.prisma.expense.findMany({
        where: {
          date: {
            gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
          },
        },
        select: { amount: true, date: true },
      }),
      this.prisma.payment.groupBy({
        by: ['method'],
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),
    ]);

    const outstanding = outstandingRents.reduce(
      (sum, rent) => sum + (rent.amount - rent.paidAmount),
      0,
    );

    const monthRevenue = monthCollected._sum.amount || 0;
    const monthExpensesTotal = monthExpenses._sum.amount || 0;
    const yearRevenue = yearCollected._sum.amount || 0;
    const lastYearRevenue = lastYearCollected._sum.amount || 0;
    const yearExpensesTotal = yearExpenses._sum.amount || 0;

    return {
      today: {
        collected: todayCollected._sum.amount || 0,
        expected: todayExpected._sum.amount || 0,
        expenses: todayExpenses._sum.amount || 0,
        ticketsInProgress,
      },
      month: {
        revenue: monthRevenue,
        expenses: monthExpensesTotal,
        profit: monthRevenue - monthExpensesTotal,
        expected: monthExpected._sum.amount || 0,
        unpaid: outstanding,
        paymentsCount: monthPaymentsCount,
      },
      year: {
        revenue: yearRevenue,
        expenses: yearExpensesTotal,
        profit: yearRevenue - yearExpensesTotal,
        occupancyRate:
          propertyCount > 0
            ? Math.round((occupiedCount / propertyCount) * 100)
            : 0,
        properties: propertyCount,
        occupied: occupiedCount,
        tenants,
        activeContracts,
        growth:
          lastYearRevenue > 0
            ? Math.round(
                ((yearRevenue - lastYearRevenue) / lastYearRevenue) * 100,
              )
            : 0,
      },
      unpaidByTenant: outstandingRents.slice(0, 10).map((rent) => ({
        id: rent.id,
        period: rent.period,
        amount: rent.amount,
        paidAmount: rent.paidAmount,
        remaining: rent.amount - rent.paidAmount,
        dueDate: rent.dueDate,
        tenantName: rent.contract?.tenant?.name,
        propertyName: rent.contract?.property?.name,
      })),
      recentPayments: recentPayments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        createdAt: payment.createdAt,
        tenantName: payment.contract?.tenant?.name,
        propertyName: payment.contract?.property?.name,
      })),
      revenueByMonth: bucketize(
        last12Payments.map((p) => ({ amount: p.amount, date: p.createdAt })),
        now,
      ),
      expenseByMonth: bucketize(
        last12Expenses.map((e) => ({ amount: e.amount, date: e.date })),
        now,
      ),
      paymentsByMethod: paymentsByMethod.map((row) => ({
        method: row.method,
        amount: row._sum.amount || 0,
      })),
    };
  }
}

function startMonthOfNext(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function bucketize(
  rows: { amount: number; date: Date }[],
  now: Date,
): { month: string; value: number }[] {
  const buckets: { month: string; value: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      value: 0,
    });
  }
  const index = new Map(buckets.map((b, i) => [b.month, i]));
  for (const row of rows) {
    const key = `${row.date.getFullYear()}-${String(
      row.date.getMonth() + 1,
    ).padStart(2, '0')}`;
    const i = index.get(key);
    if (i !== undefined) {
      buckets[i].value += row.amount;
    }
  }
  return buckets;
}
