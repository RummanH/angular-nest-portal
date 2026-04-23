import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airport } from './entities/airport.entity';
import { AirportsRepository } from './airports.repository';
import { AirportsService } from './airports.service';
import { AirportsController } from './airports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Airport])],
  controllers: [AirportsController],
  providers: [AirportsRepository, AirportsService],
  exports: [AirportsService],
})
export class AirportsModule {}
