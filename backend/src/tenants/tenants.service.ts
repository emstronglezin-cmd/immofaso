import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { assertDeletable } from '../common/utils/prisma-errors';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.tenant.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { contracts: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { contracts: { include: { property: true, rents: true } } },
    });
    if (!tenant) {
      throw new NotFoundException('Locataire introuvable');
    }
    return tenant;
  }

  async create(dto: CreateTenantDto) {
    return this.prisma.tenant.create({ data: dto });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.tenant.delete({ where: { id } });
    } catch (error) {
      assertDeletable(
        error,
        'Impossible de supprimer : ce locataire est associé à des contrats',
      );
    }
    return { success: true };
  }
}