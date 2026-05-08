import { IsArray, IsNumberString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class NewFlightOfferDto {
  @IsArray()
  itineraries!: unknown[];
}

export class ReissueTicketDto {
  @ValidateNested()
  @Type(() => NewFlightOfferDto)
  newFlightOffer!: NewFlightOfferDto;

  @IsNumberString()
  fareDifference!: string;
}
