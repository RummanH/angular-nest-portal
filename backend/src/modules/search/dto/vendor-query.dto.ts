// dto/vendor-query.dto.ts
import { IsOptional, IsIn } from 'class-validator';

export class VendorQueryDto {
  @IsOptional()
  @IsIn(['amadeus', 'sabre', 'travelport', 'galileo'])
  vendor?: string;
}
