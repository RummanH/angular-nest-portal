import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateFlightOrderDto } from './dto/create-flight-order.dto';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('flight-orders')
  @ApiOperation({ summary: 'Create PNR / hold booking' })
  async createFlightOrder(
    @Body() body: CreateFlightOrderDto,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.bookingService.createFlightOrder(body, vendor);
    return { message: 'Flight order created successfully', data };
  }

  @Get('flight-orders/:orderId')
  @ApiOperation({ summary: 'Retrieve PNR by order id' })
  async getFlightOrder(
    @Param('orderId') orderId: string,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.bookingService.getFlightOrder(orderId, vendor);
    return { message: 'Flight order retrieved successfully', data };
  }

  @Delete('flight-orders/:orderId')
  @ApiOperation({ summary: 'Cancel PNR by order id' })
  async cancelFlightOrder(
    @Param('orderId') orderId: string,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.bookingService.cancelFlightOrder(orderId, vendor);
    return { message: 'Flight order cancelled successfully', data };
  }

  @Post('flight-orders/:orderId/tickets')
  @ApiOperation({ summary: 'Issue ticket for a flight order' })
  async issueTicket(
    @Param('orderId') orderId: string,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.bookingService.issueTicket(orderId, vendor);
    return { message: 'Ticket issued successfully', data };
  }
}
