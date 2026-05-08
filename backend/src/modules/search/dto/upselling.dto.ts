import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpsellingOfferDto {
  @IsString()
  id!: string;
}

class UpsellingDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsellingOfferDto)
  flightOffers!: UpsellingOfferDto[];
}

export class UpsellingDto {
  @ValidateNested()
  @Type(() => UpsellingDataDto)
  data!: UpsellingDataDto;
}
