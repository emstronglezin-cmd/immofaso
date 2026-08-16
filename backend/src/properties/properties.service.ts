import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';

export interface PropertyFilters {
  search?: string;
  type?: string;
  status?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: PropertyFilters) {
    const where: Record<string, unknown> = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {
        ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        include: { owner: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { owner: true, contracts: true, documents: true },
    });
    if (!property) {
      throw new NotFoundException('Bien introuvable');
    }
    return property;
  }

  async create(dto: CreatePropertyDto) {
    const { images, ...rest } = dto;
    return this.prisma.property.create({
      data: {
        ...rest,
        images: images ? JSON.stringify(images) : '[]',
      },
    });
  }

  async update(id: string, dto: UpdatePropertyDto) {
    await this.findOne(id);
    const { images, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (images) data.images = JSON.stringify(images);
    return this.prisma.property.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.property.delete({ where: { id } });
    return { success: true };
  }
}