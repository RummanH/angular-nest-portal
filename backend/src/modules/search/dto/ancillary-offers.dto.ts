// dto/ancillary-offers.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FlightSegmentDto {
  @ApiProperty({ example: 'DAC' })
  @IsString()
  @IsNotEmpty()
  origin!: string;

  @ApiProperty({ example: 'DXB' })
  @IsString()
  @IsNotEmpty()
  destination!: string;

  @ApiProperty({ example: 'EK585' })
  @IsString()
  @IsNotEmpty()
  flightNumber!: string;

  @ApiProperty({ example: '2026-06-15' })
  @IsString()
  @IsNotEmpty()
  departureDate!: string;
}

export class AncillaryOffersDto {
  @ApiProperty({ description: 'The offer ID returned from flight search' })
  @IsString()
  @IsNotEmpty()
  offerId!: string;

  @ApiProperty({ type: [FlightSegmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightSegmentDto)
  segments!: FlightSegmentDto[];

  @ApiPropertyOptional({
    enum: ['seat', 'baggage', 'meal', 'lounge', 'insurance'],
    isArray: true,
    description: 'Filter ancillary types to return',
  })
  @IsOptional()
  @IsArray()
  @IsIn(['seat', 'baggage', 'meal', 'lounge', 'insurance'], { each: true })
  ancillaryTypes?: string[];

  @ApiPropertyOptional({
    enum: ['amadeus', 'sabre', 'travelport', 'galileo'],
  })
  @IsOptional()
  @IsIn(['amadeus', 'sabre', 'travelport', 'galileo'])
  vendor?: string;
}
