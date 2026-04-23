import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import cookieParser from 'cookie-parser';
import { RolesGuard } from './common/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT ?? 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.useGlobalGuards(new RolesGuard(new Reflector()));

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('OTA API')
      .setDescription('Online Travel Agency API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, config),
    );
    logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  logger.log(`Application running on: http://localhost:${port}/api/v1`);
}

bootstrap().catch((error: Error) => {
  new Logger('Bootstrap').error(
    `Fatal startup error: ${error.message}`,
    error.stack,
  );
  process.exit(1);
});
