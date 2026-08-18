import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role, PropertyType, PropertyStatus } from '@prisma/client';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Public()
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: PropertyType,
    @Query('status') status?: PropertyStatus,
    @Query('city') city?: string,
    @Query('buildingId') buildingId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.propertiesService.findAll({
      search,
      type,
      status,
      city,
      buildingId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Post()
  create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(dto);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(id, dto);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  addImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.propertiesService.addImage(id, file);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
  @Delete(':id/images')
  removeImage(@Param('id') id: string, @Body('url') url: string) {
    return this.propertiesService.removeImage(id, url);
  }
}