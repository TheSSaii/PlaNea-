import {
  IsString, IsInt, IsNumber,
  IsEnum, IsDateString, Min
} from 'class-validator';

export enum TransportMode {
  WALK = 'WALK',
  BIKE = 'BIKE',
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
  TAXI = 'TAXI',
  RIDE_SHARE = 'RIDE_SHARE'
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

  @IsEnum(TransportMode)
  transport!: TransportMode; // ← el !

  @IsDateString()
  scheduledAt!: string;      // ← el !
}