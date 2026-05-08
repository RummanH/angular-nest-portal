import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchFlightOffersDto } from './dto/search-flight-offers.dto';
import { VerifyPriceDto } from './dto/verify-price.dto';
import { FlightScheduleQueryDto } from './dto/flight-schedule-query.dto';
import { UpsellingDto } from './dto/upselling.dto';
import { SeatMapQueryDto } from './dto/seat-map-query.dto';
import { GetTokenDto } from './dto/get-token.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('token')
  @ApiOperation({ summary: 'Get token from GDS provider' })
  async getToken(@Body() body: GetTokenDto, @Query('vendor') vendor?: string) {
    const data = await this.searchService.getToken(body, vendor);
    return { message: 'Token retrieved successfully', data };
  }

  @Get('flight-offers')
  @ApiOperation({ summary: 'Search flight offers across active vendors' })
  async searchFlightOffers(@Query() query: SearchFlightOffersDto) {
    const data = await this.searchService.searchFlightOffers(
      query,
      query.vendor,
    );
    return { message: 'Flight offers retrieved successfully', data };
  }

  @Get('flight-offers/:offerId/fare-rules')
  @ApiOperation({ summary: 'Get fare rules by offer id' })
  async getFareRules(
    @Param('offerId') offerId: string,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.searchService.getFareRules(offerId, vendor);
    return { message: 'Fare rules retrieved successfully', data };
  }

  @Post('flight-offers/pricing')
  @ApiOperation({ summary: 'Verify latest offer price' })
  async verifyPrice(
    @Body() body: VerifyPriceDto,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.searchService.verifyPrice(body, vendor);
    return { message: 'Offer pricing verified successfully', data };
  }

  @Get('seat-maps')
  @ApiOperation({ summary: 'Get seat map for an offer' })
  async getSeatMaps(@Query() query: SeatMapQueryDto) {
    const data = await this.searchService.getSeatMap(
      query.offerId,
      query.vendor,
    );
    return { message: 'Seat map retrieved successfully', data };
  }

  @Post('upselling')
  @ApiOperation({ summary: 'Get ancillary upsell offers' })
  async getAncillaries(
    @Body() body: UpsellingDto,
    @Query('vendor') vendor?: string,
  ) {
    const data = await this.searchService.getAncillaries(body, vendor);
    return { message: 'Ancillary offers retrieved successfully', data };
  }

  @Get('schedule/flights')
  @ApiOperation({ summary: 'Get flight schedule' })
  async getFlightSchedule(@Query() query: FlightScheduleQueryDto) {
    const data = await this.searchService.getFlightSchedule(
      query,
      query.vendor,
    );
    return { message: 'Flight schedule retrieved successfully', data };
  }

  @Get('flight/status')
  @ApiOperation({ summary: 'Get flight status' })
  async getFlightStatus(@Query() query: FlightScheduleQueryDto) {
    const data = await this.searchService.getFlightStatus(query, query.vendor);
    return { message: 'Flight status retrieved successfully', data };
  }
}
