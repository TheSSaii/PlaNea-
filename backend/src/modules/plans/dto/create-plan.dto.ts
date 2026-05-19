import {
  IsString, IsInt, IsOptional,
  IsDateString, Min, IsUUID
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  peopleCount!: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  budgetCents?: number;

  @IsDateString()
  @IsOptional()
  eventAt?: string;

  @IsUUID()
  @IsOptional()
  createdById?: string;
}
