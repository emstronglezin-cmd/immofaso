import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ContractStatus } from '@prisma/client';

export class CreateContractDto {
  @IsString()
  propertyId: string;

  @IsString()
  tenantId: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0)
  rentAmount: number;

  @IsOptional()
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}

export class UpdateContractDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  rentAmount?: number;

  @IsOptional()
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}