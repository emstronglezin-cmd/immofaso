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
import { ExpensesService } from './expenses.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, ExpenseCategory } from '@prisma/client';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';

@Controller('expenses')
@Roles(Role.ADMIN, Role.MANAGER, Role.OWNER)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: ExpenseCategory,
    @Query('buildingId') buildingId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.expensesService.findAll({
      search,
      category,
      buildingId,
      propertyId,
      from,
      to,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
