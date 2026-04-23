import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AirportsRepository, PaginatedAirports } from './airports.repository';
import { Airport } from './entities/airport.entity';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import { SearchAirportDto } from './dto/search-airport.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AirportsService {
  constructor(private readonly airportsRepository: AirportsRepository) {}

  async search(dto: SearchAirportDto): Promise<Airport[]> {
    return this.airportsRepository.search(dto.q);
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedAirports> {
    return this.airportsRepository.findAll(pagination);
  }

  async findById(id: string): Promise<Airport> {
    const airport = await this.airportsRepository.findById(id);
    if (!airport) throw new NotFoundException(`Airport not found`);
    return airport;
  }

  async findByIata(iataCode: string): Promise<Airport> {
    const airport = await this.airportsRepository.findByIata(iataCode);
    if (!airport)
      throw new NotFoundException(`Airport '${iataCode}' not found`);
    return airport;
  }

  async create(dto: CreateAirportDto): Promise<Airport> {
    console.log(dto);
    const existing = await this.airportsRepository.findByIata(dto.iataCode);
    if (existing)
      throw new ConflictException(`Airport '${dto.iataCode}' already exists`);
    return this.airportsRepository.create(dto);
  }

  async update(id: string, dto: UpdateAirportDto): Promise<Airport> {
    await this.findById(id);
    const updated = await this.airportsRepository.update(id, dto);
    return updated!;
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);
    await this.airportsRepository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.airportsRepository.restore(id);
  }

  async bulkInsert(airports: Partial<Airport>[]): Promise<void> {
    return this.airportsRepository.bulkInsert(airports);
  }
}
