import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeekPayService } from '../integrations/leekpay/leekpay.service';
import { WhatsAppService } from '../integrations/whatsapp/whatsapp.service';
import { CreatePaymentDto } from './dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private leekpay: LeekPayService,
    private whatsapp: WhatsAppService,
  ) {}

  async findAll() {
    return this.prisma.payment.findMany({
      include: { rent: { include: { contract: { include: { tenant: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { rent: { include: { contract: { include: { tenant: true } } } } },
    });
    if (!payment) {
      throw new NotFoundException('Paiement introuvable');
    }
    return payment;
  }

  async create(dto: CreatePaymentDto) {
    const rent = await this.prisma.rent.findUnique({
      where: { id: dto.rentId },
      include: { contract: { include: { tenant: true } } },
    });
    if (!rent) {
      throw new NotFoundException('Loyer introuvable');
    }

    const method = dto.method || 'MOBILE_MONEY';
    let provider = dto.provider;
    let providerRef = dto.providerRef;

    if (method === 'LEEKPAY' && this.leekpay.isEnabled()) {
      const result = await this.leekpay.createPayment(
        dto.amount,
        `RENT-${rent.id.slice(0, 8)}`,
        {
          email: rent.contract.tenant?.email || undefined,
          phone: rent.contract.tenant?.phone || undefined,
        },
      );
      provider = result.provider;
      providerRef = result.providerRef;
    }

    const payment = await this.prisma.payment.create({
      data: {
        rentId: dto.rentId,
        amount: dto.amount,
        method,
        provider,
        providerRef,
        status: 'PAID',
      },
    });

    await this.prisma.rent.update({
      where: { id: dto.rentId },
      data: { status: 'PAID' as PaymentStatus, paidAt: new Date() },
    });

    const tenant = rent.contract.tenant;
    if (tenant?.phone) {
      await this.whatsapp.sendMessage(
        tenant.phone,
        `IMMOFASO : paiement de ${dto.amount} FCFA confirmé pour le loyer ${rent.period}. Merci !`,
      );
    }

    return payment;
  }
}