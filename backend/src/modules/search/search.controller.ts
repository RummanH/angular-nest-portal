import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { SearchService } from './search.service';
import { SearchFlightOffersDto } from './dto/search-flight-offers.dto';
import { VerifyPriceDto } from './dto/verify-price.dto';
import { FlightScheduleQueryDto } from './dto/flight-schedule-query.dto';
import { SeatMapQueryDto } from './dto/seat-map-query.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { VendorQueryDto } from './dto/vendor-query.dto';
import { GdsTokenRequestDto } from './dto/gds-token-request.dto';
import { GetTokenDto } from './dto/get-token.dto';
import { AncillaryOffersDto } from './dto/ancillary-offers.dto';
import { UpsellingDto } from './dto/upselling.dto';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
// @UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /** Internal service-to-service only — exchanges credentials with the GDS provider */
  @Post('gds-auth/token')
  @Throttle({ gds: { ttl: 60000, limit: 5 } })
  // @Roles('service')
  @ApiOperation({
    summary: 'Exchange credentials with GDS provider (internal only)',
  })
  async requestGdsToken(
    @Body() body: GetTokenDto,
    @Query() { vendor }: VendorQueryDto,
  ) {
    const data = await this.searchService.getToken(body, vendor);
    return { message: 'GDS token issued successfully', data };
  }

  @Get('flights/offers')
  @Throttle({ gds: { ttl: 60000, limit: 20 } })
  @ApiOperation({
    summary: 'Search live flight offers across active GDS vendors',
  })
  async searchFlightOffers(@Query() query: SearchFlightOffersDto) {
    const data = await this.searchService.searchFlightOffers(
      query,
      query.vendor,
    );
    return { message: 'Flight offers retrieved successfully', data };
  }

  @Get('flights/offers/:offerId/fare-rules')
  @ApiOperation({ summary: 'Retrieve fare rules for a specific offer' })
  async getOfferFareRules(
    @Param('offerId') offerId: string, // validate UUID/format in service or a ParseOfferIdPipe
    @Query() { vendor }: VendorQueryDto,
  ) {
    const data = await this.searchService.getFareRules(offerId, vendor);
    return { message: 'Fare rules retrieved successfully', data };
  }

  @Post('flights/offers/price-verify')
  @Throttle({ gds: { ttl: 60000, limit: 30 } })
  @ApiOperation({
    summary: 'Confirm the latest price for a flight offer before booking',
  })
  async verifyOfferPrice(
    @Body() body: VerifyPriceDto,
    @Query() { vendor }: VendorQueryDto,
  ) {
    const data = await this.searchService.verifyPrice(body, vendor);
    return { message: 'Offer price confirmed successfully', data };
  }

  @Get('flights/offers/:offerId/seat-map')
  @ApiOperation({
    summary: 'Retrieve the seat map for a specific flight offer',
  })
  async getOfferSeatMap(
    @Param('offerId') offerId: string,
    @Query() { vendor }: VendorQueryDto,
  ) {
    const data = await this.searchService.getSeatMap(offerId, vendor);
    return { message: 'Seat map retrieved successfully', data };
  }

  @Post('flights/offers/ancillaries')
  @ApiOperation({
    summary: 'Get ancillary and upsell options for a flight offer',
  })
  async getAncillaryOffers(
    @Body() body: UpsellingDto,
    @Query() { vendor }: VendorQueryDto,
  ) {
    const data = await this.searchService.getAncillaries(body, vendor);
    return { message: 'Ancillary offers retrieved successfully', data };
  }

  @Get('flights/schedules')
  @ApiOperation({ summary: 'Query scheduled flights between two points' })
  async getFlightSchedules(@Query() query: FlightScheduleQueryDto) {
    const data = await this.searchService.getFlightSchedule(
      query,
      query.vendor,
    );
    return { message: 'Flight schedules retrieved successfully', data };
  }

  @Get('flights/status')
  @ApiOperation({ summary: 'Get real-time status for a specific flight' })
  async getFlightStatus(@Query() query: FlightScheduleQueryDto) {
    const data = await this.searchService.getFlightStatus(query, query.vendor);
    return { message: 'Flight status retrieved successfully', data };
  }
}
