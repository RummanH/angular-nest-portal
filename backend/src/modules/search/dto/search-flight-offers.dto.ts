import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export enum TravelClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
}

export class SearchFlightOffersDto {
  @IsString()
  @Length(3, 3)
  originLocationCode!: string;

  @IsString()
  @Length(3, 3)
  destinationLocationCode!: string;

  @IsDateString()
  departureDate!: string;

  @IsInt()
  @Min(1)
  adults!: number;

  @IsOptional()
  @IsEnum(TravelClass)
  travelClass?: TravelClass;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(250)
  max?: number;

  @IsOptional()
  @IsString()
  vendor?: string;
}
