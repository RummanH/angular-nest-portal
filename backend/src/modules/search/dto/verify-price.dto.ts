import {
  IsArray,
  IsNumberString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PriceDto {
  @IsNumberString()
  total!: string;

  @IsString()
  currency!: string;
}

class FlightOfferRefDto {
  @IsString()
  id!: string;

  @ValidateNested()
  @Type(() => PriceDto)
  price!: PriceDto;
}

class VerifyPriceDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightOfferRefDto)
  flightOffers!: FlightOfferRefDto[];
}

export class VerifyPriceDto {
  @ValidateNested()
  @Type(() => VerifyPriceDataDto)
  data!: VerifyPriceDataDto;
}
