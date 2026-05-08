import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { ReissueTicketDto } from './dto/reissue-ticket.dto';
import { RefundTicketDto } from './dto/refund-ticket.dto';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get(':ticketNumber')
  @ApiOperation({ summary: 'Get ticket details' })
  async getTicket(
    @Param('ticketNumber') ticketNumber: string,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.ticketsService.getTicket(ticketNumber, vendor);
    return { message: 'Ticket retrieved successfully', data };
  }

  @Post(':ticketNumber/void')
  @ApiOperation({ summary: 'Void issued ticket' })
  async voidTicket(
    @Param('ticketNumber') ticketNumber: string,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.ticketsService.voidTicket(ticketNumber, vendor);
    return { message: 'Ticket voided successfully', data };
  }

  @Post(':ticketNumber/reissue')
  @ApiOperation({ summary: 'Reissue ticket' })
  async reissueTicket(
    @Param('ticketNumber') ticketNumber: string,
    @Body() body: ReissueTicketDto,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.ticketsService.reissueTicket(
      ticketNumber,
      body,
      vendor,
    );
    return { message: 'Ticket reissued successfully', data };
  }

  @Post(':ticketNumber/refund')
  @ApiOperation({ summary: 'Refund ticket' })
  async refundTicket(
    @Param('ticketNumber') ticketNumber: string,
    @Body() body: RefundTicketDto,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.ticketsService.refundTicket(
      ticketNumber,
      body,
      vendor,
    );
    return { message: 'Ticket refunded successfully', data };
  }
}
