import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AirportsService } from './airports.service';
import { SearchAirportDto } from './dto/search-airport.dto';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Airports')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('airports')
export class AirportsController {
  constructor(private readonly airportsService: AirportsService) {}

  @Get('search')
  // @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Search airports by IATA, city or name' })
  @ApiResponse({ status: 200, description: 'Matching airports returned' })
  async search(@Query() dto: SearchAirportDto) {
    const data = await this.airportsService.search(dto);
    return { message: 'Airports retrieved successfully', data };
  }

  @Get(':iataCode/by-iata')
  // @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Get single airport by IATA code' })
  async findByIata(@Param('iataCode') iataCode: string) {
    const data = await this.airportsService.findByIata(iataCode);
    return { message: 'Airport retrieved successfully', data };
  }

  @Get()
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] List all airports with pagination' })
  async findAll(@Query() pagination: PaginationDto) {
    const data = await this.airportsService.findAll(pagination);
    return { message: 'Airports retrieved successfully', data };
  }

  @Get(':id')
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Get airport by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.airportsService.findById(id);
    return { message: 'Airport retrieved successfully', data };
  }

  @Post()
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Create a new airport' })
  @ApiResponse({ status: 201, description: 'Airport created' })
  @ApiResponse({ status: 409, description: 'IATA code already exists' })
  async create(@Body() dto: CreateAirportDto) {
    console.log(dto);
    const data = await this.airportsService.create(dto);
    return { message: 'Airport created successfully', data };
  }

  @Patch(':id')
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Update an airport' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAirportDto,
  ) {
    const data = await this.airportsService.update(id, dto);
    return { message: 'Airport updated successfully', data };
  }

  @Delete(':id')
  // @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Admin] Soft delete an airport' })
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    await this.airportsService.softDelete(id);
    return { message: 'Airport deleted successfully', data: null };
  }

  @Patch(':id/restore')
  // @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Restore a soft-deleted airport' })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    await this.airportsService.restore(id);
    return { message: 'Airport restored successfully', data: null };
  }
}
