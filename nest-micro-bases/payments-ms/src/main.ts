import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { json } from 'express';

async function bootstrap() {
  const logger = new Logger('PaymentsMS');

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Configurar middleware de JSON que excluya la ruta del webhook
  app.use(
    json({
      verify: (req: any, res, buf) => {
        if (req.url === '/payments/webhook') {
          req.rawBody = buf;
        }
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      },
    },
    {
      inheritAppConfig: true,
    },
  );

  await app.startAllMicroservices();
  await app.listen(envs.port);
  logger.log(`PaymentsMS is running on port ${envs.port}`);
}
bootstrap();
