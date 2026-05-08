import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GdsTokenRequestDto {
  @ApiProperty({
    enum: ['amadeus', 'sabre', 'travelport', 'galileo'],
    description: 'GDS provider to authenticate with',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['amadeus', 'sabre', 'travelport', 'galileo'])
  provider!: string;

  @ApiProperty({ description: 'API client ID issued by the GDS provider' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  clientId!: string;

  @ApiProperty({ description: 'API client secret issued by the GDS provider' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(256)
  clientSecret!: string;

  @ApiPropertyOptional({
    description: 'Target environment — defaults to production',
    enum: ['production', 'test'],
    default: 'production',
  })
  @IsOptional()
  @IsIn(['production', 'test'])
  environment?: string = 'production';
}
