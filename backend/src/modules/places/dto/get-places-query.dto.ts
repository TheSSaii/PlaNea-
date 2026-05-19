// backend/src/places/dto/get-places-query.dto.ts
import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceLevel } from '@prisma/client';
 
export class GetPlacesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
 
  // Comma-separated category IDs
  @IsOptional()
  @IsString()
  categories?: string;
 
  // Comma-separated interest IDs
  @IsOptional()
  @IsString()
  interests?: string;
 
  @IsOptional()
  @IsEnum(PriceLevel)
  priceLevel?: PriceLevel;
 
  // Latitude for proximity filter
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;
 
  // Longitude for proximity filter
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;
 
  // Radius in kilometers
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  radiusKm?: number;
 
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
 
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;
}