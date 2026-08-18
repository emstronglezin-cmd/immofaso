import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  floors?: number;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  photos?: unknown[];
}

export class UpdateBuildingDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  floors?: number;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  photos?: unknown[];
}
