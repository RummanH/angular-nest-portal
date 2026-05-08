import { Injectable } from '@nestjs/common';
import { CreateFlightOrderDto } from './dto/create-flight-order.dto';
import { VendorsService } from '../vendors/vendors.service';

@Injectable()
export class BookingService {
  constructor(private readonly vendorsService: VendorsService) {}

  async createFlightOrder(body: CreateFlightOrderDto, vendor?: string) {
    return this.vendorsService.resolve(vendor).createFlightOrder(body);
  }

  async getFlightOrder(orderId: string, vendor?: string) {
    return this.vendorsService.resolve(vendor).getFlightOrder(orderId);
  }

  async cancelFlightOrder(orderId: string, vendor?: string) {
    return this.vendorsService.resolve(vendor).cancelFlightOrder(orderId);
  }

  async issueTicket(orderId: string, vendor?: string) {
    return this.vendorsService.resolve(vendor).issueTicket(orderId);
  }
}
