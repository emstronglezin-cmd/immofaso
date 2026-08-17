import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto, UpdateContractDto } from './dto';
import { assertDeletable } from '../common/utils/prisma-errors';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.contract.findMany({
      include: {
        property: true,
        tenant: true,
        owner: true,
        rents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        property: true,
        tenant: true,
        owner: true,
        rents: { include: { payment: true } },
        documents: true,
      },
    });
    if (!contract) {
      throw new NotFoundException('Contrat introuvable');
    }
    return contract;
  }

  async create(dto: CreateContractDto) {
    const reference = `CT-${Date.now().toString(36).toUpperCase()}`;
    return this.prisma.contract.create({
      data: {
        reference,
        propertyId: dto.propertyId,
        tenantId: dto.tenantId,
        ownerId: dto.ownerId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        rentAmount: dto.rentAmount,
        deposit: dto.deposit || 0,
        status: dto.status || 'ACTIVE',
      },
    });
  }

  async update(id: string, dto: UpdateContractDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.contract.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.contract.delete({ where: { id } });
    } catch (error) {
      assertDeletable(
        error,
        'Impossible de supprimer : ce contrat est associé à des loyers ou documents',
      );
    }
    return { success: true };
  }
}