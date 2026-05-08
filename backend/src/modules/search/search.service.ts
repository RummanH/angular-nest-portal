import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { SearchFlightOffersDto } from './dto/search-flight-offers.dto';
import { VerifyPriceDto } from './dto/verify-price.dto';
import { FlightScheduleQueryDto } from './dto/flight-schedule-query.dto';
import { UpsellingDto } from './dto/upselling.dto';
import { GetTokenDto } from './dto/get-token.dto';
import { VendorsService } from '../vendors/vendors.service';

@Injectable()
export class SearchService {
  constructor(private readonly vendorsService: VendorsService) {}

  async getToken(body: GetTokenDto, vendor?: string) {
    return this.vendorsService.resolve(vendor).getToken(body);
  }

  async searchFlightOffers(query: SearchFlightOffersDto, vendor?: string) {
    const searchQuery = {
      ...query,
      vendor: undefined,
    };
    const providers = vendor
      ? [this.vendorsService.resolve(vendor)]
      : this.vendorsService.getActiveProviders();

    const settledResults = await Promise.allSettled(
      providers.map(async (provider) => ({
        vendor: provider.name,
        data: await provider.searchFlightOffers(searchQuery),
      })),
    );

    const results = settledResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);

    if (!results.length) {
      throw new ServiceUnavailableException(
        'No active vendors returned flight offers',
      );
    }

    return results;
  }

  async getFareRules(offerId: string, vendor?: string) {
    return this.vendorsService.resolve(vendor).getFareRules(offerId);
  }

  async verifyPrice(body: VerifyPriceDto, vendor?: string) {
    return this.vendorsService.resolve(vendor).verifyPrice(body);
  }

  async getSeatMap(offerId: string, vendor?: string) {
    return this.vendorsService.resolve(vendor).getSeatMap(offerId);
  }

  async getFlightSchedule(query: FlightScheduleQueryDto, vendor?: string) {
    const scheduleQuery = {
      ...query,
      vendor: undefined,
    };
    return this.vendorsService.resolve(vendor).getFlightSchedule(scheduleQuery);
  }

  async getFlightStatus(query: FlightScheduleQueryDto, vendor?: string) {
    const statusQuery = {
      ...query,
      vendor: undefined,
    };
    return this.vendorsService.resolve(vendor).getFlightStatus(statusQuery);
  }

  async getAncillaries(body: UpsellingDto, vendor?: string) {
    return this.vendorsService.resolve(vendor).getAncillaries(body);
  }
}
