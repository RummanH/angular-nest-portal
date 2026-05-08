import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNumberString,
  IsString,
  ValidateNested,
} from 'class-validator';

class PriceDto {
  @IsNumberString()
  total!: string;

  @IsString()
  currency!: string;
}

class FlightOfferDto {
  @IsString()
  id!: string;

  @ValidateNested()
  @Type(() => PriceDto)
  price!: PriceDto;
}

class TravelerNameDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;
}

class TravelerDto {
  @IsString()
  id!: string;

  @ValidateNested()
  @Type(() => TravelerNameDto)
  name!: TravelerNameDto;
}

class PhoneDto {
  @IsString()
  number!: string;
}

class ContactDto {
  @IsEmail()
  emailAddress!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhoneDto)
  phones!: PhoneDto[];
}

class CreateFlightOrderDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlightOfferDto)
  flightOffers!: FlightOfferDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TravelerDto)
  travelers!: TravelerDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  contacts!: ContactDto[];
}

export class CreateFlightOrderDto {
  @ValidateNested()
  @Type(() => CreateFlightOrderDataDto)
  data!: CreateFlightOrderDataDto;
}
