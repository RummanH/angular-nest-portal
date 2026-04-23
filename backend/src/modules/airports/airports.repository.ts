import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Airport } from './entities/airport.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

export interface PaginatedAirports {
  data: Airport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AirportsRepository {
  constructor(
    @InjectRepository(Airport)
    private readonly repo: Repository<Airport>,
  ) {}

  async search(q: string): Promise<Airport[]> {
    return this.repo
      .createQueryBuilder('airport')
      .where(
        `airport.iataCode ILIKE :iata OR
         airport.city ILIKE :text OR
         airport.name ILIKE :text`,
        {
          iata: `${q.toUpperCase()}%`,
          text: `%${q}%`,
        },
      )
      .andWhere('airport.status = :status', { status: 'active' })
      .orderBy(
        `CASE
          WHEN airport.iataCode = :exact THEN 0
          WHEN airport.iataCode ILIKE :iata THEN 1
          ELSE 2
        END`,
        'ASC',
      )
      .setParameters({
        exact: q.toUpperCase(),
        iata: `${q.toUpperCase()}%`,
      })
      .limit(10)
      .getMany();
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedAirports> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      order: { iataCode: 'ASC' },
      skip,
      take: limit,
      withDeleted: false,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Airport | null> {
    return this.repo.findOneBy({ id });
  }

  async findByIata(iataCode: string): Promise<Airport | null> {
    return this.repo.findOneBy({ iataCode: iataCode.toUpperCase() });
  }

  async create(data: Partial<Airport>): Promise<Airport> {
    const airport = this.repo.create(data);

    console.log(data);
    return this.repo.save(airport);
  }

  async update(id: string, data: Partial<Airport>): Promise<Airport | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repo.restore(id);
  }

  async bulkInsert(airports: Partial<Airport>[]): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(Airport)
      .values(airports)
      .orUpdate(
        ['name', 'city', 'country', 'country_code', 'timezone', 'status'],
        ['iata_code'],
      )
      .execute();
  }
}
