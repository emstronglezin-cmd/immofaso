import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuildingDto, UpdateBuildingDto } from './dto';

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    const buildings = await this.prisma.building.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { owner: true, properties: true },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      buildings.map(async (building) => ({
        ...building,
        stats: await this.getBuildingStats(building.id),
      })),
    );
  }

  async findOne(id: string) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: {
        owner: true,
        properties: { include: { contracts: { include: { tenant: true } } } },
        expenses: { orderBy: { date: 'desc' } },
        tickets: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!building) {
      throw new NotFoundException('Immeuble introuvable');
    }
    return { ...building, stats: await this.getBuildingStats(building.id) };
  }

  async create(dto: CreateBuildingDto) {
    const { photos, ...rest } = dto;
    return this.prisma.building.create({
      data: {
        ...rest,
        photos: photos ? JSON.stringify(photos) : '[]',
      },
    });
  }

  async update(id: string, dto: UpdateBuildingDto) {
    await this.findOne(id);
    const { photos, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (photos) data.photos = JSON.stringify(photos);
    return this.prisma.building.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.building.delete({ where: { id } });
    return { success: true };
  }

  async getBuildingStats(buildingId: string) {
    const [
      propertyCount,
      occupiedCount,
      activeContracts,
      revenueAgg,
      unpaidRents,
      expensesAgg,
    ] = await Promise.all([
      this.prisma.property.count({ where: { buildingId } }),
      this.prisma.property.count({
        where: { buildingId, status: 'RENTED' },
      }),
      this.prisma.contract.count({
        where: { status: 'ACTIVE', property: { buildingId } },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID', contract: { property: { buildingId } } },
        _sum: { amount: true },
      }),
      this.prisma.rent.findMany({
        where: {
          status: { not: 'PAID' },
          contract: { property: { buildingId } },
        },
      }),
      this.prisma.expense.aggregate({
        where: { buildingId },
        _sum: { amount: true },
      }),
    ]);

    const unpaid = unpaidRents.reduce(
      (sum, rent) => sum + (rent.amount - rent.paidAmount),
      0,
    );

    return {
      propertyCount,
      occupiedCount,
      occupancyRate:
        propertyCount > 0
          ? Math.round((occupiedCount / propertyCount) * 100)
          : 0,
      activeContracts,
      revenue: revenueAgg._sum.amount || 0,
      unpaid,
      unpaidRentsCount: unpaidRents.length,
      expenses: expensesAgg._sum.amount || 0,
    };
  }
}
