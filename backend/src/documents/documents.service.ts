import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

interface FindAllFilters {
  propertyId?: string;
  contractId?: string;
}

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async findAll(filters: FindAllFilters) {
    const where: Record<string, unknown> = {};
    if (filters.propertyId) where.propertyId = filters.propertyId;
    if (filters.contractId) where.contractId = filters.contractId;
    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async upload(
    file: Express.Multer.File,
    filters: FindAllFilters,
  ) {
    const stored = await this.storage.save(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    return this.prisma.document.create({
      data: {
        name: file.originalname,
        path: stored.path,
        mimeType: stored.mimeType,
        size: stored.size,
        propertyId: filters.propertyId || null,
        contractId: filters.contractId || null,
      },
    });
  }

  async remove(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException('Document introuvable');
    }
    await this.storage.remove(doc.path);
    await this.prisma.document.delete({ where: { id } });
    return { success: true };
  }
}