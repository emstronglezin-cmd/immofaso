import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOwnerDto, UpdateOwnerDto } from './dto';
import { assertDeletable } from '../common/utils/prisma-errors';

@Injectable()
export class OwnersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    return this.prisma.owner.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { properties: true, contracts: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { id },
      include: { properties: true, contracts: true },
    });
    if (!owner) {
      throw new NotFoundException('Propriétaire introuvable');
    }
    return owner;
  }

  async create(dto: CreateOwnerDto) {
    return this.prisma.owner.create({ data: dto });
  }

  async update(id: string, dto: UpdateOwnerDto) {
    await this.findOne(id);
    return this.prisma.owner.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.owner.delete({ where: { id } });
    } catch (error) {
      assertDeletable(
        error,
        'Impossible de supprimer : ce propriétaire est associé à des biens ou contrats',
      );
    }
    return { success: true };
  }
}