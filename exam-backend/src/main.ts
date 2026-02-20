import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { AppLogger } from './common/logger/winston.logger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SentryService } from './common/services/sentry.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: AppLogger,
  });

  const cfg = app.get(ConfigService);
  const sentryDsn = cfg.get<string>('SENTRY_DSN');

  if (sentryDsn && cfg.get('NODE_ENV') === 'production') {
    Sentry.init({
      dsn: sentryDsn,
      environment: cfg.get('NODE_ENV', 'production'),
      tracesSampleRate: cfg.get<number>('SENTRY_TRACES_SAMPLE_RATE', 0.1),
    });
  }

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: cfg.get<string>('APP_URL'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Device-Fingerprint'],
  });

  app.setGlobalPrefix(cfg.get<string>('API_PREFIX', 'api'));
  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const sentryService = app.get(SentryService, { strict: false });
  app.useGlobalFilters(new AllExceptionsFilter(sentryService), new HttpExceptionFilter());

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
    new TransformInterceptor(),
  );

  if (cfg.get('NODE_ENV') !== 'production') {
    const swaggerCfg = new DocumentBuilder()
      .setTitle('Exam System API')
      .setDescription('Offline-First Multi-Tenant Exam System')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'Idempotency-Key', in: 'header' }, 'idempotency-key')
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerCfg));
  }

  const port = cfg.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 API running on port ${port} [${cfg.get('NODE_ENV', 'development')}]`);
}

bootstrap();
