import {
  IsString, IsInt, IsNumber,
  IsEnum, IsDateString, Min
} from 'class-validator';

export enum TransportType {
  WALKING  = 'WALKING',
  PUBLIC   = 'PUBLIC',
  CAR      = 'CAR',
  BICYCLE  = 'BICYCLE',
  MIXED    = 'MIXED',
}

export class CreatePlanDto {
  @IsString()
  name!: string;        // ← el ! resuelve el error

  @IsInt()
  @Min(1)
  numberOfPeople!: number;   // ← el !

  @IsNumber()
  @Min(0)
  budget!: number;           // ← el !

  @IsEnum(TransportType)
  transport!: TransportType; // ← el !

  @IsDateString()
  scheduledAt!: string;      // ← el !
}