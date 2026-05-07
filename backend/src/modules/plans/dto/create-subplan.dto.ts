import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateSubplanDto {
  @IsString()
  placeName!: string;

  @IsString()
  @IsOptional()
  placeId?: string;

  @IsInt()
  @Min(0)
  order!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}