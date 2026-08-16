import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OwnersService } from './owners.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateOwnerDto, UpdateOwnerDto } from './dto';

@Controller('owners')
@Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
export class OwnersController {
  constructor(private readonly ownersService: OwnersService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.ownersService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ownersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOwnerDto) {
    return this.ownersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOwnerDto) {
    return this.ownersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ownersService.remove(id);
  }
}