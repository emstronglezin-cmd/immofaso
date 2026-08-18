import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';

export interface ExpenseFilters {
  search?: string;
  category?: string;
  buildingId?: string;
  propertyId?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ExpenseFilters) {
    const where: Record<string, unknown> = {};

    if (filters.category) where.category = filters.category;
    if (filters.buildingId) where.buildingId = filters.buildingId;
    if (filters.propertyId) where.propertyId = filters.propertyId;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.from || filters.to) {
      where.date = {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to ? { lte: new Date(filters.to) } : {}),
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.expense.findMany({
        where,
        include: { building: true, property: true },
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { building: true, property: true },
    });
    if (!expense) {
      throw new NotFoundException('Dépense introuvable');
    }
    return expense;
  }

  async create(dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        title: dto.title,
        category: dto.category,
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : undefined,
        description: dto.description,
        receiptPath: dto.receiptPath,
        buildingId: dto.buildingId,
        propertyId: dto.propertyId,
      },
    });
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    return this.prisma.expense.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.expense.delete({ where: { id } });
    return { success: true };
  }
}
