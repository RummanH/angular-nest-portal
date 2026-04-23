import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AirportsModule } from './modules/airports/airports.module';

@Module({
  imports: [
    ConfigModule,

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          host: configService.getOrThrow<string>('database.host'),
          port: configService.getOrThrow<number>('database.port'),
          username: configService.getOrThrow<string>('database.username'),
          password: configService.getOrThrow<string>('database.password'),
          database: configService.getOrThrow<string>('database.name'),
          autoLoadEntities: true,
          synchronize: true,
          logging: !isProd,
          ssl: isProd ? { rejectUnauthorized: false } : false,
          retryAttempts: 5,
          retryDelay: 3000,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          migrationsRun: true,
        };
      },
    }),

    AuthModule,
    UsersModule,
    AirportsModule,
  ],
})
export class AppModule {}
