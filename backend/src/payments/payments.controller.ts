import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { ReceiptService } from './receipt.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { Role, PaymentStatus } from '@prisma/client';
import { CreatePaymentDto } from './dto';

@Controller('payments')
@Roles(Role.ADMIN, Role.MANAGER, Role.OWNER, Role.TENANT)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Get()
  findAll(
    @Query('tenantId') tenantId?: string,
    @Query('contractId') contractId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.paymentsService.findAll({
      tenantId,
      contractId,
      propertyId,
      status,
      from,
      to,
    });
  }

  @Get('balance/:contractId')
  balance(@Param('contractId') contractId: string) {
    return this.paymentsService.getContractBalance(contractId);
  }

  @Get(':id/receipt')
  async receipt(@Param('id') id: string, @Res() res: Response) {
    const payment = await this.paymentsService.findOne(id);

    const buffer = await this.receiptService.generate({
      reference: payment.id.slice(0, 12).toUpperCase(),
      createdAt: payment.createdAt,
      amount: payment.amount,
      method: payment.method,
      tenantName: payment.contract?.tenant?.name || undefined,
      tenantPhone: payment.contract?.tenant?.phone || undefined,
      propertyName: payment.contract?.property?.name || undefined,
      propertyAddress: payment.contract?.property?.address || undefined,
      period: payment.rent?.period || undefined,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="recu-${payment.id.slice(0, 8)}.pdf"`,
    );
    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: AuthUser) {
    return this.paymentsService.create(dto, user?.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }

  @Post('leekpay-simulate')
  simulateLeekPay() {
    // Point d'entrée volontairement inerte tant que LeekPay est désactivé.
    throw new BadRequestException('LeekPay n\'est pas activé');
  }
}
