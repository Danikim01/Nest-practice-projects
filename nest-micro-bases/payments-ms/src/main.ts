import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('PaymentsMS');
  const app = await NestFactory.create(AppModule);

  // 🔑 Make raw body available ONLY for Stripe webhook route
  app.use('/payments/webhook', bodyParser.raw({ type: 'application/json' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(envs.port);
  logger.log(`PaymentsMS is running on port ${envs.port}`);
}
bootstrap();
