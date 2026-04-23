import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Length,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { AirportStatus } from '../enums/airport-status.enum';

export class CreateAirportDto {
  @ApiProperty({
    example: 'DXB',
    description: 'IATA code — exactly 3 characters',
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  iataCode!: string;

  @ApiPropertyOptional({
    example: 'OMDB',
    description: 'ICAO code — exactly 4 characters',
  })
  @Transform(({ value }) => value?.toUpperCase().trim())
  @IsString()
  @IsOptional()
  @Length(4, 4)
  icaoCode?: string;

  @ApiProperty({ example: 'John F Kennedy International Airport' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'New York' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ example: 'United States' })
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country!: string;

  @ApiProperty({ example: 'US', description: 'ISO 2-letter country code' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  countryCode!: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({ example: 40.6413 })
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: -73.7781 })
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ enum: AirportStatus, default: AirportStatus.ACTIVE })
  @IsEnum(AirportStatus)
  @IsOptional()
  status?: AirportStatus;
}
