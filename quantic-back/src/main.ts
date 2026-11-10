import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // FRONT_URL: URL pública del front (en producción); en local, Angular corre en el 4200
  app.enableCors({ origin: process.env.FRONT_URL ?? 'http://localhost:4200' });
  // whitelist: descarta campos que no están en el DTO. transform: convierte a los tipos del DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
