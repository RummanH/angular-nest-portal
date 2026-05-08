import { IsOptional, IsString } from 'class-validator';

export class SeatMapQueryDto {
  @IsString()
  offerId!: string;

  @IsOptional()
  @IsString()
  vendor?: string;
}
