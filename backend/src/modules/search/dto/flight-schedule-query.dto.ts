import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class FlightScheduleQueryDto {
  @IsString()
  @Length(2, 2)
  carrierCode!: string;

  @IsString()
  flightNumber!: string;

  @IsDateString()
  scheduledDepartureDate!: string;

  @IsOptional()
  @IsString()
  vendor?: string;
}
