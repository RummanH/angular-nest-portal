import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { AirportStatus } from '../enums/airport-status.enum';

@Entity('airports')
export class Airport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', name: 'iata_code', length: 3, unique: true })
  iataCode!: string;

  @Column({
    type: 'varchar',
    name: 'icao_code',
    length: 4,
    unique: true,
    nullable: true,
  })
  icaoCode!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Column({ type: 'varchar', name: 'country_code', length: 2 })
  countryCode!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude!: number | null;

  @Column({
    type: 'enum',
    enum: AirportStatus,
    default: AirportStatus.ACTIVE,
  })
  status!: AirportStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
