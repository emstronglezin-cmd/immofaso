import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreatePaymentDto } from './dto';

@Controller('payments')
@Roles(Role.ADMIN, Role.MANAGER, Role.OWNER, Role.TENANT)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Post('leekpay-simulate')
  simulateLeekPay() {
    // Point d'entrée volontairement inerte tant que LeekPay est désactivé.
    throw new BadRequestException('LeekPay n\'est pas activé');
  }
}