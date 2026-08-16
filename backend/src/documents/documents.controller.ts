import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Get()
  findAll(@Query('propertyId') propertyId?: string, @Query('contractId') contractId?: string) {
    return this.documentsService.findAll({ propertyId, contractId });
  }

  @Public()
  @Get('file/:storedPath')
  async getFile(@Param('storedPath') storedPath: string, @Res() res: Response) {
    const decoded = decodeURIComponent(storedPath);
    const safeName = path.basename(decoded);
    const fullPath = path.join(process.cwd(), 'uploads', safeName);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('Fichier introuvable');
    }
    res.sendFile(fullPath);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('propertyId') propertyId?: string,
    @Query('contractId') contractId?: string,
  ) {
    if (!file) {
      return { success: false, error: 'Aucun fichier reçu' };
    }
    return this.documentsService.upload(file, { propertyId, contractId });
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}