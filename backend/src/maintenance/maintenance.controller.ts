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
import { MaintenanceService } from './maintenance.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { Role, TicketPriority, TicketStatus } from '@prisma/client';
import { CreateTicketDto, UpdateTicketDto } from './dto';

@Controller('maintenance')
@Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
    @Query('propertyId') propertyId?: string,
    @Query('buildingId') buildingId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.maintenanceService.findAll({
      search,
      status,
      priority,
      propertyId,
      buildingId,
      tenantId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.maintenanceService.create(dto, user?.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.maintenanceService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }
}
