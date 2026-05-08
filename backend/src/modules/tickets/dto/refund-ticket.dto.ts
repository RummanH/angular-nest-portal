import { IsNumberString } from 'class-validator';

export class RefundTicketDto {
  @IsNumberString()
  originalAmount!: string;

  @IsNumberString()
  penalty!: string;
}
