import { Injectable } from '@nestjs/common';
import { ReissueTicketDto } from './dto/reissue-ticket.dto';
import { RefundTicketDto } from './dto/refund-ticket.dto';
import { VendorsService } from '../vendors/vendors.service';

@Injectable()
export class TicketsService {
  constructor(private readonly vendorsService: VendorsService) {}

  async getTicket(ticketNumber: string, vendor?: string) {
    return this.vendorsService.resolve(vendor).getTicket(ticketNumber);
  }

  async voidTicket(ticketNumber: string, vendor?: string) {
    return this.vendorsService.resolve(vendor).voidTicket(ticketNumber);
  }

  async reissueTicket(
    ticketNumber: string,
    body: ReissueTicketDto,
    vendor?: string,
  ) {
    return this.vendorsService
      .resolve(vendor)
      .reissueTicket(ticketNumber, body);
  }

  async refundTicket(
    ticketNumber: string,
    body: RefundTicketDto,
    vendor?: string,
  ) {
    return this.vendorsService.resolve(vendor).refundTicket(ticketNumber, body);
  }
}
