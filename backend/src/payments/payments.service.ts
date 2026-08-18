import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeekPayService } from '../integrations/leekpay/leekpay.service';
import { WhatsAppService } from '../integrations/whatsapp/whatsapp.service';
import { CreatePaymentDto } from './dto';
import { PaymentStatus, Prisma } from '@prisma/client';

export interface PaymentFilters {
  tenantId?: string;
  contractId?: string;
  propertyId?: string;
  status?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private leekpay: LeekPayService,
    private whatsapp: WhatsAppService,
  ) {}

  async findAll(filters: PaymentFilters) {
    const where: Record<string, unknown> = {};

    if (filters.contractId) where.contractId = filters.contractId;
    if (filters.status) where.status = filters.status;
    if (filters.tenantId || filters.propertyId) {
      where.contract = {
        ...(filters.tenantId ? { tenantId: filters.tenantId } : {}),
        ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
      };
    }
    if (filters.from || filters.to) {
      where.createdAt = {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to ? { lte: new Date(filters.to) } : {}),
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        include: {
          rent: true,
          contract: { include: { tenant: true, property: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        rent: true,
        contract: { include: { tenant: true, property: true } },
      },
    });
    if (!payment) {
      throw new NotFoundException('Paiement introuvable');
    }
    return payment;
  }

  async create(dto: CreatePaymentDto, userId?: string) {
    let contractId = dto.contractId;
    let rentId = dto.rentId;

    if (rentId) {
      const rent = await this.prisma.rent.findUnique({
        where: { id: rentId },
      });
      if (!rent) {
        throw new NotFoundException('Loyer introuvable');
      }
      contractId = rent.contractId;
    }

    if (!contractId) {
      throw new BadRequestException('contractId ou rentId est requis');
    }

    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { tenant: true, property: true },
    });
    if (!contract) {
      throw new NotFoundException('Contrat introuvable');
    }

    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role === 'TENANT' && contract.tenant?.userId !== userId) {
        throw new ForbiddenException('Vous ne pouvez payer que vos propres loyers');
      }
    }

    const method = dto.method || 'MOBILE_MONEY';
    let provider = dto.provider;
    let providerRef = dto.providerRef;

    if (method === 'LEEKPAY' && this.leekpay.isEnabled()) {
      const result = await this.leekpay.createPayment(
        dto.amount,
        `RENT-${contractId.slice(0, 8)}`,
        {
          email: contract.tenant?.email || undefined,
          phone: contract.tenant?.phone || undefined,
        },
      );
      provider = result.provider;
      providerRef = result.providerRef;
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          rentId: rentId ?? null,
          contractId,
          amount: dto.amount,
          method,
          provider,
          providerRef,
          status: 'PAID' as PaymentStatus,
        },
      });

      await this.applyToRents(tx, contractId, dto.amount);

      return created;
    });

    const tenant = contract.tenant;
    if (tenant?.phone) {
      await this.whatsapp.sendMessage(
        tenant.phone,
        `IMMOFASO : paiement de ${dto.amount} FCFA confirmé. Merci !`,
      );
    }

    return payment;
  }

  private async applyToRents(
    tx: Prisma.TransactionClient,
    contractId: string,
    amount: number,
  ) {
    const unpaidRents = await tx.rent.findMany({
      where: { contractId, status: { not: 'PAID' } },
      orderBy: { dueDate: 'asc' },
    });

    let remaining = amount;

    for (const rent of unpaidRents) {
      const due = rent.amount - rent.paidAmount;
      if (due <= 0) continue;

      const applied = Math.min(remaining, due);
      const newPaid = rent.paidAmount + applied;
      const fullyPaid = newPaid >= rent.amount;

      await tx.rent.update({
        where: { id: rent.id },
        data: {
          paidAmount: newPaid,
          status: fullyPaid ? 'PAID' : 'PARTIAL',
          paidAt: fullyPaid ? new Date() : null,
        },
      });

      remaining -= applied;
      if (remaining <= 0) break;
    }

    return remaining;
  }

  async getContractBalance(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) {
      throw new NotFoundException('Contrat introuvable');
    }

    const [rents, paymentsAgg] = await Promise.all([
      this.prisma.rent.findMany({
        where: { contractId },
        orderBy: { dueDate: 'asc' },
      }),
      this.prisma.payment.aggregate({
        where: { contractId, status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    const due = rents.reduce((sum, rent) => sum + rent.amount, 0);
    const paid = paymentsAgg._sum.amount || 0;
    const balance = paid - due;

    return {
      contractId,
      due,
      paid,
      balance,
      avance: balance > 0 ? balance : 0,
      dette: balance < 0 ? Math.abs(balance) : 0,
      rents: rents.map((rent) => ({
        id: rent.id,
        period: rent.period,
        amount: rent.amount,
        paidAmount: rent.paidAmount,
        remaining: Math.max(0, rent.amount - rent.paidAmount),
        dueDate: rent.dueDate,
        status: rent.status,
        paidAt: rent.paidAt,
      })),
    };
  }
}
