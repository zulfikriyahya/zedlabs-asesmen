// src/common/providers/redis.provider.ts
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
  useFactory: (cfg: ConfigService): Redis =>
    new Redis({
      host: cfg.get('REDIS_HOST', 'localhost'),
      port: cfg.get<number>('REDIS_PORT', 6379),
      password: cfg.get('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    }),
};
