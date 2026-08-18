import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto } from './dto';

export interface TicketFilters {
  search?: string;
  status?: string;
  priority?: string;
  propertyId?: string;
  buildingId?: string;
  tenantId?: string;
}

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: TicketFilters) {
    const where: Record<string, unknown> = {};

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.propertyId) where.propertyId = filters.propertyId;
    if (filters.buildingId) where.buildingId = filters.buildingId;
    if (filters.tenantId) where.tenantId = filters.tenantId;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.maintenanceTicket.findMany({
        where,
        include: {
          property: true,
          building: true,
          tenant: true,
          createdBy: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.maintenanceTicket.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.maintenanceTicket.findUnique({
      where: { id },
      include: {
        property: true,
        building: true,
        tenant: true,
        createdBy: { select: { id: true, email: true } },
      },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }
    return ticket;
  }

  async create(dto: CreateTicketDto, createdById?: string) {
    return this.prisma.maintenanceTicket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status,
        propertyId: dto.propertyId,
        buildingId: dto.buildingId,
        tenantId: dto.tenantId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        createdById,
      },
    });
  }

  async update(id: string, dto: UpdateTicketDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    return this.prisma.maintenanceTicket.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.maintenanceTicket.delete({ where: { id } });
    return { success: true };
  }
}
