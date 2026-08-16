import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

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
}