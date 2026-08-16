import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRentDto, UpdateRentDto } from './dto';

@Injectable()
export class RentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rent.findMany({
      include: { contract: { include: { tenant: true, property: true } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findByContract(contractId: string) {
    return this.prisma.rent.findMany({
      where: { contractId },
      include: { payment: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async create(dto: CreateRentDto) {
    return this.prisma.rent.create({
      data: {
        contractId: dto.contractId,
        period: dto.period,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
        status: dto.status || 'PENDING',
      },
    });
  }

  async update(id: string, dto: UpdateRentDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.paidAt) data.paidAt = new Date(dto.paidAt);
    return this.prisma.rent.update({ where: { id }, data });
  }

  private async findOne(id: string) {
    const rent = await this.prisma.rent.findUnique({ where: { id } });
    if (!rent) {
      throw new NotFoundException('Loyer introuvable');
    }
    return rent;
  }
}