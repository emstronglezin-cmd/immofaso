import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RentsService } from './rents.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateRentDto, UpdateRentDto } from './dto';

@Controller('rents')
@Roles(Role.ADMIN, Role.MANAGER, Role.OWNER, Role.TENANT)
export class RentsController {
  constructor(private readonly rentsService: RentsService) {}

  @Get()
  findAll() {
    return this.rentsService.findAll();
  }

  @Get('contract/:contractId')
  findByContract(@Param('contractId') contractId: string) {
    return this.rentsService.findByContract(contractId);
  }

  @Post()
  create(@Body() dto: CreateRentDto) {
    return this.rentsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRentDto) {
    return this.rentsService.update(id, dto);
  }
}