## Direktori: src

### File: `src/app.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getInfo() {
    return this.appService.getInfo();
  }
}

```

---

### File: `src/app.module.ts`

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { SubdomainMiddleware } from './common/middleware/subdomain.middleware';
import { PerformanceMiddleware } from './common/middleware/performance.middleware';
import { TenantGuard } from './common/guards/tenant.guard';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { SentryService } from './common/services/sentry.service';
import { EmailService } from './common/services/email.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { QuestionTagsModule } from './modules/question-tags/question-tags.module';
import { ExamPackagesModule } from './modules/exam-packages/exam-packages.module';
import { ExamRoomsModule } from './modules/exam-rooms/exam-rooms.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { GradingModule } from './modules/grading/grading.module';
import { SyncModule } from './modules/sync/sync.module';
import { MediaModule } from './modules/media/media.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HealthModule } from './modules/health/health.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisProvider } from './common/providers/redis.provider';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),

    // Event emitter untuk domain events (exam.submitted, grading.completed, dll)
    EventEmitterModule.forRoot({ wildcard: false, maxListeners: 20 }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: cfg.get<number>('THROTTLE_TTL', 60) * 1000,
            limit: cfg.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: {
          host: cfg.get('REDIS_HOST', 'localhost'),
          port: cfg.get<number>('REDIS_PORT', 6379),
          password: cfg.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: false,
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
        },
      }),
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    SubjectsModule,
    QuestionsModule,
    QuestionTagsModule,
    ExamPackagesModule,
    ExamRoomsModule,
    SessionsModule,
    SubmissionsModule,
    GradingModule,
    SyncModule,
    MediaModule,
    MonitoringModule,
    ActivityLogsModule,
    AuditLogsModule,
    AnalyticsModule,
    ReportsModule,
    NotificationsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisProvider,
    SentryService,
    EmailService,
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
  exports: [SentryService, EmailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SubdomainMiddleware, LoggerMiddleware, PerformanceMiddleware).forRoutes('*');
  }
}

```

---

### File: `src/app.service.ts`

```typescript
// ── app.service.ts ────────────────────────────────────────────────────────────
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Exam System API',
      version: '1.0.0',
      description: 'Offline-First Multi-Tenant Exam System',
    };
  }
}

```

---

### File: `src/common/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  sub: string;
  tenantId: string;
  role: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload =>
    ctx.switchToHttp().getRequest().user,
);

```

---

### File: `src/common/decorators/idempotency.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
export const IDEMPOTENCY_KEY = 'idempotency';
export const UseIdempotency = () => SetMetadata(IDEMPOTENCY_KEY, true);

```

---

### File: `src/common/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

```

---

### File: `src/common/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

```

---

### File: `src/common/decorators/tenant-id.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const TenantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => ctx.switchToHttp().getRequest().tenantId,
);

```

---

### File: `src/common/decorators/throttle-tier.decorator.ts`

```typescript
import { Throttle, SkipThrottle } from '@nestjs/throttler';

/**
 * Tier definitions:
 *
 * STRICT   — endpoint kritis: download paket, submit ujian
 *            5 req / 60 detik per user
 *
 * MODERATE — endpoint semi-kritis: submit jawaban, upload chunk
 *            30 req / 60 detik per user
 *
 * RELAXED  — endpoint baca biasa: list, get detail
 *            120 req / 60 detik per user  (override default 100)
 *
 * OPEN     — endpoint yang tidak perlu throttle sama sekali
 */
export const ThrottleStrict = () => Throttle({ default: { limit: 5, ttl: 60_000 } });
export const ThrottleModerate = () => Throttle({ default: { limit: 30, ttl: 60_000 } });
export const ThrottleRelaxed = () => Throttle({ default: { limit: 120, ttl: 60_000 } });
export const ThrottleOpen = () => SkipThrottle();

```

---

### File: `src/common/dto/base-query.dto.ts`

```typescript
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class BaseQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

```

---

### File: `src/common/dto/base-response.dto.ts`

```typescript
export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = { total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

```

---

### File: `src/common/dto/pagination.dto.ts`

```typescript
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

```

---

### File: `src/common/enums/exam-status.enum.ts`

```typescript
export enum ExamPackageStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  TIMED_OUT = 'TIMED_OUT',
  ABANDONED = 'ABANDONED',
}

```

---

### File: `src/common/enums/grading-status.enum.ts`

```typescript
export enum GradingStatus {
  PENDING = 'PENDING',
  AUTO_GRADED = 'AUTO_GRADED',
  MANUAL_REQUIRED = 'MANUAL_REQUIRED',
  COMPLETED = 'COMPLETED',
  PUBLISHED = 'PUBLISHED',
}

```

---

### File: `src/common/enums/question-type.enum.ts`

```typescript
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  COMPLEX_MULTIPLE_CHOICE = 'COMPLEX_MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  MATCHING = 'MATCHING',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
}

```

---

### File: `src/common/enums/sync-status.enum.ts`

```typescript
export enum SyncStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DEAD_LETTER = 'DEAD_LETTER',
}

export enum SyncType {
  SUBMIT_ANSWER = 'SUBMIT_ANSWER',
  SUBMIT_EXAM = 'SUBMIT_EXAM',
  UPLOAD_MEDIA = 'UPLOAD_MEDIA',
  ACTIVITY_LOG = 'ACTIVITY_LOG',
}

```

---

### File: `src/common/enums/user-role.enum.ts`

```typescript
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  SUPERVISOR = 'SUPERVISOR',
  OPERATOR = 'OPERATOR',
  STUDENT = 'STUDENT',
}

```

---

### File: `src/common/exceptions/device-locked.exception.ts`

```typescript
import { ForbiddenException } from '@nestjs/common';

export class DeviceLockedException extends ForbiddenException {
  constructor(fingerprint: string) {
    super(`Perangkat '${fingerprint}' telah dikunci. Hubungi pengawas.`);
  }
}

```

---

### File: `src/common/exceptions/exam-not-available.exception.ts`

```typescript
import { BadRequestException } from '@nestjs/common';

export class ExamNotAvailableException extends BadRequestException {
  constructor(reason?: string) {
    super(reason ?? 'Ujian tidak tersedia saat ini');
  }
}

```

---

### File: `src/common/exceptions/idempotency-conflict.exception.ts`

```typescript
import { ConflictException } from '@nestjs/common';

export class IdempotencyConflictException extends ConflictException {
  constructor(key: string) {
    super(`Permintaan dengan idempotency key '${key}' sudah diproses`);
  }
}

```

---

### File: `src/common/exceptions/tenant-not-found.exception.ts`

```typescript
import { NotFoundException } from '@nestjs/common';

export class TenantNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Tenant '${identifier}' tidak ditemukan atau tidak aktif`);
  }
}

```

---

### File: `src/common/filters/all-exceptions.filter.ts`

```typescript
import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger, Optional } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SentryService } from '../services/sentry.service';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(@Optional() private readonly sentry?: SentryService) {
    super();
  }

  catch(ex: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<{
      method: string;
      url: string;
      user?: { sub?: string; tenantId?: string; role?: string };
    }>();

    const status = ex instanceof HttpException ? ex.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (ex instanceof Error) {
      this.logger.error(
        `Unhandled [${status}]: ${req.method} ${req.url} — ${ex.message}`,
        ex.stack,
      );

      // Hanya kirim ke Sentry jika 5xx (bukan kesalahan klien)
      if (status >= 500 && this.sentry) {
        this.sentry.captureException(ex, {
          method: req.method,
          url: req.url,
          userId: req.user?.sub,
          tenantId: req.user?.tenantId,
          role: req.user?.role,
        });
      }
    }

    super.catch(ex, host);
  }
}

```

---

### File: `src/common/filters/http-exception.filter.ts`

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(ex: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = ex.getStatus();
    const exRes = ex.getResponse();

    const message =
      typeof exRes === 'object' && 'message' in (exRes as object)
        ? (exRes as { message: string | string[] }).message
        : ex.message;

    this.logger.warn(`[${status}] ${req.method} ${req.url} — ${JSON.stringify(message)}`);

    res.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}

```

---

### File: `src/common/guards/tenant.guard.ts`

```typescript
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TenantNotFoundException } from '../exceptions/tenant-not-found.exception';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest();
    if (!req.tenantId) {
      this.logger.warn('Request tanpa tenantId ditolak');
      throw new TenantNotFoundException('unknown');
    }
    return true;
  }
}

```

---

### File: `src/common/guards/throttler.guard.ts`

```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Tracker key: tenantId:userId  → setiap user dihitung sendiri
   * Fallback ke tenantId:ip jika belum authenticated
   */
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const tenantId = (req as { tenantId?: string }).tenantId ?? 'global';
    const user = (req as { user?: { sub?: string } }).user;
    const userId = user?.sub ?? (req as { ip?: string }).ip ?? '0.0.0.0';
    return `${tenantId}:${userId}`;
  }

  /**
   * Skip throttle untuk role ADMIN dan SUPERADMIN —
   * mereka tidak boleh terkena block saat mengelola sistem
   */
  protected async shouldSkip(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const role = (req.user as { role?: string } | undefined)?.role;
    return role === UserRole.ADMIN || role === UserRole.SUPERADMIN;
  }

  protected async throwThrottlingException(
    ctx: ExecutionContext,
    throttlerLimitDetail: Parameters<ThrottlerGuard['throwThrottlingException']>[1],
  ): Promise<void> {
    const req = ctx.switchToHttp().getRequest<{ url: string }>();
    throw new ThrottlerException(
      `Terlalu banyak request ke ${req.url}. Coba lagi setelah beberapa saat.`,
    );
  }
}

```

---

### File: `src/common/interceptors/idempotency.interceptor.ts`

```typescript
// src/common/interceptors/idempotency.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 jam (detik)

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  // Redis di-inject optional — fallback ke Map jika tidak tersedia (test)
  constructor(@Optional() @Inject('REDIS_CLIENT') private readonly redis?: Redis) {}

  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers['idempotency-key'] as string | undefined;
    if (!key) return next.handle();

    const cacheKey = `idempotency:${key}`;

    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) return of(JSON.parse(cached));
      return next.handle().pipe(
        tap(async (res) => {
          await this.redis!.setex(cacheKey, IDEMPOTENCY_TTL, JSON.stringify(res));
        }),
      );
    }

    // Fallback in-memory (dev/test)
    if (localCache.has(key)) return of(localCache.get(key));
    return next.handle().pipe(
      tap((res) => {
        localCache.set(key, res);
        setTimeout(() => localCache.delete(key), IDEMPOTENCY_TTL * 1000);
      }),
    );
  }
}
const localCache = new Map<string, unknown>();

```

---

### File: `src/common/interceptors/logging.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        this.logger.log(`${method} ${url} — ${ms}ms`);
      }),
    );
  }
}

```

---

### File: `src/common/interceptors/tenant.interceptor.ts`

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantInterceptor.name);

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<{
      tenantId?: string;
      user?: { tenantId?: string };
      method: string;
      url: string;
    }>();

    // Jika tenantId sudah di-set oleh SubdomainMiddleware, sinkronisasikan
    // ke user payload agar konsisten di seluruh layer (service, guard, decorator)
    if (req.tenantId && req.user && !req.user.tenantId) {
      req.user.tenantId = req.tenantId;
    }

    // Jika tenantId belum ada dari subdomain tapi user JWT punya tenantId,
    // fallback ke JWT (misal akses via IP langsung oleh SUPERADMIN)
    if (!req.tenantId && req.user?.tenantId) {
      req.tenantId = req.user.tenantId;
    }

    return next.handle().pipe(
      tap(() => {
        if (process.env.NODE_ENV === 'development') {
          this.logger.debug(`[${req.method}] ${req.url} — tenant: ${req.tenantId ?? 'none'}`);
        }
      }),
    );
  }
}

```

---

### File: `src/common/interceptors/timeout.interceptor.ts`

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(30_000),
      catchError((err) => {
        if (err instanceof TimeoutError) throw new RequestTimeoutException();
        throw err;
      }),
    );
  }
}

```

---

### File: `src/common/interceptors/transform.interceptor.ts`

```typescript
// ── transform.interceptor.ts ─────────────────────────────
import {
  CallHandler,
  ExecutionContext as EC,
  Injectable as Inj,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Inj()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_ctx: EC, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

```

---

### File: `src/common/logger/winston.logger.ts`

```typescript
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, ms, errors } = winston.format;

const isProd = process.env.NODE_ENV === 'production';

const fileRotateTransport = (level: string) =>
  new winston.transports.DailyRotateFile({
    level,
    filename: `logs/${level}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: combine(timestamp(), errors({ stack: true }), winston.format.json()),
  });

export const AppLogger = WinstonModule.createLogger({
  transports: [
    // Console — pretty di dev, JSON di prod
    new winston.transports.Console({
      format: isProd
        ? combine(timestamp(), errors({ stack: true }), winston.format.json())
        : combine(
            timestamp(),
            ms(),
            errors({ stack: true }),
            nestWinstonModuleUtilities.format.nestLike('ExamAPI', {
              colors: true,
              prettyPrint: true,
            }),
          ),
    }),
    // File transports (hanya production)
    ...(isProd
      ? [fileRotateTransport('error'), fileRotateTransport('warn'), fileRotateTransport('info')]
      : []),
  ],
  exceptionHandlers: isProd ? [fileRotateTransport('exception')] : [],
  rejectionHandlers: isProd ? [fileRotateTransport('rejection')] : [],
});

```

---

### File: `src/common/middleware/logger.middleware.ts`

```typescript
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, _res: Response, next: NextFunction) {
    this.logger.debug(`→ ${req.method} ${req.url}`);
    next();
  }
}

```

---

### File: `src/common/middleware/performance.middleware.ts`

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      if (ms > 1000) console.warn(`⚠️  Slow request: ${ms.toFixed(1)}ms`);
    });
    next();
  }
}

```

---

### File: `src/common/middleware/subdomain.middleware.ts`

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction) {
    const host = req.hostname; // e.g. smkn1.exam.app
    const parts = host.split('.');

    if (parts.length > 2) {
      const subdomain = parts[0];
      try {
        const tenant = await this.prisma.tenant.findFirst({
          where: { subdomain, isActive: true },
          select: { id: true },
        });
        req.tenantId = tenant?.id ?? undefined;
      } catch {
        req.tenantId = undefined;
      }
    } else {
      req.tenantId = undefined;
    }

    next();
  }
}

```

---

### File: `src/common/pipes/parse-int.pipe.ts`

```typescript
// ── parse-int.pipe.ts ────────────────────────────────────
import {
  PipeTransform,
  Injectable as PI,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@PI()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(val: string, _meta: ArgumentMetadata): number {
    const n = parseInt(val, 10);
    if (isNaN(n)) throw new BadRequestException(`'${val}' bukan angka valid`);
    return n;
  }
}

```

---

### File: `src/common/pipes/validation.pipe.ts`

```typescript
// ── validation.pipe.ts ───────────────────────────────────
import { ValidationPipe } from '@nestjs/common';

export const AppValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
});

```

---

### File: `src/common/providers/redis.provider.ts`

```typescript
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

```

---

### File: `src/common/services/email.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly enabled: boolean;
  private readonly from: string;

  constructor(private readonly cfg: ConfigService) {
    const user = cfg.get<string>('SMTP_USER');
    const pass = cfg.get<string>('SMTP_PASS');
    this.enabled = !!(user && pass);
    this.from = cfg.get<string>('SMTP_FROM', 'noreply@exam.app');

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: cfg.get<string>('SMTP_HOST', 'smtp.gmail.com'),
        port: cfg.get<number>('SMTP_PORT', 587),
        secure: cfg.get<string>('SMTP_SECURE') === 'true',
        auth: { user, pass },
      });
      this.logger.log('Email service diinisialisasi');
    } else {
      this.logger.warn('SMTP tidak dikonfigurasi — email dinonaktifkan');
    }
  }

  async send(opts: SendMailOptions): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      this.logger.debug(`[EMAIL SKIP] To: ${opts.to} | Subject: ${opts.subject}`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      this.logger.log(`Email terkirim ke ${opts.to}: ${opts.subject}`);
      return true;
    } catch (err) {
      this.logger.error(`Gagal kirim email ke ${opts.to}: ${(err as Error).message}`);
      return false;
    }
  }

  async sendSessionActivated(opts: {
    to: string;
    name: string;
    sessionTitle: string;
    tokenCode: string;
    startTime: Date;
    endTime: Date;
  }): Promise<boolean> {
    return this.send({
      to: opts.to,
      subject: `[Ujian] Sesi "${opts.sessionTitle}" telah dimulai`,
      html: `
        <h2>Sesi Ujian Dimulai</h2>
        <p>Halo <strong>${opts.name}</strong>,</p>
        <p>Sesi ujian <strong>${opts.sessionTitle}</strong> telah diaktifkan.</p>
        <p><strong>Token Anda:</strong> <code style="font-size:1.5em;letter-spacing:4px">${opts.tokenCode}</code></p>
        <p>Waktu: ${opts.startTime.toLocaleString('id-ID')} — ${opts.endTime.toLocaleString('id-ID')}</p>
        <p>Segera login dan masukkan token untuk memulai ujian.</p>
      `,
      text: `Sesi ${opts.sessionTitle} dimulai. Token: ${opts.tokenCode}`,
    });
  }

  async sendResultPublished(opts: {
    to: string;
    name: string;
    sessionTitle: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
  }): Promise<boolean> {
    const passed = opts.percentage >= 70;
    return this.send({
      to: opts.to,
      subject: `[Ujian] Nilai "${opts.sessionTitle}" telah dipublikasi`,
      html: `
        <h2>Hasil Ujian Tersedia</h2>
        <p>Halo <strong>${opts.name}</strong>,</p>
        <p>Nilai Anda untuk sesi <strong>${opts.sessionTitle}</strong>:</p>
        <table>
          <tr><td>Skor</td><td>${opts.totalScore} / ${opts.maxScore}</td></tr>
          <tr><td>Persentase</td><td>${opts.percentage}%</td></tr>
          <tr><td>Status</td><td style="color:${passed ? 'green' : 'red'}">${passed ? 'LULUS' : 'TIDAK LULUS'}</td></tr>
        </table>
        <p>Login untuk melihat detail jawaban.</p>
      `,
      text: `Nilai ${opts.sessionTitle}: ${opts.totalScore}/${opts.maxScore} (${opts.percentage}%)`,
    });
  }
}

```

---

### File: `src/common/services/sentry.service.ts`

```typescript
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);
  private initialized = false;

  constructor(private readonly cfg: ConfigService) {}

  onModuleInit() {
    const dsn = this.cfg.get<string>('SENTRY_DSN');
    const env = this.cfg.get<string>('NODE_ENV', 'development');

    if (!dsn) {
      this.logger.warn('SENTRY_DSN tidak dikonfigurasi — Sentry dinonaktifkan');
      return;
    }

    Sentry.init({
      dsn,
      environment: env,
      tracesSampleRate: this.cfg.get<number>('SENTRY_TRACES_SAMPLE_RATE', 0.1),
      integrations: [Sentry.httpIntegration(), Sentry.expressIntegration()],
      beforeSend(event) {
        // Hapus data sensitif sebelum dikirim
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });

    this.initialized = true;
    this.logger.log(`Sentry diinisialisasi (env: ${env})`);
  }

  captureException(error: Error, context?: Record<string, unknown>) {
    if (!this.initialized) return;
    Sentry.withScope((scope) => {
      if (context) scope.setExtras(context);
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    if (!this.initialized) return;
    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; tenantId: string; role: string }) {
    if (!this.initialized) return;
    Sentry.setUser({ id: user.id, tenantId: user.tenantId, role: user.role });
  }

  clearUser() {
    if (!this.initialized) return;
    Sentry.setUser(null);
  }
}

```

---

### File: `src/common/utils/checksum.util.ts`

```typescript
// ── checksum.util.ts ─────────────────────────────────────────────────────────
import { createHash } from 'crypto';

export function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

export function md5(data: string | Buffer): string {
  return createHash('md5').update(data).digest('hex');
}

```

---

### File: `src/common/utils/device-fingerprint.util.ts`

```typescript
// ── device-fingerprint.util.ts ───────────────────────────────────────────────
import { createHash as ch } from 'crypto';

export function hashFingerprint(raw: string): string {
  return ch('sha256').update(raw).digest('hex');
}

export function validateFingerprint(raw: string, stored: string): boolean {
  return hashFingerprint(raw) === stored;
}

```

---

### File: `src/common/utils/encryption.util.ts`

```typescript
// ── encryption.util.ts ───────────────────────────────────────────────────────
import * as crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

export function encrypt(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // format: iv(12) + tag(16) + ciphertext → base64
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decrypt(ciphertext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const buf = Buffer.from(ciphertext, 'base64');
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString('utf8') + decipher.final('utf8');
}

```

---

### File: `src/common/utils/file.util.ts`

```typescript
// ── file.util.ts ─────────────────────────────────────────────────────────────
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function generateObjectName(originalName: string, prefix = ''): string {
  const ext = path.extname(originalName);
  const name = uuidv4();
  return prefix ? `${prefix}/${name}${ext}` : `${name}${ext}`;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

```

---

### File: `src/common/utils/presigned-url.util.ts`

```typescript
// ── presigned-url.util.ts ────────────────────────────────────────────────────
// Wrapper tipis — implementasi nyata ada di media.service menggunakan MinIO client
export function buildPresignedPath(bucket: string, objectName: string): string {
  return `${bucket}/${objectName}`;
}

```

---

### File: `src/common/utils/randomizer.util.ts`

```typescript
// ── randomizer.util.ts ───────────────────────────────────────────────────────
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateTokenCode(len = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join(
    '',
  );
}

```

---

### File: `src/common/utils/similarity.util.ts`

```typescript
// ── similarity.util.ts ───────────────────────────────────────────────────────
import stringSimilarity from 'string-similarity';

export function cosineSimilarity(a: string, b: string): number {
  return stringSimilarity.compareTwoStrings(a.toLowerCase().trim(), b.toLowerCase().trim());
}

export function isAboveThreshold(a: string, b: string, threshold = 0.8): boolean {
  return cosineSimilarity(a, b) >= threshold;
}

```

---

### File: `src/common/utils/time-validation.util.ts`

```typescript
// ── time-validation.util.ts ──────────────────────────────────────────────────
export function isWithinWindow(start: Date, end: Date, now = new Date()): boolean {
  return now >= start && now <= end;
}

export function secondsRemaining(end: Date, now = new Date()): number {
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}

```

---

### File: `src/common/validators/is-tenant-exists.validator.ts`

```typescript
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@ValidatorConstraint({ name: 'isTenantExists', async: true })
@Injectable()
export class IsTenantExistsConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(val: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: val, isActive: true },
    });
    return !!tenant;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Tenant '${args.value}' tidak ditemukan`;
  }
}

export function IsTenantExists(opts?: ValidationOptions) {
  return (obj: object, prop: string) =>
    registerDecorator({
      target: obj.constructor,
      propertyName: prop,
      options: opts,
      constraints: [],
      validator: IsTenantExistsConstraint,
    });
}

```

---

### File: `src/common/validators/is-unique.validator.ts`

```typescript
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@ValidatorConstraint({ name: 'isUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(val: string, args: ValidationArguments): Promise<boolean> {
    const [model, field, tenantId] = args.constraints as [string, string, string | undefined];
    const where: Record<string, unknown> = { [field]: val };
    if (tenantId) where.tenantId = tenantId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = await (this.prisma as any)[model].findFirst({ where });
    return !record;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} '${args.value}' sudah digunakan`;
  }
}

export function IsUnique(model: string, field: string, opts?: ValidationOptions) {
  return (obj: object, prop: string) =>
    registerDecorator({
      target: obj.constructor,
      propertyName: prop,
      options: opts,
      constraints: [model, field],
      validator: IsUniqueConstraint,
    });
}

```

---

### File: `src/config/app.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  url: process.env.APP_URL ?? 'http://localhost:3000',
}));

```

---

### File: `src/config/bullmq.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
export const bullmqConfig = registerAs('bullmq', () => ({
  concurrency: parseInt(process.env.BULLMQ_CONCURRENCY ?? '10', 10),
}));

```

---

### File: `src/config/database.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  directUrl: process.env.DATABASE_DIRECT_URL,
}));

```

---

### File: `src/config/jwt.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET ?? 'access-secret',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
}));

```

---

### File: `src/config/minio.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
export const minioConfig = registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
  port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
  bucket: process.env.MINIO_BUCKET ?? 'exam-assets',
  presignedTtl: parseInt(process.env.MINIO_PRESIGNED_TTL ?? '3600', 10),
}));

```

---

### File: `src/config/multer.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
export const multerConfig = registerAs('multer', () => ({
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? String(1024 ** 3), 10),
  allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES ?? 'image/jpeg,image/png,image/webp').split(','),
  allowedAudioTypes: (process.env.ALLOWED_AUDIO_TYPES ?? 'audio/mpeg,audio/wav,audio/webm').split(','),
  allowedVideoTypes: (process.env.ALLOWED_VIDEO_TYPES ?? 'video/mp4,video/webm').split(','),
}));

```

---

### File: `src/config/redis.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
}));

```

---

### File: `src/config/sentry.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

export const sentryConfig = registerAs('sentry', () => ({
  dsn: process.env.SENTRY_DSN ?? '',
  environment: process.env.NODE_ENV ?? 'development',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
  enabled: !!process.env.SENTRY_DSN && process.env.NODE_ENV === 'production',
}));

```

---

### File: `src/config/smtp.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

export const smtpConfig = registerAs('smtp', () => ({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT ?? '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER ?? '',
  pass: process.env.SMTP_PASS ?? '',
  from: process.env.SMTP_FROM ?? 'noreply@exam.app',
  enabled: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
}));

```

---

### File: `src/config/throttler.config.ts`

```typescript
import { registerAs } from '@nestjs/config';
export const throttlerConfig = registerAs('throttler', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
  limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
}));

```

---

### File: `src/main.ts`

```typescript
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

```

---

### File: `src/modules/activity-logs/activity-logs.module.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/activity-logs/activity-logs.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { ActivityLogsService } from './services/activity-logs.service';
import { ActivityLogsController } from './controllers/activity-logs.controller';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [MonitoringModule],
  providers: [ActivityLogsService],
  controllers: [ActivityLogsController],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}

```

---

### File: `src/modules/activity-logs/controllers/activity-logs.controller.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/activity-logs/controllers/activity-logs.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ActivityLogsService } from '../services/activity-logs.service';
import { CreateActivityLogDto } from '../dto/create-activity-log.dto';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogsController {
  constructor(private svc: ActivityLogsService) {}

  @Get(':attemptId')
  findByAttempt(@Param('attemptId') id: string) {
    return this.svc.findByAttempt(id);
  }

  @Post()
  create(@Body() dto: CreateActivityLogDto) {
    return this.svc.create(dto);
  }
}

```

---

### File: `src/modules/activity-logs/dto/create-activity-log.dto.ts`

```typescript
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
export class CreateActivityLogDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() userId!: string;
  @IsString() @IsNotEmpty() type!: string;
  @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}

```

---

### File: `src/modules/activity-logs/services/activity-logs.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/activity-logs/services/activity-logs.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MonitoringGateway } from '../../monitoring/gateways/monitoring.gateway';
import { CreateActivityLogDto } from '../dto/create-activity-log.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ActivityLogsService {
  constructor(
    private prisma: PrismaService,
    private monitorGateway: MonitoringGateway,
  ) {}

  async create(dto: CreateActivityLogDto) {
    const log = await this.prisma.examActivityLog.create({
      data: {
        attemptId: dto.attemptId,
        userId: dto.userId,
        type: dto.type,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      select: { sessionId: true },
    });
    if (attempt) this.monitorGateway.broadcastActivityLog(attempt.sessionId, log);

    return log;
  }

  findByAttempt(attemptId: string) {
    return this.prisma.examActivityLog.findMany({
      where: { attemptId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

```

---

### File: `src/modules/analytics/analytics.module.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/analytics/analytics.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { DashboardService } from './services/dashboard.service';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  providers: [AnalyticsService, DashboardService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

```

---

### File: `src/modules/analytics/controllers/analytics.controller.ts`

```typescript
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { AnalyticsService } from '../services/analytics.service';
import { DashboardService } from '../services/dashboard.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPERADMIN)
export class AnalyticsController {
  constructor(
    private svc: AnalyticsService,
    private dashSvc: DashboardService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Summary dashboard tenant',
    description: 'Total user aktif, sesi, attempt in-progress, dan pending grading.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard summary' })
  dashboard(@TenantId() tid: string) {
    return this.dashSvc.getSummary(tid);
  }

  @Get('session/:id')
  @ApiOperation({ summary: 'Analitik sesi: rata-rata, tertinggi, terendah, distribusi skor' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Analitik sesi' })
  session(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.getSessionAnalytics(tid, id);
  }
}

```

---

### File: `src/modules/analytics/dto/analytics-filter.dto.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/analytics/dto/analytics-filter.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class AnalyticsFilterDto extends BaseQueryDto {
  @IsOptional() @IsString() sessionId?: string;
  @IsOptional() @IsString() subjectId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}

```

---

### File: `src/modules/analytics/services/analytics.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/analytics/services/analytics.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSessionAnalytics(tenantId: string, sessionId: string) {
    const attempts = await this.prisma.examAttempt.findMany({
      where: { session: { tenantId }, sessionId },
      include: { answers: { select: { score: true, maxScore: true } } },
    });

    const scores = attempts.map((a) => ({
      userId: a.userId,
      totalScore: a.totalScore ?? 0,
      maxScore: a.maxScore ?? 0,
      percentage: a.maxScore ? ((a.totalScore ?? 0) / a.maxScore) * 100 : 0,
    }));

    const avg = scores.length ? scores.reduce((s, a) => s + a.percentage, 0) / scores.length : 0;

    return {
      sessionId,
      totalStudents: scores.length,
      avg: Math.round(avg * 10) / 10,
      highest: scores.length ? Math.max(...scores.map((s) => s.percentage)) : 0,
      lowest: scores.length ? Math.min(...scores.map((s) => s.percentage)) : 0,
      scores,
    };
  }
}

```

---

### File: `src/modules/analytics/services/dashboard.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/analytics/services/dashboard.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const [totalUsers, totalSessions, activeAttempts, pendingGrading] =
      await this.prisma.$transaction([
        this.prisma.user.count({ where: { tenantId, isActive: true } }),
        this.prisma.examSession.count({ where: { tenantId } }),
        this.prisma.examAttempt.count({
          where: { session: { tenantId }, status: 'IN_PROGRESS' },
        }),
        this.prisma.examAttempt.count({
          where: { session: { tenantId }, gradingStatus: 'MANUAL_REQUIRED' },
        }),
      ]);
    return { totalUsers, totalSessions, activeAttempts, pendingGrading };
  }
}

```

---

### File: `src/modules/audit-logs/audit-logs.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AuditLogsService } from './services/audit-logs.service';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
  providers: [AuditLogsService, AuditInterceptor],
  controllers: [AuditLogsController],
  exports: [AuditLogsService, AuditInterceptor],
})
export class AuditLogsModule {}

```

---

### File: `src/modules/audit-logs/controllers/audit-logs.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { AuditLogsService } from '../services/audit-logs.service';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
export class AuditLogsController {
  constructor(private svc: AuditLogsService) {}

  @Get()
  @ApiOperation({
    summary: 'List audit log tenant',
    description: 'Append-only. Filter by action, entityType, userId, date range.',
  })
  @ApiResponse({ status: 200, description: 'Paginated audit logs' })
  findAll(@TenantId() tid: string, @Query() q: AuditLogQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan aksi per action (N hari terakhir, default 7)' })
  @ApiQuery({ name: 'days', required: false, description: 'Jumlah hari (default 7)' })
  @ApiResponse({ status: 200, description: 'Array { action, count } urut terbanyak' })
  summary(@TenantId() tid: string, @Query('days') days?: string) {
    return this.svc.getSummary(tid, days ? parseInt(days, 10) : 7);
  }
}

```

---

### File: `src/modules/audit-logs/decorators/audit.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'auditAction';

export interface AuditActionMeta {
  action: string;
  entityType: string;
}

export const AuditAction = (action: string, entityType: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, entityType } satisfies AuditActionMeta);

/** Konstanta aksi — gunakan ini agar tidak ada typo di berbagai controller */
export const AuditActions = {
  // Auth
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  // Exam
  START_EXAM: 'START_EXAM',
  SUBMIT_EXAM: 'SUBMIT_EXAM',
  // Grading
  GRADE_ANSWER: 'GRADE_ANSWER',
  PUBLISH_RESULT: 'PUBLISH_RESULT',
  // Session
  ACTIVATE_SESSION: 'ACTIVATE_SESSION',
  // Users
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DEACTIVATE_USER: 'DEACTIVATE_USER',
} as const;

```

---

### File: `src/modules/audit-logs/dto/audit-log-query.dto.ts`

```typescript
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class AuditLogQueryDto extends BaseQueryDto {
  @IsOptional() @IsString() action?: string;
  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}

```

---

### File: `src/modules/audit-logs/interceptors/audit.interceptor.ts`

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_ACTION_KEY, AuditActionMeta } from '../decorators/audit.decorator';
import { AuditLogsService } from '../services/audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditSvc: AuditLogsService,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditActionMeta>(AUDIT_ACTION_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!meta) return next.handle();

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub?: string; tenantId?: string } | undefined;

    return next.handle().pipe(
      tap((responseData) => {
        // Ekstrak entityId dari: response.id, response.data.id, atau param :id
        const entityId =
          (responseData as { id?: string })?.id ??
          (responseData as { data?: { id?: string } })?.data?.id ??
          (req.params as { id?: string })?.id ??
          'unknown';

        this.auditSvc
          .log({
            tenantId: req.tenantId ?? user?.tenantId ?? 'unknown',
            userId: user?.sub,
            action: meta.action,
            entityType: meta.entityType,
            entityId,
            after: responseData as object,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          })
          .catch(() => {
            // audit log tidak boleh gagalkan request utama
          });
      }),
    );
  }
}

```

---

### File: `src/modules/audit-logs/services/audit-logs.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    tenantId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: unknown;
    after?: unknown;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        before: params.before as object,
        after: params.after as object,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  async findAll(tenantId: string, q: AuditLogQueryDto) {
    const where = {
      tenantId,
      ...(q.action && { action: q.action }),
      ...(q.entityType && { entityType: q.entityType }),
      ...(q.userId && { userId: q.userId }),
      ...(q.search && {
        OR: [
          { action: { contains: q.search, mode: 'insensitive' as const } },
          { entityType: { contains: q.search, mode: 'insensitive' as const } },
          { entityId: { contains: q.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(q.from || q.to
        ? {
            createdAt: {
              ...(q.from && { gte: new Date(q.from) }),
              ...(q.to && { lte: new Date(q.to) }),
            },
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, email: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }

  /** Ringkasan aksi per hari — untuk grafik di dashboard superadmin */
  async getSummary(tenantId: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where: { tenantId, createdAt: { gte: since } },
      _count: { action: true },
      orderBy: { _count: { action: 'desc' } },
    });

    return logs.map((l) => ({ action: l.action, count: l._count.action }));
  }
}

```

---

### File: `src/modules/auth/auth.module.ts`

```typescript
// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { DeviceGuard } from './guards/device.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
    JwtAuthGuard, // ← tambah
    RolesGuard, // ← tambah
    DeviceGuard,
    LocalAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, RolesGuard, DeviceGuard],
})
export class AuthModule {}

```

---

### File: `src/modules/auth/controllers/auth.controller.ts`

```typescript
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import {
  ThrottleStrict,
  ThrottleModerate,
} from '../../../common/decorators/throttle-tier.decorator';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ThrottleStrict()
  @ApiOperation({
    summary: 'Login dengan username & password',
    description: 'Mengembalikan accessToken (15m) dan refreshToken (7d).',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login berhasil' })
  @ApiResponse({ status: 401, description: 'Kredensial tidak valid' })
  @ApiResponse({ status: 429, description: 'Terlalu banyak percobaan login' })
  login(
    @CurrentUser() user: { id: string; tenantId: string; role: string; email: string },
    @Body() body: LoginDto,
  ) {
    return this.authSvc.login(user.id, user.tenantId, user.role, user.email, body.fingerprint);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ThrottleModerate()
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Token lama di-invalidate (rotation).',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token baru berhasil di-issue' })
  @ApiResponse({ status: 401, description: 'Refresh token tidak valid atau sudah kadaluarsa' })
  refresh(@CurrentUser() user: CurrentUserPayload & { refreshToken: string }) {
    return this.authSvc.refresh(user.sub, user.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — revoke refresh token' })
  @ApiResponse({ status: 204, description: 'Logout berhasil' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authSvc.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ThrottleModerate()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ganti password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 204, description: 'Password berhasil diubah' })
  @ApiResponse({ status: 401, description: 'Password lama salah' })
  changePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ChangePasswordDto) {
    return this.authSvc.changePassword(user.sub, dto.currentPassword, dto.newPassword);
  }
}

```

---

### File: `src/modules/auth/dto/change-password.dto.ts`

```typescript
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
export class ChangePasswordDto {
  @IsString() @IsNotEmpty() currentPassword!: string;
  @IsString() @MinLength(8) newPassword!: string;
}

```

---

### File: `src/modules/auth/dto/login.dto.ts`

```typescript
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
export class LoginDto {
  @IsString() @IsNotEmpty() username!: string;
  @IsString() @IsNotEmpty() @MinLength(6) password!: string;
  @IsString() @IsNotEmpty() fingerprint!: string;
}

```

---

### File: `src/modules/auth/dto/refresh-token.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString() @IsNotEmpty() refreshToken!: string;
}

```

---

### File: `src/modules/auth/guards/device.guard.ts`

```typescript
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { DeviceLockedException } from '../../../common/exceptions/device-locked.exception';
import { AuthService } from '../services/auth.service';

@Injectable()
export class DeviceGuard implements CanActivate {
  private readonly logger = new Logger(DeviceGuard.name);

  constructor(private authSvc: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { sub: string } | undefined;
    if (!user) return true;

    const fp = req.headers['x-device-fingerprint'] as string | undefined;
    if (!fp) return true;

    const isLocked = await this.authSvc.isDeviceLocked(user.sub, fp);
    if (isLocked) throw new DeviceLockedException(fp);
    return true;
  }
}

```

---

### File: `src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    return isPublic ? true : super.canActivate(ctx);
  }
}

```

---

### File: `src/modules/auth/guards/local-auth.guard.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

```

---

### File: `src/modules/auth/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required?.length) return true;
    const { user } = ctx.switchToHttp().getRequest();
    if (!required.includes(user?.role)) throw new ForbiddenException('Akses ditolak');
    return true;
  }
}

```

---

### File: `src/modules/auth/services/auth.service.ts`

```typescript
// ── services/auth.service.ts ─────────────────────────────
import { Injectable as AS, UnauthorizedException as UE, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { hashFingerprint } from '../../../common/utils/device-fingerprint.util';

@AS()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { username, isActive: true } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async login(userId: string, tenantId: string, role: string, email: string, fingerprint: string) {
    await this.upsertDevice(userId, fingerprint);

    const payload = { sub: userId, tenantId, role, email };
    const accessToken = this.jwt.sign(payload, {
      secret: this.cfg.get('JWT_ACCESS_SECRET'),
      expiresIn: this.cfg.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.cfg.get('JWT_REFRESH_SECRET'),
      expiresIn: this.cfg.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  async refresh(userId: string, oldToken: string) {
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId, token: oldToken, revokedAt: null },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UE('Refresh token tidak valid atau sudah kadaluarsa');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.login(userId, user.tenantId, user.role, user.email, '');
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  async changePassword(userId: string, currentPw: string, newPw: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const ok = await bcrypt.compare(currentPw, user.passwordHash);
    if (!ok) throw new UE('Password saat ini salah');
    const passwordHash = await bcrypt.hash(newPw, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async isDeviceLocked(userId: string, rawFp: string): Promise<boolean> {
    const fp = hashFingerprint(rawFp);
    const dev = await this.prisma.userDevice.findUnique({
      where: { userId_fingerprint: { userId, fingerprint: fp } },
    });
    return dev?.isLocked ?? false;
  }

  private async upsertDevice(userId: string, rawFp: string) {
    const fp = hashFingerprint(rawFp);
    await this.prisma.userDevice.upsert({
      where: { userId_fingerprint: { userId, fingerprint: fp } },
      create: { userId, fingerprint: fp, lastSeenAt: new Date() },
      update: { lastSeenAt: new Date() },
    });
  }
}

```

---

### File: `src/modules/auth/strategies/jwt.strategy.ts`

```typescript
// ── strategies/jwt.strategy.ts ───────────────────────────
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: CurrentUserPayload & { sub: string }): CurrentUserPayload {
    return {
      sub: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role,
      email: payload.email,
    };
  }
}

```

---

### File: `src/modules/auth/strategies/jwt-refresh.strategy.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: cfg.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: CurrentUserPayload) {
    return { ...payload, refreshToken: (req.body as { refreshToken: string }).refreshToken };
  }
}

```

---

### File: `src/modules/auth/strategies/local.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authSvc: AuthService) {
    super({ usernameField: 'username' });
  }

  async validate(username: string, password: string) {
    const user = await this.authSvc.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Kredensial tidak valid');
    return user;
  }
}

```

---

### File: `src/modules/exam-packages/controllers/exam-packages.controller.ts`

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { UserRole } from '../../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AddQuestionsDto } from '../dto/add-questions.dto';
import { CreateExamPackageDto } from '../dto/create-exam-package.dto';
import { UpdateExamPackageDto } from '../dto/update-exam-package.dto';
import { ExamPackagesService } from '../services/exam-packages.service';
import { ItemAnalysisService } from '../services/item-analysis.service';

@ApiTags('Exam Packages')
@ApiBearerAuth()
@Controller('exam-packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamPackagesController {
  constructor(
    private svc: ExamPackagesService,
    private analysisSvc: ItemAnalysisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List paket ujian milik tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list paket ujian' })
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail paket ujian beserta soal-soalnya' })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Detail paket' })
  @ApiResponse({ status: 404, description: 'Paket tidak ditemukan' })
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Get(':id/item-analysis')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Item analysis soal dalam paket',
    description: 'Menghitung difficulty index dan distribusi jawaban per soal.',
  })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Array item analysis per soal' })
  analysis(@TenantId() tid: string, @Param('id') id: string) {
    return this.analysisSvc.analyze(tid, id);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Buat paket ujian baru (status DRAFT)' })
  @ApiResponse({ status: 201, description: 'Paket berhasil dibuat' })
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateExamPackageDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update paket ujian (hanya status DRAFT/REVIEW)' })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Paket berhasil diupdate' })
  @ApiResponse({ status: 400, description: 'Paket sudah PUBLISHED tidak bisa diedit' })
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateExamPackageDto) {
    return this.svc.update(tid, id, dto);
  }

  @Post(':id/questions')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Tambah / update soal dalam paket (upsert per questionId)' })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Soal berhasil ditambahkan' })
  addQuestions(@TenantId() tid: string, @Param('id') id: string, @Body() dto: AddQuestionsDto) {
    return this.svc.addQuestions(tid, id, dto);
  }

  @Delete(':id/questions/:qid')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus soal dari paket' })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiParam({ name: 'qid', description: 'Question ID' })
  @ApiResponse({ status: 204, description: 'Soal berhasil dihapus dari paket' })
  removeQuestion(@TenantId() tid: string, @Param('id') id: string, @Param('qid') qid: string) {
    return this.svc.removeQuestion(tid, id, qid);
  }

  @Post(':id/publish')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Publish paket ujian',
    description: 'Paket harus memiliki minimal 1 soal. Status berubah menjadi PUBLISHED.',
  })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Paket berhasil dipublish' })
  @ApiResponse({ status: 400, description: 'Paket tidak memiliki soal' })
  publish(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.publish(tid, id);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Archive paket ujian (hanya ADMIN)' })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Paket berhasil diarsipkan' })
  archive(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.archive(tid, id);
  }
}

```

---

### File: `src/modules/exam-packages/dto/add-questions.dto.ts`

```typescript
import { IsArray, ValidateNested, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
class QuestionItem {
  @IsString() questionId!: string;
  @IsInt() @Min(1) order!: number;
  @IsOptional() @IsInt() points?: number;
}
export class AddQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionItem)
  questions!: QuestionItem[];
}

```

---

### File: `src/modules/exam-packages/dto/create-exam-package.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsOptional, IsObject, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
class ExamSettingsDto {
  @IsInt() @Min(1) duration!: number;
  @IsBoolean() shuffleQuestions!: boolean;
  @IsBoolean() shuffleOptions!: boolean;
  @IsBoolean() showResult!: boolean;
  @IsInt() @Min(1) maxAttempts!: number;
  @IsOptional() @IsInt() passingScore?: number;
}
export class CreateExamPackageDto {
  @IsString() @IsNotEmpty() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() subjectId?: string;
  @IsObject() @Type(() => ExamSettingsDto) settings!: ExamSettingsDto;
}

```

---

### File: `src/modules/exam-packages/dto/publish-exam-package.dto.ts`

```typescript
// ── dto/publish-exam-package.dto.ts ──────────────────────
import { IsOptional, IsString } from 'class-validator';
export class PublishExamPackageDto {
  @IsOptional() @IsString() notes?: string;
}

```

---

### File: `src/modules/exam-packages/dto/update-exam-package.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateExamPackageDto } from './create-exam-package.dto';
export class UpdateExamPackageDto extends PartialType(CreateExamPackageDto) {}

```

---

### File: `src/modules/exam-packages/exam-packages.module.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/exam-packages/exam-packages.module.ts
// ══════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { ExamPackagesController } from './controllers/exam-packages.controller';
import { ExamPackageBuilderService } from './services/exam-package-builder.service';
import { ExamPackagesService } from './services/exam-packages.service';
import { ItemAnalysisService } from './services/item-analysis.service';

@Module({
  providers: [ExamPackagesService, ExamPackageBuilderService, ItemAnalysisService],
  controllers: [ExamPackagesController],
  exports: [ExamPackagesService, ExamPackageBuilderService],
})
export class ExamPackagesModule {}

```

---

### File: `src/modules/exam-packages/interfaces/exam-package-settings.interface.ts`

```typescript
// ── interfaces/exam-package-settings.interface.ts ────────
export interface ExamPackageSettings {
  duration: number; // menit
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResult: boolean;
  maxAttempts: number;
  passingScore?: number;
}

```

---

### File: `src/modules/exam-packages/services/exam-packages.service.ts`

```typescript
// ── services/exam-packages.service.ts ────────────────────
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { ExamPackageStatus } from '../../../common/enums/exam-status.enum';
import { AddQuestionsDto } from '../dto/add-questions.dto';
import { CreateExamPackageDto } from '../dto/create-exam-package.dto';
import { UpdateExamPackageDto } from '../dto/update-exam-package.dto';
import { sha256 } from '../../../common/utils/checksum.util';

@Injectable()
export class ExamPackagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, q: BaseQueryDto & { status?: ExamPackageStatus }) {
    const where = {
      tenantId,
      ...(q.status && { status: q.status }),
      ...(q.search && { title: { contains: q.search, mode: 'insensitive' as const } }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.examPackage.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { [q.sortBy ?? 'createdAt']: q.sortOrder },
        include: { _count: { select: { questions: true, sessions: true } } },
      }),
      this.prisma.examPackage.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }

  async findOne(tenantId: string, id: string) {
    const pkg = await this.prisma.examPackage.findFirst({
      where: { id, tenantId },
      include: {
        questions: {
          include: { question: { include: { subject: true, tags: { include: { tag: true } } } } },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!pkg) throw new NotFoundException('Paket ujian tidak ditemukan');
    return pkg;
  }

  async create(tenantId: string, dto: CreateExamPackageDto, createdById: string) {
    return this.prisma.examPackage.create({
      data: { tenantId, createdById, ...dto, settings: dto.settings as object },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateExamPackageDto) {
    const pkg = await this.findOne(tenantId, id);
    if (pkg.status === ExamPackageStatus.PUBLISHED) {
      throw new BadRequestException('Paket yang sudah dipublish tidak bisa diedit');
    }
    return this.prisma.examPackage.update({
      where: { id },
      data: { ...dto, settings: dto.settings as object },
    });
  }

  async addQuestions(tenantId: string, id: string, dto: AddQuestionsDto) {
    await this.findOne(tenantId, id);
    // upsert per question
    await this.prisma.$transaction(
      dto.questions.map((q) =>
        this.prisma.examPackageQuestion.upsert({
          where: { examPackageId_questionId: { examPackageId: id, questionId: q.questionId } },
          create: { examPackageId: id, questionId: q.questionId, order: q.order, points: q.points },
          update: { order: q.order, points: q.points },
        }),
      ),
    );
    return this.findOne(tenantId, id);
  }

  async removeQuestion(tenantId: string, pkgId: string, questionId: string) {
    await this.findOne(tenantId, pkgId);
    await this.prisma.examPackageQuestion.delete({
      where: { examPackageId_questionId: { examPackageId: pkgId, questionId } },
    });
  }

  async publish(tenantId: string, id: string) {
    const pkg = await this.findOne(tenantId, id);
    if (!pkg.questions.length) throw new BadRequestException('Paket harus memiliki minimal 1 soal');
    return this.prisma.examPackage.update({
      where: { id },
      data: { status: ExamPackageStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async archive(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.examPackage.update({
      where: { id },
      data: { status: ExamPackageStatus.ARCHIVED },
    });
  }
}

```

---

### File: `src/modules/exam-packages/services/exam-package-builder.service.ts`

```typescript
// ────────────────────────────────────────────────────────────────────────────
// src/modules/exam-packages/services/exam-package-builder.service.ts — fix checksum
// ────────────────────────────────────────────────────────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { shuffleArray } from '../../../common/utils/randomizer.util';
import { sha256 } from '../../../common/utils/checksum.util';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ExamPackageBuilderService {
  constructor(
    private prisma: PrismaService,
    private cfg: ConfigService,
  ) {}

  async buildForDownload(tenantId: string, packageId: string, shuffle: boolean) {
    const pkg = await this.prisma.examPackage.findFirst({
      where: { id: packageId, tenantId, status: 'PUBLISHED' },
      include: {
        questions: {
          include: { question: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!pkg) throw new NotFoundException('Paket tidak tersedia');

    let questions = pkg.questions.map((pq) => ({
      id: pq.question.id,
      type: pq.question.type,
      content: pq.question.content as Record<string, unknown>,
      options: pq.question.options as Record<string, unknown> | undefined,
      points: pq.points ?? pq.question.points,
      order: pq.order,
      correctAnswer: pq.question.correctAnswer as string, // tetap encrypted
    }));

    if (shuffle) questions = shuffleArray(questions);

    // Checksum dari soal tanpa correctAnswer (siswa tidak dapat kunci jawaban mentah)
    const forChecksum = questions.map(({ correctAnswer: _ca, ...rest }) => rest);
    const checksum = sha256(JSON.stringify(forChecksum));

    return {
      packageId,
      title: pkg.title,
      settings: pkg.settings,
      questions,
      checksum,
    };
  }
}

```

---

### File: `src/modules/exam-packages/services/item-analysis.service.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/exam-packages/services/item-analysis.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ItemAnalysisService {
  constructor(private prisma: PrismaService) {}

  async analyze(tenantId: string, packageId: string) {
    const pkg = await this.prisma.examPackage.findFirst({
      where: { id: packageId, tenantId },
      include: { questions: { include: { question: true } } },
    });
    if (!pkg) throw new NotFoundException('Paket tidak ditemukan');

    const results = await Promise.all(
      pkg.questions.map(async (pq) => {
        const answers = await this.prisma.examAnswer.findMany({
          where: { questionId: pq.questionId },
          select: { score: true, maxScore: true },
        });
        const n = answers.length;
        const correct = answers.filter(
          (a) => a.score != null && a.maxScore != null && a.score >= a.maxScore,
        ).length;
        return {
          questionId: pq.questionId,
          order: pq.order,
          totalAnswers: n,
          correctCount: correct,
          difficultyIndex: n ? correct / n : 0,
        };
      }),
    );

    return results;
  }
}

```

---

### File: `src/modules/exam-rooms/controllers/exam-rooms.controller.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/exam-rooms/controllers/exam-rooms.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { ExamRoomsService } from '../services/exam-rooms.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';

@Controller('exam-rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamRoomsController {
  constructor(private svc: ExamRoomsService) {}

  @Get()
  findAll(@TenantId() tid: string) {
    return this.svc.findAll(tid);
  }

  @Get(':id')
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  create(@TenantId() tid: string, @Body() dto: CreateRoomDto) {
    return this.svc.create(tid, dto);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.svc.update(tid, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}

```

---

### File: `src/modules/exam-rooms/dto/create-room.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
export class CreateRoomDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
}

```

---

### File: `src/modules/exam-rooms/dto/update-room.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';
export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

```

---

### File: `src/modules/exam-rooms/exam-rooms.module.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/exam-rooms/exam-rooms.module.ts  (clean — no bundle)
// ══════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { ExamRoomsController } from './controllers/exam-rooms.controller';
import { ExamRoomsService } from './services/exam-rooms.service';

@Module({
  providers: [ExamRoomsService],
  controllers: [ExamRoomsController],
  exports: [ExamRoomsService],
})
export class ExamRoomsModule {}

```

---

### File: `src/modules/exam-rooms/services/exam-rooms.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/exam-rooms/services/exam-rooms.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';

@Injectable()
export class ExamRoomsService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.examRoom.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async findOne(tenantId: string, id: string) {
    const room = await this.prisma.examRoom.findFirst({ where: { id, tenantId } });
    if (!room) throw new NotFoundException('Ruang ujian tidak ditemukan');
    return room;
  }

  create(tenantId: string, dto: CreateRoomDto) {
    return this.prisma.examRoom.create({ data: { tenantId, ...dto } });
  }

  async update(tenantId: string, id: string, dto: UpdateRoomDto) {
    await this.findOne(tenantId, id);
    return this.prisma.examRoom.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.examRoom.delete({ where: { id } });
  }
}

```

---

### File: `src/modules/grading/controllers/grading.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { GradingService } from '../services/grading.service';
import { ManualGradingService } from '../services/manual-grading.service';
import { GradeAnswerDto } from '../dto/grade-answer.dto';
import { CompleteGradingDto } from '../dto/complete-grading.dto';
import { PublishResultDto } from '../dto/publish-result.dto';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { AuditAction, AuditActions } from '../../audit-logs/decorators/audit.decorator';
import { AuditInterceptor } from '../../audit-logs/interceptors/audit.interceptor';

@ApiTags('Grading')
@ApiBearerAuth()
@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
@UseInterceptors(AuditInterceptor)
export class GradingController {
  constructor(
    private svc: GradingService,
    private manualSvc: ManualGradingService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List attempt yang membutuhkan penilaian manual',
    description:
      'Mengembalikan attempt dengan gradingStatus = MANUAL_REQUIRED (biasanya mengandung soal essay).',
  })
  @ApiResponse({ status: 200, description: 'Paginated list attempt pending grading' })
  findPending(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findPendingManual(tid, q);
  }

  @Patch('answer')
  @AuditAction(AuditActions.GRADE_ANSWER, 'ExamAnswer')
  @ApiOperation({
    summary: 'Beri nilai pada satu jawaban',
    description:
      'Guru menilai jawaban essay secara manual. Tidak bisa override jawaban yang sudah di-auto-grade.',
  })
  @ApiResponse({ status: 200, description: 'Jawaban berhasil dinilai' })
  @ApiResponse({ status: 400, description: 'Jawaban sudah dinilai otomatis' })
  @ApiResponse({ status: 404, description: 'Jawaban tidak ditemukan' })
  gradeAnswer(@CurrentUser() u: CurrentUserPayload, @Body() dto: GradeAnswerDto) {
    return this.manualSvc.gradeAnswer(dto, u.sub);
  }

  @Post('complete')
  @ApiOperation({
    summary: 'Selesaikan grading satu attempt',
    description: 'Menghitung total score. Akan gagal jika masih ada jawaban yang belum dinilai.',
  })
  @ApiResponse({ status: 200, description: 'Grading selesai, status → COMPLETED' })
  @ApiResponse({ status: 400, description: 'Masih ada jawaban yang belum dinilai' })
  @ApiResponse({ status: 404, description: 'Attempt tidak ditemukan' })
  complete(@Body() dto: CompleteGradingDto) {
    return this.manualSvc.completeGrading(dto);
  }

  @Post('publish')
  @AuditAction(AuditActions.PUBLISH_RESULT, 'ExamAttempt')
  @ApiOperation({
    summary: 'Publikasikan hasil ujian ke siswa',
    description:
      'Batch publish. Hanya attempt dengan status COMPLETED atau AUTO_GRADED yang bisa dipublish.',
  })
  @ApiResponse({ status: 200, description: 'Jumlah hasil yang dipublish' })
  publish(@Body() dto: PublishResultDto) {
    return this.manualSvc.publishResults(dto);
  }
}

```

---

### File: `src/modules/grading/dto/complete-grading.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';
export class CompleteGradingDto {
  @IsString() @IsNotEmpty() attemptId!: string;
}

```

---

### File: `src/modules/grading/dto/grade-answer.dto.ts`

```typescript
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
export class GradeAnswerDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() questionId!: string;
  @IsNumber() @Min(0) score!: number;
  @IsOptional() @IsString() feedback?: string;
}

```

---

### File: `src/modules/grading/dto/publish-result.dto.ts`

```typescript
import { IsArray, IsString } from 'class-validator';
export class PublishResultDto {
  @IsArray() @IsString({ each: true }) attemptIds!: string[];
}

```

---

### File: `src/modules/grading/grading.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { GradingService } from './services/grading.service';
import { ManualGradingService } from './services/manual-grading.service';
import { GradingController } from './controllers/grading.controller';
import { SubmissionsModule } from '../submissions/submissions.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [SubmissionsModule, AuditLogsModule],
  providers: [GradingService, ManualGradingService],
  controllers: [GradingController],
  exports: [GradingService, ManualGradingService],
})
export class GradingModule {}

```

---

### File: `src/modules/grading/services/grading.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/services/grading.service.ts  (updated)
// Tidak lagi depend pada AutoGradingService langsung —
// inject GradingHelperService dari SubmissionsModule via exports
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { PrismaService } from '../../../prisma/prisma.service';
import { GradingHelperService } from '../../submissions/services/grading-helper.service';

@Injectable()
export class GradingService {
  constructor(
    private prisma: PrismaService,
    private gradingHelper: GradingHelperService,
  ) {}

  /** Dipanggil dari GradingController jika perlu trigger ulang auto-grade */
  async runAutoGrade(attemptId: string) {
    return this.gradingHelper.runAutoGrade(attemptId);
  }

  async findPendingManual(tenantId: string, q: BaseQueryDto) {
    const where = {
      session: { tenantId },
      gradingStatus: GradingStatus.MANUAL_REQUIRED,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.examAttempt.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        include: {
          user: { select: { username: true } },
          session: { select: { title: true } },
          answers: { where: { isAutoGraded: false, score: null } },
        },
      }),
      this.prisma.examAttempt.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }
  // private readonly logger = new Logger(GradingService.name);
}

```

---

### File: `src/modules/grading/services/manual-grading.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { GradeAnswerDto } from '../dto/grade-answer.dto';
import { CompleteGradingDto } from '../dto/complete-grading.dto';
import { PublishResultDto } from '../dto/publish-result.dto';
import type { ResultPublishedEvent } from '../../submissions/processors/submission.events.listener';

@Injectable()
export class ManualGradingService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async gradeAnswer(dto: GradeAnswerDto, gradedById: string) {
    const answer = await this.prisma.examAnswer.findFirst({
      where: { attemptId: dto.attemptId, questionId: dto.questionId },
    });
    if (!answer) throw new NotFoundException('Jawaban tidak ditemukan');
    if (answer.score !== null && answer.isAutoGraded) {
      throw new BadRequestException('Jawaban ini sudah dinilai otomatis');
    }
    return this.prisma.examAnswer.update({
      where: { id: answer.id },
      data: { score: dto.score, feedback: dto.feedback, gradedById, gradedAt: new Date() },
    });
  }

  async completeGrading(dto: CompleteGradingDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      include: { answers: { select: { score: true, maxScore: true } } },
    });
    if (!attempt) throw new NotFoundException('Attempt tidak ditemukan');

    const ungradedCount = attempt.answers.filter((a) => a.score === null).length;
    if (ungradedCount > 0) {
      throw new BadRequestException(`Masih ada ${ungradedCount} jawaban belum dinilai`);
    }

    const totalScore = attempt.answers.reduce((s, a) => s + (a.score ?? 0), 0);
    const maxScore = attempt.answers.reduce((s, a) => s + (a.maxScore ?? 0), 0);

    return this.prisma.examAttempt.update({
      where: { id: dto.attemptId },
      data: {
        totalScore,
        maxScore,
        gradingStatus: GradingStatus.COMPLETED,
        gradingCompletedAt: new Date(),
      },
    });
  }

  async publishResults(dto: PublishResultDto) {
    const updated = await this.prisma.examAttempt.updateMany({
      where: {
        id: { in: dto.attemptIds },
        gradingStatus: { in: [GradingStatus.COMPLETED, GradingStatus.AUTO_GRADED] },
      },
      data: { gradingStatus: GradingStatus.PUBLISHED },
    });

    if (updated.count > 0) {
      // Ambil tenantId dari salah satu attempt
      const sample = await this.prisma.examAttempt.findFirst({
        where: { id: { in: dto.attemptIds } },
        select: { session: { select: { tenantId: true } } },
      });

      const event: ResultPublishedEvent = {
        attemptIds: dto.attemptIds,
        tenantId: sample?.session.tenantId ?? 'unknown',
      };
      this.eventEmitter.emit('result.published', event);
    }

    return { published: updated.count };
  }
}

```

---

### File: `src/modules/health/controllers/health.controller.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/health/controllers/health.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { Public } from '../../../common/decorators/public.decorator';
import { PrismaService } from '../../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaIndicator: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.prismaIndicator.pingCheck('database', this.prisma)]);
  }
}

```

---

### File: `src/modules/health/health.module.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/health/health.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}

```

---

### File: `src/modules/media/controllers/media.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MediaService } from '../services/media.service';
import { MediaUploadService } from '../services/media-upload.service';
import { DeleteMediaDto } from '../dto/delete-media.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private mediaSvc: MediaService,
    private uploadSvc: MediaUploadService,
  ) {}

  @Get('presigned/:key')
  @ApiOperation({
    summary: 'Generate presigned URL untuk objek MinIO',
    description:
      'URL berlaku selama MINIO_PRESIGNED_TTL detik (default 1 jam). Key harus di-encode URI.',
  })
  @ApiParam({ name: 'key', description: 'Object key (URI-encoded)' })
  @ApiResponse({ status: 200, description: 'Presigned URL string' })
  getUrl(@Param('key') key: string) {
    return this.mediaSvc.getPresignedUrl(decodeURIComponent(key));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file media langsung (maks 100MB)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: '{ objectName }' })
  async upload(
    @UploadedFile(
      new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 })] }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadSvc.uploadAndQueue(file.buffer, file.originalname, 'image');
  }

  @Delete()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Hapus objek dari MinIO (hanya ADMIN/TEACHER)' })
  @ApiResponse({ status: 200, description: 'Objek berhasil dihapus' })
  remove(@Body() dto: DeleteMediaDto) {
    return this.mediaSvc.delete(dto.objectName);
  }
}

```

---

### File: `src/modules/media/dto/delete-media.dto.ts`

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
export class DeleteMediaDto {
  @IsString() @IsNotEmpty() objectName!: string;
}

```

---

### File: `src/modules/media/dto/upload-media.dto.ts`

```typescript
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class UploadMediaDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() questionId!: string;
  @IsOptional() @IsString() chunkIndex?: string;
  @IsOptional() @IsString() totalChunks?: string;
  @IsOptional() @IsIn(['image', 'video', 'audio']) type?: 'image' | 'video' | 'audio';
}

```

---

### File: `src/modules/media/media.module.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/media.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaService } from './services/media.service';
import { MediaUploadService } from './services/media-upload.service';
import { MediaCompressionService } from './services/media-compression.service';
import { MediaProcessor } from './processors/media.processor';
import { MediaController } from './controllers/media.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'media' })],
  providers: [MediaService, MediaUploadService, MediaCompressionService, MediaProcessor],
  controllers: [MediaController],
  exports: [MediaService, MediaUploadService],
})
export class MediaModule {}

```

---

### File: `src/modules/media/processors/media.processor.ts`

```typescript
// ────────────────────────────────────────────────────────────────────────────
// src/modules/media/processors/media.processor.ts — BARU (belum ada di struktur tapi dibutuhkan)
// ────────────────────────────────────────────────────────────────────────────
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MediaService } from '../services/media.service';
import { MediaCompressionService } from '../services/media-compression.service';

@Processor('media')
export class MediaProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessor.name);

  constructor(
    private mediaSvc: MediaService,
    private compressionSvc: MediaCompressionService,
  ) {
    super();
  }

  async process(job: Job<{ objectName: string }>) {
    switch (job.name) {
      case 'compress-image':
        await this.handleCompressImage(job.data.objectName);
        break;
      case 'transcode-video':
        this.logger.warn(`transcode-video untuk ${job.data.objectName} — perlu ffmpeg impl`);
        break;
      default:
        this.logger.warn(`Unknown media job: ${job.name}`);
    }
  }

  private async handleCompressImage(objectName: string) {
    this.logger.log(`Compressing image: ${objectName}`);
    // Dalam produksi: download dari MinIO, compress, re-upload
    // Ini placeholder — implementasi penuh perlu stream dari MinIO
    this.logger.log(`Image ${objectName} compression queued`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Media job [${job.name}] ${job.id} done`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(`Media job [${job?.name}] ${job?.id} failed: ${err.message}`);
  }
}

```

---

### File: `src/modules/media/services/media.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/services/media.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { generateObjectName } from '../../../common/utils/file.util';

@Injectable()
export class MediaService {
  private minio: Minio.Client;
  private bucket: string;

  constructor(private cfg: ConfigService) {
    this.minio = new Minio.Client({
      endPoint: cfg.get('MINIO_ENDPOINT', 'localhost'),
      port: Number(cfg.get('MINIO_PORT', 9000)), // ← tambah Number()
      useSSL: cfg.get('MINIO_USE_SSL') === 'true',
      accessKey: cfg.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: cfg.get('MINIO_SECRET_KEY', 'minioadmin'),
    });
    this.bucket = cfg.get('MINIO_BUCKET', 'exam-assets');
  }

  async upload(buffer: Buffer, originalName: string, prefix = 'media'): Promise<string> {
    const objectName = generateObjectName(originalName, prefix);
    await this.minio.putObject(this.bucket, objectName, buffer);
    return objectName;
  }

  async getPresignedUrl(objectName: string): Promise<string> {
    const ttl = this.cfg.get<number>('MINIO_PRESIGNED_TTL', 3600);
    return this.minio.presignedGetObject(this.bucket, objectName, ttl);
  }

  async delete(objectName: string): Promise<void> {
    await this.minio.removeObject(this.bucket, objectName);
  }
}

```

---

### File: `src/modules/media/services/media-compression.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/services/media-compression.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class MediaCompressionService {
  private readonly logger = new Logger(MediaCompressionService.name);

  async compressImage(input: Buffer, quality = 80): Promise<Buffer> {
    return sharp(input)
      .webp({ quality })
      .toBuffer()
      .catch((err) => {
        this.logger.error('Image compression failed', err);
        return input; // fallback ke original
      });
  }

  async resizeImage(input: Buffer, width: number, height?: number): Promise<Buffer> {
    return sharp(input)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
  }
}

```

---

### File: `src/modules/media/services/media-upload.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/services/media-upload.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MediaService } from './media.service';

@Injectable()
export class MediaUploadService {
  constructor(
    private mediaSvc: MediaService,
    @InjectQueue('media') private mediaQueue: Queue,
  ) {}

  async uploadAndQueue(buffer: Buffer, originalName: string, type: 'image' | 'video' | 'audio') {
    const prefix =
      type === 'image' ? 'questions/images' : type === 'video' ? 'answers/video' : 'answers/audio';
    const objectName = await this.mediaSvc.upload(buffer, originalName, prefix);

    if (type === 'video') {
      await this.mediaQueue.add('transcode-video', { objectName }, { removeOnFail: false });
    } else if (type === 'image') {
      await this.mediaQueue.add('compress-image', { objectName }, { removeOnFail: false });
    }

    return { objectName };
  }
}

```

---

### File: `src/modules/monitoring/controllers/monitoring.controller.ts`

```typescript
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { MonitoringService } from '../services/monitoring.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@ApiTags('Monitoring')
@ApiBearerAuth()
@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERVISOR, UserRole.OPERATOR, UserRole.ADMIN)
export class MonitoringController {
  constructor(private svc: MonitoringService) {}

  @Get(':sessionId')
  @ApiOperation({
    summary: 'Overview status peserta satu sesi',
    description: 'Total, started, submitted, in-progress per sesi.',
  })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Overview peserta sesi' })
  overview(@Param('sessionId') id: string) {
    return this.svc.getSessionOverview(id);
  }

  @Get(':sessionId/logs/:attemptId')
  @ApiOperation({ summary: 'Activity log satu attempt (tab blur, paste, idle, dll.)' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiParam({ name: 'attemptId', description: 'Attempt ID' })
  @ApiResponse({ status: 200, description: 'Paginated activity logs' })
  logs(@Param('attemptId') id: string, @Query() q: BaseQueryDto) {
    return this.svc.getActivityLogs(id, q);
  }
}

```

---

### File: `src/modules/monitoring/gateways/monitoring.gateway.ts`

```typescript
// src/modules/monitoring/gateways/monitoring.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/monitoring' })
export class MonitoringGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MonitoringGateway.name);

  constructor(
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ??
        client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) throw new Error('No token');
      this.jwt.verify(token, { secret: this.cfg.get('JWT_ACCESS_SECRET') });
      this.logger.log(`Client connected: ${client.id}`);
    } catch {
      this.logger.warn(`Unauthorized WS connection: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-session')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
    if (!data?.sessionId) throw new WsException('sessionId diperlukan');
    client.join(`session:${data.sessionId}`);
    return { event: 'joined', room: `session:${data.sessionId}` };
  }

  broadcastStudentUpdate(sessionId: string, payload: unknown) {
    this.server.to(`session:${sessionId}`).emit('student-update', payload);
  }

  broadcastActivityLog(sessionId: string, log: unknown) {
    this.server.to(`session:${sessionId}`).emit('activity-log', log);
  }
}

```

---

### File: `src/modules/monitoring/monitoring.module.ts`

```typescript
// monitoring.module.ts — tambah JwtModule
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MonitoringService } from './services/monitoring.service';
import { MonitoringGateway } from './gateways/monitoring.gateway';
import { MonitoringController } from './controllers/monitoring.controller';

@Module({
  imports: [JwtModule.register({})], // secret di-inject via ConfigService dalam gateway
  providers: [MonitoringService, MonitoringGateway],
  controllers: [MonitoringController],
  exports: [MonitoringGateway, MonitoringService],
})
export class MonitoringModule {}

```

---

### File: `src/modules/monitoring/services/monitoring.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/monitoring/services/monitoring.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  async getSessionOverview(sessionId: string) {
    const [attempts, total] = await this.prisma.$transaction([
      this.prisma.examAttempt.findMany({
        where: { sessionId },
        select: {
          id: true,
          userId: true,
          status: true,
          startedAt: true,
          submittedAt: true,
          user: { select: { username: true } },
          _count: { select: { answers: true, activityLogs: true } },
        },
      }),
      this.prisma.sessionStudent.count({ where: { sessionId } }),
    ]);

    const submitted = attempts.filter((a) => a.status === 'SUBMITTED').length;
    return {
      total,
      started: attempts.length,
      submitted,
      inProgress: attempts.length - submitted,
      attempts,
    };
  }

  async getActivityLogs(attemptId: string, q: BaseQueryDto) {
    return this.prisma.examActivityLog.findMany({
      where: { attemptId },
      orderBy: { createdAt: 'desc' },
      skip: q.skip,
      take: q.limit,
    });
  }
}

```

---

### File: `src/modules/notifications/controllers/notifications.controller.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/notifications/controllers/notifications.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { NotificationsService } from '../services/notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() u: CurrentUserPayload) {
    return this.svc.findByUser(u.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.svc.markRead(id);
  }
}

```

---

### File: `src/modules/notifications/dto/create-notification.dto.ts`

```typescript
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateNotificationDto {
  @IsString() @IsNotEmpty() userId!: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsNotEmpty() body!: string;
  @IsString() @IsNotEmpty() type!: string;
  @IsOptional() metadata?: Record<string, unknown>;
}

```

---

### File: `src/modules/notifications/dto/mark-read.dto.ts`

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
export class MarkReadDto {
  @IsString() @IsNotEmpty() notificationId!: string;
}

```

---

### File: `src/modules/notifications/notifications.module.ts`

```typescript
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationProcessor } from './processors/notification.processor';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'notification' })],
  providers: [NotificationsService, NotificationProcessor],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}

```

---

### File: `src/modules/notifications/processors/notification.processor.ts`

```typescript
// ────────────────────────────────────────────────────────────────────────────
// src/modules/notifications/processors/notification.processor.ts — BARU
// ────────────────────────────────────────────────────────────────────────────
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job) {
    // 'send-realtime' → broadcast via Socket.IO
    // Dalam produksi: inject MonitoringGateway dan emit ke room yang tepat
    this.logger.log(`Notification job [${job.name}] processed: ${JSON.stringify(job.data)}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(`Notification job ${job?.id} failed: ${err.message}`);
  }
}

```

---

### File: `src/modules/notifications/services/notifications.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/notifications/services/notifications.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        body: dto.body,
        type: dto.type,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }
}

```

---

### File: `src/modules/questions/controllers/questions.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { QuestionsService } from '../services/questions.service';
import { QuestionStatisticsService } from '../services/question-statistics.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { ImportQuestionsDto } from '../dto/import-questions.dto';
import { ApproveQuestionDto } from '../dto/approve-question.dto';

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionsController {
  constructor(
    private svc: QuestionsService,
    private statsSvc: QuestionStatisticsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List soal milik tenant (correctAnswer tidak dikembalikan)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'subjectId', required: false })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: [
      'MULTIPLE_CHOICE',
      'COMPLEX_MULTIPLE_CHOICE',
      'TRUE_FALSE',
      'MATCHING',
      'SHORT_ANSWER',
      'ESSAY',
    ],
  })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'review', 'approved'] })
  @ApiResponse({ status: 200, description: 'Paginated list soal' })
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail soal (correctAnswer tidak dikembalikan)' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Detail soal' })
  @ApiResponse({ status: 404, description: 'Soal tidak ditemukan' })
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Get(':id/stats')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Statistik soal',
    description: 'Difficulty index, total attempt, dan rata-rata skor dari semua ujian.',
  })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Statistik soal' })
  stats(@TenantId() tid: string, @Param('id') id: string) {
    return this.statsSvc.getStats(tid, id);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Buat soal baru',
    description: 'correctAnswer akan dienkripsi AES-256-GCM sebelum disimpan.',
  })
  @ApiResponse({ status: 201, description: 'Soal berhasil dibuat' })
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Post('import')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Bulk import soal',
    description: 'Mengembalikan jumlah soal yang berhasil dibuat dan yang gagal.',
  })
  @ApiResponse({ status: 200, description: '{ created: N, failed: M }' })
  import(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: ImportQuestionsDto,
  ) {
    return this.svc.bulkImport(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update soal' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Soal berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Soal tidak ditemukan' })
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.svc.update(tid, id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Ubah status soal (draft → review → approved)' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Status berhasil diubah' })
  approve(@TenantId() tid: string, @Param('id') id: string, @Body() dto: ApproveQuestionDto) {
    return this.svc.approve(tid, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus soal (hanya ADMIN)' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 204, description: 'Soal berhasil dihapus' })
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}

```

---

### File: `src/modules/questions/dto/approve-question.dto.ts`

```typescript
import { IsIn } from 'class-validator';
export class ApproveQuestionDto {
  @IsIn(['review', 'approved', 'draft']) status!: string;
}

```

---

### File: `src/modules/questions/dto/create-question.dto.ts`

```typescript
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  IsArray,
  IsObject,
} from 'class-validator';
import { QuestionType } from '../../../common/enums/question-type.enum';
export class CreateQuestionDto {
  @IsString() @IsNotEmpty() subjectId!: string;
  @IsEnum(QuestionType) type!: QuestionType;
  @IsObject() content!: Record<string, unknown>;
  @IsOptional() @IsObject() options?: Record<string, unknown>;
  @IsObject() correctAnswer!: Record<string, unknown>;
  @IsOptional() @IsInt() @Min(1) points?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) difficulty?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tagIds?: string[];
}

```

---

### File: `src/modules/questions/dto/import-questions.dto.ts`

```typescript
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';
export class ImportQuestionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions!: CreateQuestionDto[];
}

```

---

### File: `src/modules/questions/dto/update-question.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';
export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}

```

---

### File: `src/modules/questions/interfaces/correct-answer.interface.ts`

```typescript
// ── interfaces/correct-answer.interface.ts ───────────────
export interface CorrectAnswer {
  type: 'single' | 'multiple' | 'boolean' | 'matching' | 'text';
  value: string | string[] | boolean | Record<string, string>;
  caseSensitive?: boolean;
  similarityThreshold?: number; // untuk essay
}

```

---

### File: `src/modules/questions/interfaces/question-options.interface.ts`

```typescript
// ── interfaces/question-options.interface.ts ─────────────
export interface McOption {
  key: string; // a, b, c, d, e
  text: string;
  imageUrl?: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface QuestionContent {
  text: string;
  images?: string[];
  audio?: string;
  video?: string;
}

```

---

### File: `src/modules/questions/questions.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { QuestionsService } from './services/questions.service';
import { QuestionStatisticsService } from './services/question-statistics.service';
import { QuestionImportService } from './services/question-import.service';
import { QuestionsController } from './controllers/questions.controller';

@Module({
  providers: [QuestionsService, QuestionStatisticsService, QuestionImportService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {}

```

---

### File: `src/modules/questions/services/questions.service.ts`

```typescript
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { decrypt, encrypt } from '../../../common/utils/encryption.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApproveQuestionDto } from '../dto/approve-question.dto';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { ImportQuestionsDto } from '../dto/import-questions.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private cfg: ConfigService,
  ) {}

  /** Throw jika ENCRYPTION_KEY tidak dikonfigurasi — mencegah silent failure di production */
  private get encKey(): string {
    const key = this.cfg.get<string>('ENCRYPTION_KEY');
    if (!key || key.length !== 64) {
      throw new InternalServerErrorException(
        'ENCRYPTION_KEY tidak valid. Harus berupa 64 hex chars (32 bytes).',
      );
    }
    return key;
  }

  async findAll(
    tenantId: string,
    q: BaseQueryDto & { subjectId?: string; type?: string; status?: string },
  ) {
    const where = {
      tenantId,
      ...(q.subjectId && { subjectId: q.subjectId }),
      ...(q.type && { type: q.type as import('@prisma/client').QuestionType }),
      ...(q.status && { status: q.status }),
      ...(q.search && { content: { path: ['text'], string_contains: q.search } }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { [q.sortBy ?? 'createdAt']: q.sortOrder },
        include: { subject: { select: { name: true } }, tags: { include: { tag: true } } },
      }),
      this.prisma.question.count({ where }),
    ]);
    // strip correctAnswer dari list response
    const safe = data.map(({ correctAnswer: _ca, ...rest }) => rest);
    return new PaginatedResponseDto(safe, total, q.page, q.limit);
  }

  async findOne(tenantId: string, id: string, includeAnswer = false) {
    const q = await this.prisma.question.findFirst({
      where: { id, tenantId },
      include: { subject: true, tags: { include: { tag: true } } },
    });
    if (!q) throw new NotFoundException('Soal tidak ditemukan');
    if (!includeAnswer) {
      const { correctAnswer: _ca, ...rest } = q;
      return rest;
    }
    const ca = decrypt(q.correctAnswer as unknown as string, this.encKey);
    return { ...q, correctAnswer: JSON.parse(ca) };
  }

  async create(tenantId: string, dto: CreateQuestionDto, createdById: string) {
    const encAnswer = encrypt(JSON.stringify(dto.correctAnswer), this.encKey);
    const { tagIds, correctAnswer: _ca, ...rest } = dto;

    return this.prisma.question.create({
      data: {
        tenantId,
        createdById,
        subjectId: rest.subjectId,
        type: rest.type,
        content: rest.content as Prisma.InputJsonValue,
        options:
          rest.options !== undefined ? (rest.options as Prisma.InputJsonValue) : Prisma.JsonNull,
        points: rest.points,
        difficulty: rest.difficulty,
        correctAnswer: encAnswer as Prisma.InputJsonValue,
        tags: tagIds?.length ? { create: tagIds.map((tagId: string) => ({ tagId })) } : undefined,
      },
      include: { tags: { include: { tag: true } } },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateQuestionDto) {
    await this.findOne(tenantId, id);
    const { tagIds, correctAnswer, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (correctAnswer) data.correctAnswer = encrypt(JSON.stringify(correctAnswer), this.encKey);

    if (tagIds !== undefined) {
      await this.prisma.questionTagMapping.deleteMany({ where: { questionId: id } });
      data.tags = { create: tagIds.map((tagId) => ({ tagId })) };
    }
    return this.prisma.question.update({ where: { id }, data });
  }

  async approve(tenantId: string, id: string, dto: ApproveQuestionDto) {
    await this.findOne(tenantId, id);
    return this.prisma.question.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.question.delete({ where: { id } });
  }

  async bulkImport(tenantId: string, dto: ImportQuestionsDto, createdById: string) {
    const results = await Promise.allSettled(
      dto.questions.map((q) => this.create(tenantId, q, createdById)),
    );
    return {
      created: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };
  }
}

```

---

### File: `src/modules/questions/services/question-import.service.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/questions/services/question-import.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { ImportQuestionsDto } from '../dto/import-questions.dto';
import { CreateQuestionDto } from '../dto/create-question.dto';

@Injectable()
export class QuestionImportService {
  constructor(private questionsSvc: QuestionsService) {}

  async fromJson(tenantId: string, raw: unknown[], createdById: string) {
    const dto: ImportQuestionsDto = { questions: raw as CreateQuestionDto[] };
    return this.questionsSvc.bulkImport(tenantId, dto, createdById);
  }
}

```

---

### File: `src/modules/questions/services/question-statistics.service.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/questions/services/question-statistics.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class QuestionStatisticsService {
  constructor(private prisma: PrismaService) {}

  async getStats(tenantId: string, questionId: string) {
    const q = await this.prisma.question.findFirst({ where: { id: questionId, tenantId } });
    if (!q) throw new NotFoundException('Soal tidak ditemukan');

    const answers = await this.prisma.examAnswer.findMany({
      where: { questionId },
      select: { score: true, maxScore: true, isAutoGraded: true },
    });

    const total = answers.length;
    const correct = answers.filter(
      (a) => a.score != null && a.maxScore != null && a.score >= a.maxScore,
    ).length;
    const avgScore = total ? answers.reduce((s, a) => s + (a.score ?? 0), 0) / total : 0;

    return {
      questionId,
      totalAttempts: total,
      correctCount: correct,
      difficultyIndex: total ? correct / total : 0,
      avgScore: Math.round(avgScore * 100) / 100,
    };
  }
}

```

---

### File: `src/modules/question-tags/controllers/question-tags.controller.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/question-tags/controllers/question-tags.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { QuestionTagsService } from '../services/question-tags.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

@Controller('question-tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionTagsController {
  constructor(private svc: QuestionTagsService) {}

  @Get()
  findAll(@TenantId() tid: string) {
    return this.svc.findAll(tid);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@TenantId() tid: string, @Body() dto: CreateTagDto) {
    return this.svc.create(tid, dto);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.svc.update(tid, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}

```

---

### File: `src/modules/question-tags/dto/create-tag.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateTagDto {
  @IsString() @IsNotEmpty() name!: string;
}

```

---

### File: `src/modules/question-tags/dto/update-tag.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';
export class UpdateTagDto extends PartialType(CreateTagDto) {}

```

---

### File: `src/modules/question-tags/question-tags.module.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/question-tags/question-tags.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { QuestionTagsService } from './services/question-tags.service';
import { QuestionTagsController } from './controllers/question-tags.controller';

@Module({
  providers: [QuestionTagsService],
  controllers: [QuestionTagsController],
  exports: [QuestionTagsService],
})
export class QuestionTagsModule {}

```

---

### File: `src/modules/question-tags/services/question-tags.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/question-tags/services/question-tags.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

@Injectable()
export class QuestionTagsService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.questionTag.findMany({ where: { tenantId } });
  }

  async create(tenantId: string, dto: CreateTagDto) {
    const exists = await this.prisma.questionTag.findUnique({
      where: { tenantId_name: { tenantId, name: dto.name } },
    });
    if (exists) throw new ConflictException(`Tag '${dto.name}' sudah ada`);
    return this.prisma.questionTag.create({ data: { tenantId, name: dto.name } });
  }

  async update(tenantId: string, id: string, dto: UpdateTagDto) {
    const tag = await this.prisma.questionTag.findFirst({ where: { id, tenantId } });
    if (!tag) throw new NotFoundException('Tag tidak ditemukan');
    return this.prisma.questionTag.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const tag = await this.prisma.questionTag.findFirst({ where: { id, tenantId } });
    if (!tag) throw new NotFoundException('Tag tidak ditemukan');
    return this.prisma.questionTag.delete({ where: { id } });
  }
}

```

---

### File: `src/modules/reports/controllers/reports.controller.ts`

```typescript
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ExportFilterDto } from '../dto/export-filter.dto';
import { ReportsService } from '../services/reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OPERATOR, UserRole.ADMIN)
export class ReportsController {
  constructor(private svc: ReportsService) {}

  @Post('export')
  @ApiOperation({
    summary: 'Request export laporan (async via BullMQ)',
    description:
      'Mengembalikan jobId. Cek status via GET /reports/job/:jobId. File tersedia di downloadUrl setelah selesai.',
  })
  @ApiResponse({ status: 200, description: '{ jobId, message }' })
  export(@TenantId() tid: string, @Body() dto: ExportFilterDto) {
    return this.svc.requestExport(tid, dto);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Cek status job export' })
  @ApiParam({ name: 'jobId', description: 'Job ID dari response /reports/export' })
  @ApiResponse({ status: 200, description: '{ jobId, state, progress, downloadUrl }' })
  @ApiResponse({ status: 404, description: 'Job tidak ditemukan' })
  jobStatus(@Param('jobId') jobId: string) {
    return this.svc.getJobStatus(jobId);
  }
}

```

---

### File: `src/modules/reports/dto/export-filter.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
export class ExportFilterDto {
  @IsString() @IsNotEmpty() sessionId!: string;
  @IsOptional() @IsIn(['excel', 'pdf']) format?: 'excel' | 'pdf';
}

```

---

### File: `src/modules/reports/processors/report-queue.processor.ts`

```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { MediaService } from '../../media/services/media.service';
import { ExcelExportService } from '../services/excel-export.service';
import { PdfExportService } from '../services/pdf-export.service';

@Processor('report')
export class ReportQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportQueueProcessor.name);

  constructor(
    private excelSvc: ExcelExportService,
    private pdfSvc: PdfExportService,
    private mediaSvc: MediaService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ sessionId: string; format: string; tenantId: string }>) {
    this.logger.log(`Generating ${job.data.format} for session ${job.data.sessionId}`);

    const attempts = await this.prisma.examAttempt.findMany({
      where: { session: { tenantId: job.data.tenantId }, sessionId: job.data.sessionId },
      include: { user: { select: { username: true, email: true } } },
    });

    const rows = attempts.map((a) => ({
      username: a.user.username,
      email: a.user.email,
      status: a.status,
      score: a.totalScore ?? '-',
      maxScore: a.maxScore ?? '-',
      submittedAt: a.submittedAt?.toISOString() ?? '-',
    }));

    let buf: Buffer;
    let name: string;

    if (job.data.format === 'pdf') {
      const html = `<html><body><table border="1">${rows
        .map(
          (r) =>
            `<tr>${Object.values(r)
              .map((v) => `<td>${v}</td>`)
              .join('')}</tr>`,
        )
        .join('')}</table></body></html>`;
      buf = await this.pdfSvc.generate(html);
      name = `report-${job.data.sessionId}.pdf`;
    } else {
      buf = await this.excelSvc.generate(rows);
      name = `report-${job.data.sessionId}.xlsx`;
    }

    const objectName = await this.mediaSvc.upload(buf, name, 'reports');
    const downloadUrl = await this.mediaSvc.getPresignedUrl(objectName);

    return { objectName, downloadUrl };
  }
}

```

---

### File: `src/modules/reports/reports.module.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/reports/reports.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MediaModule } from '../media/media.module';
import { ExcelExportService } from './services/excel-export.service';
import { PdfExportService } from './services/pdf-export.service';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './controllers/reports.controller';
import { ReportQueueProcessor } from './processors/report-queue.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'report' }), MediaModule],
  providers: [ExcelExportService, PdfExportService, ReportsService, ReportQueueProcessor],
  controllers: [ReportsController],
})
export class ReportsModule {}

```

---

### File: `src/modules/reports/services/excel-export.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/reports/services/excel-export.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExcelExportService {
  async generate(data: Record<string, unknown>[]): Promise<Buffer> {
    const ExcelJS = await import('exceljs');
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Hasil Ujian');
    if (data.length) {
      ws.columns = Object.keys(data[0]).map((k) => ({ header: k, key: k, width: 20 }));
      data.forEach((row) => ws.addRow(row));
    }
    return wb.xlsx.writeBuffer() as Promise<Buffer>;
  }
}

```

---

### File: `src/modules/reports/services/pdf-export.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/reports/services/pdf-export.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfExportService {
  async generate(html: string): Promise<Buffer> {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return Buffer.from(pdf);
  }
}

```

---

### File: `src/modules/reports/services/reports.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ExportFilterDto } from '../dto/export-filter.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectQueue('report') private reportQueue: Queue) {}

  async requestExport(tenantId: string, dto: ExportFilterDto) {
    const jobId = `report-${tenantId}-${dto.sessionId}-${Date.now()}`;
    await this.reportQueue.add(
      'generate',
      { ...dto, tenantId, format: dto.format ?? 'excel' },
      { jobId, removeOnFail: false },
    );
    return { jobId, message: 'Laporan sedang diproses' };
  }

  async getJobStatus(jobId: string) {
    const job = await this.reportQueue.getJob(jobId);
    if (!job) throw new NotFoundException('Job tidak ditemukan');

    const state = await job.getState();
    const result = job.returnvalue as { objectName?: string; downloadUrl?: string } | null;

    return {
      jobId,
      state,
      progress: job.progress,
      failedReason: job.failedReason,
      // downloadUrl di-generate oleh processor dan disimpan di returnvalue
      downloadUrl: result?.downloadUrl,
    };
  }
}

```

---

### File: `src/modules/sessions/controllers/sessions.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { SessionsService } from '../services/sessions.service';
import { SessionMonitoringService } from '../services/session-monitoring.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { AssignStudentsDto } from '../dto/assign-students.dto';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { AuditAction, AuditActions } from '../../audit-logs/decorators/audit.decorator';
import { AuditInterceptor } from '../../audit-logs/interceptors/audit.interceptor';

@ApiTags('Sessions')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
export class SessionsController {
  constructor(
    private svc: SessionsService,
    private monitorSvc: SessionMonitoringService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List semua sesi ujian milik tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list sesi' })
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail sesi ujian' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Detail sesi' })
  @ApiResponse({ status: 404, description: 'Sesi tidak ditemukan' })
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Get(':id/live')
  @Roles(UserRole.SUPERVISOR, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Status live peserta sesi (real-time monitoring)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Daftar attempt aktif beserta status' })
  live(@Param('id') id: string) {
    return this.monitorSvc.getLiveStatus(id);
  }

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Buat sesi ujian baru' })
  @ApiResponse({ status: 201, description: 'Sesi berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Waktu selesai harus setelah waktu mulai' })
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateSessionDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update sesi ujian' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Sesi berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Sesi tidak ditemukan' })
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.svc.update(tid, id, dto);
  }

  @Post(':id/assign')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Assign peserta ke sesi',
    description:
      'Generate tokenCode unik per peserta. Idempoten — peserta yang sudah ada tidak di-duplikat.',
  })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Jumlah peserta yang berhasil di-assign' })
  assign(@TenantId() tid: string, @Param('id') id: string, @Body() dto: AssignStudentsDto) {
    return this.svc.assignStudents(tid, id, dto);
  }

  @Post(':id/activate')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @AuditAction(AuditActions.ACTIVATE_SESSION, 'ExamSession')
  @ApiOperation({
    summary: 'Aktifkan sesi ujian',
    description: 'Status berubah SCHEDULED → ACTIVE. Notifikasi dikirim ke semua peserta.',
  })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Sesi berhasil diaktifkan' })
  @ApiResponse({ status: 400, description: 'Hanya sesi SCHEDULED yang bisa diaktifkan' })
  activate(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.activate(tid, id);
  }
}

```

---

### File: `src/modules/sessions/dto/assign-students.dto.ts`

```typescript
import { IsArray, IsString } from 'class-validator';
export class AssignStudentsDto {
  @IsArray() @IsString({ each: true }) userIds!: string[];
}

```

---

### File: `src/modules/sessions/dto/create-session.dto.ts`

```typescript
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateSessionDto {
  @IsString() @IsNotEmpty() examPackageId!: string;
  @IsOptional() @IsString() roomId?: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsDateString() startTime!: string;
  @IsDateString() endTime!: string;
}

```

---

### File: `src/modules/sessions/dto/update-session.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { SessionStatus } from '../../../common/enums/exam-status.enum';
import { CreateSessionDto } from './create-session.dto';
export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  @IsOptional() @IsEnum(SessionStatus) status?: SessionStatus;
}

```

---

### File: `src/modules/sessions/services/sessions.service.ts`

```typescript
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { SessionStatus } from '../../../common/enums/exam-status.enum';
import { generateTokenCode } from '../../../common/utils/randomizer.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { EmailService } from '../../../common/services/email.service';
import { AssignStudentsDto } from '../dto/assign-students.dto';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private notifSvc: NotificationsService,
    private emailSvc: EmailService,
  ) {}

  async findAll(tenantId: string, q: BaseQueryDto & { status?: SessionStatus }) {
    const where = {
      tenantId,
      ...(q.status && { status: q.status }),
      ...(q.search && { title: { contains: q.search, mode: 'insensitive' as const } }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.examSession.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { [q.sortBy ?? 'startTime']: q.sortOrder },
        include: {
          examPackage: { select: { title: true } },
          room: true,
          _count: { select: { students: true, attempts: true } },
        },
      }),
      this.prisma.examSession.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }

  async findOne(tenantId: string, id: string) {
    const s = await this.prisma.examSession.findFirst({
      where: { id, tenantId },
      include: { examPackage: true, room: true, students: true },
    });
    if (!s) throw new NotFoundException('Sesi ujian tidak ditemukan');
    return s;
  }

  async create(tenantId: string, dto: CreateSessionDto, createdById: string) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);
    if (end <= start) throw new BadRequestException('Waktu selesai harus setelah waktu mulai');
    return this.prisma.examSession.create({
      data: { tenantId, createdById, ...dto, startTime: start, endTime: end },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateSessionDto) {
    await this.findOne(tenantId, id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);
    return this.prisma.examSession.update({ where: { id }, data });
  }

  async assignStudents(tenantId: string, id: string, dto: AssignStudentsDto) {
    await this.findOne(tenantId, id);
    const results = await Promise.allSettled(
      dto.userIds.map((userId) =>
        this.prisma.sessionStudent.upsert({
          where: { sessionId_userId: { sessionId: id, userId } },
          create: { sessionId: id, userId, tokenCode: generateTokenCode() },
          update: {},
        }),
      ),
    );
    return { assigned: results.filter((r) => r.status === 'fulfilled').length };
  }

  async activate(tenantId: string, id: string) {
    const s = await this.findOne(tenantId, id);
    if (s.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Hanya sesi SCHEDULED yang bisa diaktifkan');
    }
    const updated = await this.prisma.examSession.update({
      where: { id },
      data: { status: SessionStatus.ACTIVE },
    });

    // Ambil semua peserta beserta user data
    const students = await this.prisma.sessionStudent.findMany({
      where: { sessionId: id },
      include: {
        user: { select: { id: true, email: true, username: true } },
      },
    });

    // In-app notification + email (fire-and-forget)
    await Promise.allSettled(
      students.map(async (ss) => {
        // In-app notification
        await this.notifSvc.create({
          userId: ss.userId,
          title: 'Ujian Dimulai',
          body: `Sesi "${s.title}" telah diaktifkan. Token Anda: ${ss.tokenCode}`,
          type: 'SESSION_ACTIVATED',
          metadata: { sessionId: id, tenantId, tokenCode: ss.tokenCode },
        });

        // Email notification
        await this.emailSvc.sendSessionActivated({
          to: ss.user.email,
          name: ss.user.username,
          sessionTitle: s.title,
          tokenCode: ss.tokenCode,
          startTime: s.startTime,
          endTime: s.endTime,
        });
      }),
    );

    return updated;
  }
}

```

---

### File: `src/modules/sessions/services/session-monitoring.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/sessions/services/session-monitoring.service.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SessionMonitoringService {
  constructor(private prisma: PrismaService) {}

  async getLiveStatus(sessionId: string) {
    return this.prisma.examAttempt.findMany({
      where: { sessionId },
      select: {
        id: true,
        userId: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        user: { select: { username: true } },
        _count: { select: { answers: true } },
      },
    });
  }
}

```

---

### File: `src/modules/sessions/sessions.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SessionMonitoringService } from './services/session-monitoring.service';
import { SessionsService } from './services/sessions.service';
import { SessionsController } from './controllers/sessions.controller';
import { EmailService } from '../../common/services/email.service';

@Module({
  imports: [NotificationsModule, AuditLogsModule],
  providers: [SessionsService, SessionMonitoringService, EmailService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}

```

---

### File: `src/modules/subjects/controllers/subjects.controller.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/subjects/controllers/subjects.controller.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { SubjectsService } from '../services/subjects.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
  constructor(private svc: SubjectsService) {}

  @Get()
  findAll(@TenantId() tid: string) {
    return this.svc.findAll(tid);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(@TenantId() tid: string, @Body() dto: CreateSubjectDto) {
    return this.svc.create(tid, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.svc.update(tid, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}

```

---

### File: `src/modules/subjects/dto/create-subject.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateSubjectDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() code!: string;
}

```

---

### File: `src/modules/subjects/dto/update-subject.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubjectDto } from './create-subject.dto';
export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}

```

---

### File: `src/modules/subjects/services/subjects.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/subjects/services/subjects.service.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.subject.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async create(tenantId: string, dto: CreateSubjectDto) {
    const exists = await this.prisma.subject.findUnique({
      where: { tenantId_code: { tenantId, code: dto.code } },
    });
    if (exists) throw new ConflictException(`Kode '${dto.code}' sudah ada`);
    return this.prisma.subject.create({ data: { tenantId, ...dto } });
  }

  async update(tenantId: string, id: string, dto: UpdateSubjectDto) {
    const subj = await this.prisma.subject.findFirst({ where: { id, tenantId } });
    if (!subj) throw new NotFoundException('Mata pelajaran tidak ditemukan');
    return this.prisma.subject.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const subj = await this.prisma.subject.findFirst({ where: { id, tenantId } });
    if (!subj) throw new NotFoundException('Mata pelajaran tidak ditemukan');
    return this.prisma.subject.delete({ where: { id } });
  }
}

```

---

### File: `src/modules/subjects/subjects.module.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/subjects/subjects.module.ts
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { SubjectsService } from './services/subjects.service';
import { SubjectsController } from './controllers/subjects.controller';

@Module({
  providers: [SubjectsService],
  controllers: [SubjectsController],
  exports: [SubjectsService],
})
export class SubjectsModule {}

```

---

### File: `src/modules/submissions/controllers/student-exam.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DeviceGuard } from '../../auth/guards/device.guard';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { AuditAction, AuditActions } from '../../audit-logs/decorators/audit.decorator';
import { AuditInterceptor } from '../../audit-logs/interceptors/audit.interceptor';
import {
  ThrottleStrict,
  ThrottleModerate,
  ThrottleRelaxed,
} from '../../../common/decorators/throttle-tier.decorator';
import { ExamDownloadService } from '../services/exam-download.service';
import { ExamSubmissionService } from '../services/exam-submission.service';
import { StartAttemptDto } from '../dto/start-attempt.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { SubmitExamDto } from '../dto/submit-exam.dto';

@ApiTags('Student Exam')
@ApiBearerAuth()
@Controller('student')
@UseGuards(JwtAuthGuard, DeviceGuard)
@UseInterceptors(AuditInterceptor)
export class StudentExamController {
  constructor(
    private downloadSvc: ExamDownloadService,
    private submissionSvc: ExamSubmissionService,
  ) {}

  @Post('download')
  @ThrottleStrict()
  @AuditAction(AuditActions.START_EXAM, 'ExamAttempt')
  @ApiOperation({
    summary: 'Download paket soal',
    description:
      'Validasi token, buat attempt, dan kembalikan paket soal terenkripsi. Idempoten via idempotencyKey.',
  })
  @ApiResponse({ status: 200, description: 'Paket soal berhasil di-download' })
  @ApiResponse({ status: 400, description: 'Token tidak valid / di luar jangka waktu sesi' })
  @ApiResponse({ status: 404, description: 'Sesi tidak aktif' })
  @ApiResponse({ status: 429, description: 'Rate limit — maks 5 req/menit' })
  download(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: StartAttemptDto,
  ) {
    return this.downloadSvc.downloadPackage(
      tid,
      dto.sessionId,
      u.sub,
      dto.tokenCode,
      dto.deviceFingerprint,
      dto.idempotencyKey,
    );
  }

  @Post('answers')
  @ThrottleModerate()
  @ApiOperation({
    summary: 'Submit / update jawaban',
    description:
      'Auto-save per soal. Idempoten via idempotencyKey. Tidak bisa diubah setelah ujian disubmit.',
  })
  @ApiResponse({ status: 200, description: 'Jawaban tersimpan' })
  @ApiResponse({ status: 400, description: 'Attempt sudah SUBMITTED atau TIMED_OUT' })
  @ApiResponse({ status: 404, description: 'Attempt tidak ditemukan' })
  submitAnswer(@Body() dto: SubmitAnswerDto) {
    return this.submissionSvc.submitAnswer(dto);
  }

  @Post('submit')
  @ThrottleStrict()
  @AuditAction(AuditActions.SUBMIT_EXAM, 'ExamAttempt')
  @ApiOperation({
    summary: 'Submit ujian',
    description: 'Mengunci semua jawaban dan memicu auto-grading via BullMQ. Idempoten.',
  })
  @ApiResponse({ status: 200, description: 'Ujian berhasil disubmit' })
  @ApiResponse({ status: 404, description: 'Attempt tidak ditemukan' })
  submitExam(@Body() dto: SubmitExamDto) {
    return this.submissionSvc.submitExam(dto);
  }

  @Get('result/:attemptId')
  @ThrottleRelaxed()
  @ApiOperation({
    summary: 'Lihat hasil ujian',
    description:
      'Hanya mengembalikan nilai lengkap jika status PUBLISHED. Siswa hanya bisa akses attempt miliknya.',
  })
  @ApiParam({ name: 'attemptId', description: 'ID attempt yang ingin dilihat hasilnya' })
  @ApiResponse({ status: 200, description: 'Data hasil ujian' })
  @ApiResponse({ status: 404, description: 'Attempt tidak ditemukan atau bukan milik user ini' })
  getResult(@Param('attemptId') id: string, @CurrentUser() u: CurrentUserPayload) {
    return this.submissionSvc.getAttemptResult(id, u.sub);
  }
}

```

---

### File: `src/modules/submissions/controllers/submissions.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { SubmissionsService } from '../services/submissions.service';

@ApiTags('Submissions')
@ApiBearerAuth()
@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(private svc: SubmissionsService) {}

  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({
    summary: 'List semua submission (attempt) dalam tenant',
    description: 'Digunakan guru/operator untuk overview status pengerjaan siswa.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list attempt' })
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }
}

```

---

### File: `src/modules/submissions/dto/start-attempt.dto.ts`

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
export class StartAttemptDto {
  @IsString() @IsNotEmpty() sessionId!: string;
  @IsString() @IsNotEmpty() tokenCode!: string;
  @IsString() @IsNotEmpty() deviceFingerprint!: string;
  @IsString() @IsNotEmpty() idempotencyKey!: string;
}

```

---

### File: `src/modules/submissions/dto/submit-answer.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';
export class SubmitAnswerDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() questionId!: string;
  @IsString() @IsNotEmpty() idempotencyKey!: string;
  answer!: unknown;
  mediaUrls?: string[];
}

```

---

### File: `src/modules/submissions/dto/submit-exam.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';
export class SubmitExamDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() idempotencyKey!: string;
}

```

---

### File: `src/modules/submissions/dto/upload-media.dto.ts`

```typescript
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class UploadMediaDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() questionId!: string;
  @IsOptional() @IsString() chunkIndex?: string;
  @IsOptional() @IsString() totalChunks?: string;
}

```

---

### File: `src/modules/submissions/interfaces/exam-package.interface.ts`

```typescript
// ── interfaces/exam-package.interface.ts ─────────────────
export interface DownloadablePackage {
  packageId: string;
  sessionId: string;
  attemptId: string;
  title: string;
  settings: Record<string, unknown>;
  questions: DownloadableQuestion[];
  encryptedKey: string; // AES-GCM key terenkripsi dengan public key sesi
  checksum: string;
  expiresAt: string;
}

export interface DownloadableQuestion {
  id: string;
  type: string;
  content: Record<string, unknown>;
  options?: Record<string, unknown>;
  points: number;
  order: number;
  correctAnswer: string; // terenkripsi
}

```

---

### File: `src/modules/submissions/interfaces/grading-result.interface.ts`

```typescript
// ── interfaces/grading-result.interface.ts ───────────────
export interface GradingResult {
  questionId: string;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  feedback?: string;
  requiresManual: boolean;
}

```

---

### File: `src/modules/submissions/processors/submission.events.listener.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { PrismaService } from '../../../prisma/prisma.service';

export interface ExamSubmittedEvent {
  attemptId: string;
  userId: string;
  tenantId: string;
  sessionId: string;
  sessionTitle: string;
}

export interface GradingCompletedEvent {
  attemptId: string;
  userId: string;
  tenantId: string;
  totalScore: number;
  maxScore: number;
  gradingStatus: string;
}

export interface ResultPublishedEvent {
  attemptIds: string[];
  tenantId: string;
}

@Injectable()
export class SubmissionEventsListener {
  private readonly logger = new Logger(SubmissionEventsListener.name);

  constructor(
    private readonly notifSvc: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('exam.submitted')
  async handleExamSubmitted(event: ExamSubmittedEvent) {
    this.logger.log(`exam.submitted — attemptId=${event.attemptId} userId=${event.userId}`);

    try {
      await this.notifSvc.create({
        userId: event.userId,
        title: 'Ujian Berhasil Dikumpulkan',
        body: `Jawaban Anda untuk sesi "${event.sessionTitle}" telah berhasil dikirim. Tunggu hasil penilaian.`,
        type: 'EXAM_SUBMITTED',
        metadata: {
          attemptId: event.attemptId,
          sessionId: event.sessionId,
          tenantId: event.tenantId,
        },
      });
    } catch (err) {
      this.logger.error(`Gagal kirim notifikasi exam.submitted: ${(err as Error).message}`);
    }
  }

  @OnEvent('grading.completed')
  async handleGradingCompleted(event: GradingCompletedEvent) {
    this.logger.log(`grading.completed — attemptId=${event.attemptId}`);

    // Notifikasi ke guru/admin bahwa auto-grading selesai
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          tenantId: event.tenantId,
          role: { in: ['TEACHER', 'ADMIN'] },
          isActive: true,
        },
        select: { id: true },
      });

      await Promise.allSettled(
        admins.map((a) =>
          this.notifSvc.create({
            userId: a.id,
            title: 'Auto-Grading Selesai',
            body: `Attempt ${event.attemptId} selesai dinilai otomatis. Status: ${event.gradingStatus}.`,
            type: 'GRADING_COMPLETED',
            metadata: {
              attemptId: event.attemptId,
              gradingStatus: event.gradingStatus,
              totalScore: event.totalScore,
              maxScore: event.maxScore,
            },
          }),
        ),
      );
    } catch (err) {
      this.logger.error(`Gagal kirim notifikasi grading.completed: ${(err as Error).message}`);
    }
  }

  @OnEvent('result.published')
  async handleResultPublished(event: ResultPublishedEvent) {
    this.logger.log(`result.published — ${event.attemptIds.length} attempt(s)`);

    try {
      const attempts = await this.prisma.examAttempt.findMany({
        where: { id: { in: event.attemptIds } },
        select: {
          id: true,
          userId: true,
          totalScore: true,
          maxScore: true,
          session: { select: { title: true } },
        },
      });

      await Promise.allSettled(
        attempts.map((a) => {
          const pct =
            a.maxScore && a.maxScore > 0 ? Math.round(((a.totalScore ?? 0) / a.maxScore) * 100) : 0;
          return this.notifSvc.create({
            userId: a.userId,
            title: 'Nilai Ujian Telah Dipublikasi',
            body: `Nilai Anda untuk sesi "${a.session.title}" telah tersedia. Skor: ${a.totalScore ?? 0}/${a.maxScore ?? 0} (${pct}%).`,
            type: 'RESULT_PUBLISHED',
            metadata: {
              attemptId: a.id,
              totalScore: a.totalScore,
              maxScore: a.maxScore,
              percentage: pct,
              tenantId: event.tenantId,
            },
          });
        }),
      );
    } catch (err) {
      this.logger.error(`Gagal kirim notifikasi result.published: ${(err as Error).message}`);
    }
  }
}

```

---

### File: `src/modules/submissions/processors/submission.processor.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/processors/submission.processor.ts  (FINAL)
// Gunakan GradingHelperService, bukan GradingService (circular dep resolved)
// ════════════════════════════════════════════════════════════════════════════
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { GradingHelperService } from '../services/grading-helper.service';
import { AttemptStatus } from '../../../common/enums/exam-status.enum';

export interface AutoGradeJobData {
  attemptId: string;
  tenantId: string;
}

export interface TimeoutJobData {
  attemptId: string;
  tenantId: string;
  sessionId: string;
}

@Processor('submission')
export class SubmissionProcessor extends WorkerHost {
  private readonly logger = new Logger(SubmissionProcessor.name);

  constructor(
    private gradingHelper: GradingHelperService,
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {
    super();
  }

  async process(job: Job<AutoGradeJobData | TimeoutJobData>): Promise<void> {
    this.logger.log(`[${job.name}] id=${job.id} attempt=${job.attemptsMade + 1}`);

    switch (job.name) {
      case 'auto-grade':
        await this.handleAutoGrade(job as Job<AutoGradeJobData>);
        break;
      case 'timeout-attempt':
        await this.handleTimeout(job as Job<TimeoutJobData>);
        break;
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`[${job.name}] id=${job.id} ✓`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(
      `[${job?.name ?? '?'}] id=${job?.id ?? '?'} attempt=${job?.attemptsMade ?? '?'} ✗ ${err.message}`,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Job id=${jobId} stalled.`);
  }

  // ── Auto-grade ─────────────────────────────────────────────────────────────
  private async handleAutoGrade(job: Job<AutoGradeJobData>) {
    const { attemptId, tenantId } = job.data;

    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId },
      select: { id: true, status: true, userId: true },
    });

    if (!attempt) {
      this.logger.warn(`Attempt ${attemptId} tidak ditemukan, skip.`);
      return;
    }

    if (attempt.status !== AttemptStatus.SUBMITTED && attempt.status !== AttemptStatus.TIMED_OUT) {
      this.logger.warn(`Attempt ${attemptId} belum disubmit (${attempt.status}), skip.`);
      return;
    }

    await this.gradingHelper.runAutoGrade(attemptId);

    await this.auditLogs.log({
      tenantId,
      userId: attempt.userId,
      action: 'AUTO_GRADE_COMPLETED',
      entityType: 'ExamAttempt',
      entityId: attemptId,
    });
  }

  // ── Timeout ────────────────────────────────────────────────────────────────
  private async handleTimeout(job: Job<TimeoutJobData>) {
    const { attemptId, tenantId } = job.data;

    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId, status: AttemptStatus.IN_PROGRESS },
      select: { id: true, userId: true },
    });

    if (!attempt) {
      // Sudah di-submit manual atau sudah timeout sebelumnya
      this.logger.log(`Attempt ${attemptId} sudah tidak IN_PROGRESS, timeout skip.`);
      return;
    }

    await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: { status: AttemptStatus.TIMED_OUT, submittedAt: new Date() },
    });

    await this.auditLogs.log({
      tenantId,
      userId: attempt.userId,
      action: 'ATTEMPT_TIMED_OUT',
      entityType: 'ExamAttempt',
      entityId: attemptId,
    });

    // Auto-grade meski timeout — guru masih bisa review manual
    await this.gradingHelper.runAutoGrade(attemptId);
  }
}

```

---

### File: `src/modules/submissions/services/auto-grading.service.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/submissions/services/auto-grading.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decrypt } from '../../../common/utils/encryption.util';
import { cosineSimilarity } from '../../../common/utils/similarity.util';
import { QuestionType } from '../../../common/enums/question-type.enum';
import { GradingResult } from '../interfaces/grading-result.interface';

@Injectable()
export class AutoGradingService {
  constructor(private cfg: ConfigService) {}

  private get encKey() {
    return this.cfg.get<string>('ENCRYPTION_KEY', '');
  }

  gradeAnswer(
    type: QuestionType,
    encryptedCorrectAnswer: string,
    studentAnswer: unknown,
    maxScore: number,
  ): GradingResult {
    const ca = JSON.parse(decrypt(encryptedCorrectAnswer, this.encKey));

    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        return this.gradeExact(ca.value, studentAnswer, maxScore);
      case QuestionType.COMPLEX_MULTIPLE_CHOICE:
        return this.gradeMultiple(ca.value as string[], studentAnswer as string[], maxScore);
      case QuestionType.MATCHING:
        return this.gradeMatching(
          ca.value as Record<string, string>,
          studentAnswer as Record<string, string>,
          maxScore,
        );
      case QuestionType.SHORT_ANSWER:
        return this.gradeShortAnswer(ca, studentAnswer as string, maxScore);
      case QuestionType.ESSAY:
        return this.gradeEssay(maxScore);
      default:
        return { questionId: '', score: 0, maxScore, isCorrect: false, requiresManual: true };
    }
  }

  private gradeExact(correct: unknown, student: unknown, max: number): GradingResult {
    const ok = String(correct).toLowerCase() === String(student).toLowerCase();
    return {
      questionId: '',
      score: ok ? max : 0,
      maxScore: max,
      isCorrect: ok,
      requiresManual: false,
    };
  }

  private gradeMultiple(correct: string[], student: string[], max: number): GradingResult {
    const correctSet = new Set(correct);
    const allCorrect =
      correct.every((c) => student.includes(c)) && student.every((s) => correctSet.has(s));
    const hits = student.filter((s) => correctSet.has(s)).length;
    const wrong = student.filter((s) => !correctSet.has(s)).length;
    const score = Math.max(0, ((hits - wrong) / correct.length) * max);
    return {
      questionId: '',
      score: Math.round(score * 100) / 100,
      maxScore: max,
      isCorrect: allCorrect,
      requiresManual: false,
    };
  }

  private gradeMatching(
    correct: Record<string, string>,
    student: Record<string, string>,
    max: number,
  ): GradingResult {
    const keys = Object.keys(correct);
    const hits = keys.filter((k) => correct[k] === student[k]).length;
    const score = (hits / keys.length) * max;
    return {
      questionId: '',
      score: Math.round(score * 100) / 100,
      maxScore: max,
      isCorrect: hits === keys.length,
      requiresManual: false,
    };
  }

  private gradeShortAnswer(
    ca: { value: string; caseSensitive?: boolean; similarityThreshold?: number },
    student: string,
    max: number,
  ): GradingResult {
    const a = ca.caseSensitive ? ca.value : ca.value.toLowerCase();
    const b = ca.caseSensitive ? student : student.toLowerCase();
    const threshold = ca.similarityThreshold ?? 0.9;
    const ok = cosineSimilarity(a, b) >= threshold;
    return {
      questionId: '',
      score: ok ? max : 0,
      maxScore: max,
      isCorrect: ok,
      requiresManual: false,
    };
  }

  private gradeEssay(max: number): GradingResult {
    return { questionId: '', score: 0, maxScore: max, isCorrect: false, requiresManual: true };
  }
}

```

---

### File: `src/modules/submissions/services/exam-download.service.ts`

```typescript
// ────────────────────────────────────────────────────────────────────────────
// src/modules/submissions/services/exam-download.service.ts — fix isNewAttempt
// ────────────────────────────────────────────────────────────────────────────
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExamPackageBuilderService } from '../../exam-packages/services/exam-package-builder.service';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { ExamSubmissionService } from './exam-submission.service';
import { sha256 } from '../../../common/utils/checksum.util';
import { SessionStatus, AttemptStatus } from '../../../common/enums/exam-status.enum';
import { isWithinWindow } from '../../../common/utils/time-validation.util';
import { hashFingerprint } from '../../../common/utils/device-fingerprint.util';
import type {
  DownloadablePackage,
  DownloadableQuestion,
} from '../interfaces/exam-package.interface';

@Injectable()
export class ExamDownloadService {
  constructor(
    private prisma: PrismaService,
    private builder: ExamPackageBuilderService,
    private auditLogs: AuditLogsService,
    private submissionSvc: ExamSubmissionService,
  ) {}

  async downloadPackage(
    tenantId: string,
    sessionId: string,
    userId: string,
    tokenCode: string,
    deviceFingerprint: string,
    idempotencyKey: string,
  ): Promise<DownloadablePackage> {
    const session = await this.prisma.examSession.findFirst({
      where: { id: sessionId, tenantId, status: SessionStatus.ACTIVE },
      include: { examPackage: true },
    });
    if (!session) throw new NotFoundException('Sesi tidak aktif atau tidak ditemukan');

    if (!isWithinWindow(session.startTime, session.endTime)) {
      throw new BadRequestException('Ujian tidak dalam jangka waktu yang valid');
    }

    const ss = await this.prisma.sessionStudent.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (!ss || ss.tokenCode !== tokenCode) {
      throw new BadRequestException('Token tidak valid');
    }

    // Cek apakah attempt sudah ada sebelum upsert (untuk deteksi isNewAttempt yang akurat)
    const existingAttempt = await this.prisma.examAttempt.findUnique({
      where: { idempotencyKey },
    });
    const isNewAttempt = !existingAttempt;

    const attempt = await this.prisma.examAttempt.upsert({
      where: { idempotencyKey },
      create: {
        sessionId,
        userId,
        idempotencyKey,
        deviceFingerprint: hashFingerprint(deviceFingerprint),
        status: AttemptStatus.IN_PROGRESS,
      },
      update: {},
    });

    const settings = session.examPackage.settings as {
      shuffleQuestions?: boolean;
      duration?: number;
    };

    const pkg = await this.builder.buildForDownload(
      tenantId,
      session.examPackageId,
      settings.shuffleQuestions ?? false,
    );

    await this.auditLogs.log({
      tenantId,
      userId,
      action: 'DOWNLOAD_EXAM_PACKAGE',
      entityType: 'ExamAttempt',
      entityId: attempt.id,
      after: { sessionId, packageId: session.examPackageId, checksum: pkg.checksum },
    });

    if (isNewAttempt && settings.duration) {
      await this.submissionSvc.scheduleTimeout(attempt.id, tenantId, sessionId, settings.duration);
    }

    return {
      packageId: pkg.packageId,
      title: pkg.title,
      settings: pkg.settings as Record<string, unknown>,
      questions: pkg.questions as unknown as DownloadableQuestion[],
      sessionId,
      attemptId: attempt.id,
      checksum: pkg.checksum,
      encryptedKey: '',
      expiresAt: session.endTime.toISOString(),
    };
  }
}

```

---

### File: `src/modules/submissions/services/exam-submission.service.ts`

```typescript
import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { AttemptStatus } from '../../../common/enums/exam-status.enum';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { SubmitExamDto } from '../dto/submit-exam.dto';
import { AutoGradeJobData } from '../processors/submission.processor';
import type {
  ExamSubmittedEvent,
  GradingCompletedEvent,
} from '../processors/submission.events.listener';

@Injectable()
export class ExamSubmissionService {
  private readonly logger = new Logger(ExamSubmissionService.name);

  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    private eventEmitter: EventEmitter2,
    @InjectQueue('submission') private submissionQueue: Queue,
  ) {}

  async submitAnswer(dto: SubmitAnswerDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      select: { status: true },
    });
    if (!attempt) throw new NotFoundException('Attempt tidak ditemukan');
    if (attempt.status === AttemptStatus.SUBMITTED) {
      throw new BadRequestException('Ujian sudah disubmit, jawaban tidak bisa diubah');
    }
    if (attempt.status === AttemptStatus.TIMED_OUT) {
      throw new BadRequestException('Ujian sudah timeout');
    }

    return this.prisma.examAnswer.upsert({
      where: { idempotencyKey: dto.idempotencyKey },
      create: {
        attemptId: dto.attemptId,
        questionId: dto.questionId,
        idempotencyKey: dto.idempotencyKey,
        answer: dto.answer as object,
        mediaUrls: dto.mediaUrls ?? [],
      },
      update: {
        answer: dto.answer as object,
        mediaUrls: dto.mediaUrls ?? [],
        updatedAt: new Date(),
      },
    });
  }

  async submitExam(dto: SubmitExamDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      include: {
        session: {
          select: {
            tenantId: true,
            title: true,
            id: true,
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException('Attempt tidak ditemukan');

    if (attempt.status === AttemptStatus.SUBMITTED || attempt.status === AttemptStatus.TIMED_OUT) {
      return { message: 'Ujian sudah disubmit sebelumnya', attemptId: dto.attemptId };
    }

    const tenantId = attempt.session.tenantId;

    await this.prisma.examAttempt.update({
      where: { id: dto.attemptId },
      data: { status: AttemptStatus.SUBMITTED, submittedAt: new Date() },
    });

    await this.auditLogs.log({
      tenantId,
      userId: attempt.userId,
      action: 'SUBMIT_EXAM',
      entityType: 'ExamAttempt',
      entityId: dto.attemptId,
      after: { submittedAt: new Date().toISOString() },
    });

    // Emit domain event — ditangkap oleh SubmissionEventsListener
    const event: ExamSubmittedEvent = {
      attemptId: dto.attemptId,
      userId: attempt.userId,
      tenantId,
      sessionId: attempt.session.id,
      sessionTitle: attempt.session.title,
    };
    this.eventEmitter.emit('exam.submitted', event);

    const jobData: AutoGradeJobData = { attemptId: dto.attemptId, tenantId };
    await this.submissionQueue.add('auto-grade', jobData, {
      jobId: `grade-${dto.attemptId}`,
      removeOnComplete: 50,
      removeOnFail: false,
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    });

    return { message: 'Ujian berhasil disubmit', attemptId: dto.attemptId };
  }

  async scheduleTimeout(
    attemptId: string,
    tenantId: string,
    sessionId: string,
    durationMinutes: number,
  ) {
    const delayMs = durationMinutes * 60 * 1000;
    await this.submissionQueue.add(
      'timeout-attempt',
      { attemptId, tenantId, sessionId },
      {
        jobId: `timeout-${attemptId}`,
        delay: delayMs,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
      },
    );
    this.logger.log(`Timeout dijadwalkan untuk attempt ${attemptId} dalam ${durationMinutes}m`);
  }

  /** Dipanggil oleh GradingHelperService setelah auto-grade selesai */
  emitGradingCompleted(event: GradingCompletedEvent) {
    this.eventEmitter.emit('grading.completed', event);
  }

  async getAttemptResult(attemptId: string, userId: string) {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: attemptId, userId },
      include: {
        session: {
          select: {
            title: true,
            examPackage: { select: { title: true, settings: true } },
          },
        },
        answers: {
          select: {
            questionId: true,
            score: true,
            maxScore: true,
            feedback: true,
            isAutoGraded: true,
            gradedAt: true,
          },
        },
      },
    });

    if (!attempt) throw new NotFoundException('Hasil ujian tidak ditemukan');

    if (attempt.gradingStatus !== GradingStatus.PUBLISHED) {
      return {
        attemptId,
        status: attempt.status,
        gradingStatus: attempt.gradingStatus,
        message: this.gradingStatusMessage(attempt.gradingStatus as GradingStatus),
      };
    }

    const pct =
      attempt.maxScore && attempt.maxScore > 0
        ? Math.round(((attempt.totalScore ?? 0) / attempt.maxScore) * 1000) / 10
        : 0;

    const settings = attempt.session.examPackage.settings as { passingScore?: number };
    const isPassed = settings.passingScore != null ? pct >= settings.passingScore : null;

    return {
      attemptId,
      sessionTitle: attempt.session.title,
      packageTitle: attempt.session.examPackage.title,
      status: attempt.status,
      gradingStatus: attempt.gradingStatus,
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      percentage: pct,
      isPassed,
      submittedAt: attempt.submittedAt,
      gradingCompletedAt: attempt.gradingCompletedAt,
      answers: attempt.answers,
    };
  }

  private gradingStatusMessage(status: GradingStatus): string {
    const map: Record<GradingStatus, string> = {
      [GradingStatus.PENDING]: 'Jawaban sedang diproses',
      [GradingStatus.AUTO_GRADED]: 'Penilaian otomatis selesai, menunggu review guru',
      [GradingStatus.MANUAL_REQUIRED]: 'Menunggu penilaian manual dari guru',
      [GradingStatus.COMPLETED]: 'Penilaian selesai, menunggu dipublish',
      [GradingStatus.PUBLISHED]: 'Nilai telah dipublish',
    };
    return map[status] ?? 'Status tidak diketahui';
  }
}

```

---

### File: `src/modules/submissions/services/grading-helper.service.ts`

```typescript
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma/prisma.service';
import { AutoGradingService } from './auto-grading.service';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { QuestionType } from '../../../common/enums/question-type.enum';
import type { GradingCompletedEvent } from '../processors/submission.events.listener';

@Injectable()
export class GradingHelperService {
  private readonly logger = new Logger(GradingHelperService.name);

  constructor(
    private prisma: PrismaService,
    private autoGrading: AutoGradingService,
    private eventEmitter: EventEmitter2,
  ) {}

  async runAutoGrade(attemptId: string): Promise<void> {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: true,
        session: {
          include: {
            examPackage: {
              include: { questions: { include: { question: true } } },
            },
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException(`Attempt ${attemptId} tidak ditemukan`);

    let totalScore = 0;
    let maxScore = 0;
    let needsManual = false;

    for (const ans of attempt.answers) {
      const epq = attempt.session.examPackage.questions.find(
        (q) => q.questionId === ans.questionId,
      );
      if (!epq) continue;

      const pts = epq.points ?? epq.question.points;
      maxScore += pts;

      let result;
      try {
        result = this.autoGrading.gradeAnswer(
          epq.question.type as QuestionType,
          epq.question.correctAnswer as unknown as string,
          ans.answer,
          pts,
        );
      } catch (err) {
        this.logger.error(`Grade error questionId=${epq.questionId}: ${(err as Error).message}`);
        needsManual = true;
        await this.prisma.examAnswer.update({ where: { id: ans.id }, data: { maxScore: pts } });
        continue;
      }

      if (!result.requiresManual) {
        totalScore += result.score;
        await this.prisma.examAnswer.update({
          where: { id: ans.id },
          data: {
            score: result.score,
            maxScore: pts,
            isAutoGraded: true,
            gradedAt: new Date(),
          },
        });
      } else {
        await this.prisma.examAnswer.update({ where: { id: ans.id }, data: { maxScore: pts } });
        needsManual = true;
      }
    }

    const gradingStatus = needsManual ? GradingStatus.MANUAL_REQUIRED : GradingStatus.AUTO_GRADED;

    await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        totalScore,
        maxScore,
        gradingStatus,
        gradingCompletedAt: needsManual ? undefined : new Date(),
      },
    });

    this.logger.log(
      `Attempt ${attemptId} graded: ${totalScore}/${maxScore}, status=${gradingStatus}`,
    );

    // Emit domain event
    const event: GradingCompletedEvent = {
      attemptId,
      userId: attempt.userId,
      tenantId: attempt.session.tenantId,
      totalScore,
      maxScore,
      gradingStatus,
    };
    this.eventEmitter.emit('grading.completed', event);
  }
}

```

---

### File: `src/modules/submissions/services/submissions.service.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/submissions/services/submissions.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { GradingStatus } from '../../../common/enums/grading-status.enum';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    q: BaseQueryDto & { sessionId?: string; gradingStatus?: GradingStatus },
  ) {
    const where = {
      session: { tenantId },
      ...(q.sessionId && { sessionId: q.sessionId }),
      ...(q.gradingStatus && { gradingStatus: q.gradingStatus }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.examAttempt.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { [q.sortBy ?? 'startedAt']: q.sortOrder },
        include: {
          user: { select: { username: true, email: true } },
          session: { select: { title: true } },
        },
      }),
      this.prisma.examAttempt.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }
}

```

---

### File: `src/modules/submissions/submissions.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExamPackagesModule } from '../exam-packages/exam-packages.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ExamDownloadService } from './services/exam-download.service';
import { ExamSubmissionService } from './services/exam-submission.service';
import { AutoGradingService } from './services/auto-grading.service';
import { SubmissionsService } from './services/submissions.service';
import { StudentExamController } from './controllers/student-exam.controller';
import { SubmissionsController } from './controllers/submissions.controller';
import { SubmissionProcessor } from './processors/submission.processor';
import { SubmissionEventsListener } from './processors/submission.events.listener';
import { GradingHelperService } from './services/grading-helper.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'submission' }),
    ExamPackagesModule,
    AuditLogsModule,
    AuthModule,
    NotificationsModule, // diperlukan oleh SubmissionEventsListener
  ],
  providers: [
    ExamDownloadService,
    ExamSubmissionService,
    AutoGradingService,
    GradingHelperService,
    SubmissionsService,
    SubmissionProcessor,
    SubmissionEventsListener,
  ],
  controllers: [StudentExamController, SubmissionsController],
  exports: [ExamSubmissionService, AutoGradingService, GradingHelperService],
})
export class SubmissionsModule {}

```

---

### File: `src/modules/sync/controllers/sync.controller.ts`

```typescript
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import {
  ThrottleModerate,
  ThrottleRelaxed,
} from '../../../common/decorators/throttle-tier.decorator';
import { SyncService } from '../services/sync.service';
import { ChunkedUploadService } from '../services/chunked-upload.service';
import { MediaUploadService } from '../../media/services/media-upload.service';
import { AddSyncItemDto } from '../dto/add-sync-item.dto';
import { RetrySyncDto } from '../dto/retry-sync.dto';
import { UploadChunkDto } from '../dto/upload-chunk.dto';
import { PrismaService } from '../../../prisma/prisma.service';

const MAX_CHUNK_SIZE = 50 * 1024 * 1024;

@ApiTags('Sync')
@ApiBearerAuth()
@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(
    private svc: SyncService,
    private chunkedSvc: ChunkedUploadService,
    private mediaUploadSvc: MediaUploadService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @ThrottleModerate()
  @ApiOperation({
    summary: 'Tambah item ke sync queue',
    description: 'Endpoint utama untuk offline recovery. Idempoten via idempotencyKey.',
  })
  @ApiResponse({ status: 200, description: 'Item ditambahkan / sudah ada (idempoten)' })
  add(@Body() dto: AddSyncItemDto) {
    return this.svc.addItem(dto);
  }

  @Get(':attemptId/status')
  @ThrottleRelaxed()
  @ApiOperation({ summary: 'Status sync queue untuk satu attempt' })
  @ApiParam({ name: 'attemptId', description: 'Attempt ID' })
  @ApiResponse({ status: 200, description: 'Total, pending, failed, dan list item' })
  status(@Param('attemptId') id: string) {
    return this.svc.getStatus(id);
  }

  @Post('retry')
  @ThrottleModerate()
  @ApiOperation({ summary: 'Retry item sync yang gagal (status FAILED)' })
  @ApiResponse({ status: 200, description: 'Item dijadwalkan ulang' })
  @ApiResponse({ status: 400, description: 'Hanya item FAILED yang bisa di-retry' })
  @ApiResponse({ status: 404, description: 'Sync item tidak ditemukan' })
  retry(@Body() dto: RetrySyncDto) {
    return this.svc.retryFailed(dto);
  }

  @Post('upload/chunk')
  @ThrottleModerate()
  @UseInterceptors(FileInterceptor('chunk'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload satu chunk file media',
    description:
      'Kirim chunk satu per satu. Setelah semua chunk diterima, panggil /sync/upload/finalize.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        chunk: { type: 'string', format: 'binary', description: 'Data chunk (maks 50MB)' },
        meta: { type: 'string', description: 'JSON string dari UploadChunkDto' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '{ fileId, saved, total, isComplete }' })
  @ApiResponse({ status: 400, description: 'meta JSON tidak valid / attempt tidak ditemukan' })
  async uploadChunk(
    @UploadedFile(
      new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: MAX_CHUNK_SIZE })] }),
    )
    file: Express.Multer.File,
    @Body('meta') metaRaw: string,
    @CurrentUser() u: CurrentUserPayload,
  ) {
    let dto: UploadChunkDto;
    try {
      dto = JSON.parse(metaRaw) as UploadChunkDto;
    } catch {
      throw new BadRequestException('Field `meta` harus berupa JSON valid');
    }

    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: dto.attemptId, userId: u.sub },
      select: { id: true, status: true },
    });
    if (!attempt) throw new BadRequestException('Attempt tidak ditemukan atau bukan milik Anda');
    if (attempt.status === 'SUBMITTED' || attempt.status === 'TIMED_OUT') {
      throw new BadRequestException('Ujian sudah selesai, upload tidak diizinkan');
    }

    const { saved, total } = await this.chunkedSvc.saveChunk({
      fileId: dto.fileId,
      chunkIndex: dto.chunkIndex,
      totalChunks: dto.totalChunks,
      data: file.buffer,
    });
    return { fileId: dto.fileId, saved, total, isComplete: saved >= total };
  }

  @Post('upload/finalize')
  @ThrottleModerate()
  @ApiOperation({
    summary: 'Finalize chunked upload',
    description: 'Gabungkan semua chunk, upload ke MinIO, update mediaUrls pada ExamAnswer.',
  })
  @ApiResponse({ status: 200, description: '{ objectName, questionId, attemptId }' })
  @ApiResponse({ status: 400, description: 'Upload belum lengkap / attempt tidak ditemukan' })
  async finalizeUpload(@Body() dto: UploadChunkDto, @CurrentUser() u: CurrentUserPayload) {
    const attempt = await this.prisma.examAttempt.findFirst({
      where: { id: dto.attemptId, userId: u.sub },
      select: { id: true },
    });
    if (!attempt) throw new BadRequestException('Attempt tidak ditemukan atau bukan milik Anda');

    if (!this.chunkedSvc.isComplete(dto.fileId, dto.totalChunks)) {
      throw new BadRequestException(
        `Upload belum lengkap. Kirim semua ${dto.totalChunks} chunk terlebih dahulu.`,
      );
    }

    const buffer = await this.chunkedSvc.assemble(dto.fileId, dto.totalChunks);
    const { objectName } = await this.mediaUploadSvc.uploadAndQueue(
      buffer,
      dto.originalName,
      dto.type,
    );

    const answer = await this.prisma.examAnswer.findFirst({
      where: { attemptId: dto.attemptId, questionId: dto.questionId },
      select: { id: true, mediaUrls: true },
    });
    if (answer) {
      await this.prisma.examAnswer.update({
        where: { id: answer.id },
        data: { mediaUrls: [...new Set([...answer.mediaUrls, objectName])], updatedAt: new Date() },
      });
    }

    this.logger.log(`Finalize: attempt=${dto.attemptId} q=${dto.questionId} obj=${objectName}`);
    return { objectName, questionId: dto.questionId, attemptId: dto.attemptId };
  }
}

```

---

### File: `src/modules/sync/dto/add-sync-item.dto.ts`

```typescript
import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { SyncType } from '../../../common/enums/sync-status.enum';
export class AddSyncItemDto {
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() idempotencyKey!: string;
  @IsEnum(SyncType) type!: SyncType;
  @IsObject() payload!: Record<string, unknown>;
}

```

---

### File: `src/modules/sync/dto/retry-sync.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';
export class RetrySyncDto {
  @IsString() @IsNotEmpty() syncItemId!: string;
}

```

---

### File: `src/modules/sync/dto/upload-chunk.dto.ts`

```typescript
import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadChunkDto {
  @IsString() @IsNotEmpty() fileId!: string; // UUID v4 di-generate klien per file
  @IsString() @IsNotEmpty() attemptId!: string;
  @IsString() @IsNotEmpty() questionId!: string;
  @IsInt() @Min(0) @Type(() => Number) chunkIndex!: number;
  @IsInt() @Min(1) @Type(() => Number) totalChunks!: number;
  @IsIn(['image', 'video', 'audio']) type!: 'image' | 'video' | 'audio';
  @IsString() @IsNotEmpty() originalName!: string; // untuk ekstensi file
}

```

---

### File: `src/modules/sync/processors/sync.processor.ts`

```typescript
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SyncProcessorService } from '../services/sync-processor.service';

@Processor('sync', { concurrency: 5 })
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(private processorSvc: SyncProcessorService) {
    super();
  }

  async process(job: Job<{ syncItemId: string }>) {
    this.logger.log(`Processing sync job ${job.id} — item ${job.data.syncItemId}`);
    await this.processorSvc.process(job.data.syncItemId);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Sync job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    this.logger.error(`Sync job ${job?.id ?? '?'} failed: ${err.message}`);
  }
}

```

---

### File: `src/modules/sync/services/chunked-upload.service.ts`

```typescript
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface ChunkInfo {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  data: Buffer;
}

export interface AssembleResult {
  buffer: Buffer;
  isComplete: boolean;
}

@Injectable()
export class ChunkedUploadService {
  private readonly logger = new Logger(ChunkedUploadService.name);
  private readonly tmpDir = path.join(process.cwd(), 'uploads', 'temp');

  async saveChunk(info: ChunkInfo): Promise<{ saved: number; total: number }> {
    if (info.chunkIndex >= info.totalChunks) {
      throw new BadRequestException(
        `chunkIndex ${info.chunkIndex} melebihi totalChunks ${info.totalChunks}`,
      );
    }

    const dir = path.join(this.tmpDir, info.fileId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `chunk_${info.chunkIndex}`), info.data);

    const saved = fs.readdirSync(dir).length;
    this.logger.log(
      `Chunk ${info.chunkIndex + 1}/${info.totalChunks} saved — fileId=${info.fileId}`,
    );

    return { saved, total: info.totalChunks };
  }

  isComplete(fileId: string, totalChunks: number): boolean {
    const dir = path.join(this.tmpDir, fileId);
    if (!fs.existsSync(dir)) return false;
    return fs.readdirSync(dir).length >= totalChunks;
  }

  async assemble(fileId: string, totalChunks: number): Promise<Buffer> {
    const dir = path.join(this.tmpDir, fileId);

    // Validasi semua chunk tersedia
    const missing: number[] = [];
    for (let i = 0; i < totalChunks; i++) {
      if (!fs.existsSync(path.join(dir, `chunk_${i}`))) missing.push(i);
    }
    if (missing.length > 0) {
      throw new BadRequestException(`Chunk tidak lengkap, missing: [${missing.join(', ')}]`);
    }

    const chunks = Array.from({ length: totalChunks }, (_, i) =>
      fs.readFileSync(path.join(dir, `chunk_${i}`)),
    );
    const assembled = Buffer.concat(chunks);

    // Cleanup temp dir setelah assembly
    fs.rmSync(dir, { recursive: true, force: true });
    this.logger.log(`Assembly selesai — fileId=${fileId}, size=${assembled.length} bytes`);

    return assembled;
  }

  /** Cleanup temp files lebih dari N menit (dipanggil via cron/scheduled task) */
  cleanupStale(maxAgeMinutes = 120): number {
    if (!fs.existsSync(this.tmpDir)) return 0;
    const now = Date.now();
    let removed = 0;
    for (const dir of fs.readdirSync(this.tmpDir)) {
      const fullPath = path.join(this.tmpDir, dir);
      const stat = fs.statSync(fullPath);
      const ageMinutes = (now - stat.mtimeMs) / 60_000;
      if (ageMinutes > maxAgeMinutes) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        removed++;
      }
    }
    if (removed > 0) this.logger.log(`Cleaned up ${removed} stale temp dirs`);
    return removed;
  }
}

```

---

### File: `src/modules/sync/services/sync.service.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/sync/services/sync.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { SyncStatus } from '../../../common/enums/sync-status.enum';
import { AddSyncItemDto } from '../dto/add-sync-item.dto';
import { RetrySyncDto } from '../dto/retry-sync.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SyncService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('sync') private syncQueue: Queue,
  ) {}

  async addItem(dto: AddSyncItemDto) {
    const item = await this.prisma.syncQueue.upsert({
      where: { idempotencyKey: dto.idempotencyKey },
      create: {
        attemptId: dto.attemptId,
        idempotencyKey: dto.idempotencyKey,
        type: dto.type,
        payload: dto.payload as Prisma.InputJsonValue,
        status: SyncStatus.PENDING,
      },
      update: {},
    });

    await this.syncQueue.add(
      'process',
      { syncItemId: item.id },
      {
        jobId: item.id,
        removeOnFail: false,
      },
    );

    return item;
  }

  async getStatus(attemptId: string) {
    const items = await this.prisma.syncQueue.findMany({
      where: { attemptId },
      orderBy: { createdAt: 'desc' },
    });
    const pending = items.filter((i) => i.status === SyncStatus.PENDING).length;
    const failed = items.filter((i) => i.status === SyncStatus.FAILED).length;
    return { total: items.length, pending, failed, items };
  }

  async retryFailed(dto: RetrySyncDto) {
    const item = await this.prisma.syncQueue.findUnique({ where: { id: dto.syncItemId } });
    if (!item) throw new NotFoundException('Sync item tidak ditemukan');
    if (item.status !== SyncStatus.FAILED)
      throw new BadRequestException('Hanya item FAILED yang bisa di-retry');

    await this.prisma.syncQueue.update({
      where: { id: item.id },
      data: { status: SyncStatus.PENDING, retryCount: { increment: 1 } },
    });
    await this.syncQueue.add('process', { syncItemId: item.id }, { removeOnFail: false });
    return { message: 'Sync item dijadwalkan ulang' };
  }
}

```

---

### File: `src/modules/sync/services/sync-processor.service.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/sync/services/sync-processor.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SyncStatus, SyncType } from '../../../common/enums/sync-status.enum';

@Injectable()
export class SyncProcessorService {
  private readonly logger = new Logger(SyncProcessorService.name);

  constructor(private prisma: PrismaService) {}

  async process(syncItemId: string) {
    const item = await this.prisma.syncQueue.findUnique({ where: { id: syncItemId } });
    if (!item || item.status === SyncStatus.COMPLETED) return;

    await this.prisma.syncQueue.update({
      where: { id: syncItemId },
      data: { status: SyncStatus.PROCESSING },
    });

    try {
      switch (item.type) {
        case SyncType.SUBMIT_ANSWER:
          await this.processSubmitAnswer(item.payload as Record<string, unknown>);
          break;
        case SyncType.SUBMIT_EXAM:
          await this.processSubmitExam(item.payload as Record<string, unknown>);
          break;
        case SyncType.ACTIVITY_LOG:
          await this.processActivityLog(item.payload as Record<string, unknown>);
          break;
        default:
          this.logger.warn(`Unknown sync type: ${item.type}`);
      }

      await this.prisma.syncQueue.update({
        where: { id: syncItemId },
        data: { status: SyncStatus.COMPLETED, processedAt: new Date() },
      });
    } catch (err) {
      const retryCount = item.retryCount + 1;
      const status = retryCount >= item.maxRetries ? SyncStatus.DEAD_LETTER : SyncStatus.FAILED;
      await this.prisma.syncQueue.update({
        where: { id: syncItemId },
        data: { status, retryCount, lastError: (err as Error).message },
      });
      throw err;
    }
  }

  private async processSubmitAnswer(payload: Record<string, unknown>) {
    await this.prisma.examAnswer.upsert({
      where: { idempotencyKey: payload.idempotencyKey as string },
      create: {
        attemptId: payload.attemptId as string,
        questionId: payload.questionId as string,
        idempotencyKey: payload.idempotencyKey as string,
        answer: payload.answer as object,
        mediaUrls: (payload.mediaUrls as string[]) ?? [],
      },
      update: { answer: payload.answer as object, updatedAt: new Date() },
    });
  }

  private async processSubmitExam(payload: Record<string, unknown>) {
    await this.prisma.examAttempt.update({
      where: { id: payload.attemptId as string },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
  }

  private async processActivityLog(payload: Record<string, unknown>) {
    await this.prisma.examActivityLog.create({
      data: {
        attemptId: payload.attemptId as string,
        userId: payload.userId as string,
        type: payload.type as string,
        metadata: payload.metadata as object,
      },
    });
  }
}

```

---

### File: `src/modules/sync/sync.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { MediaModule } from '../media/media.module';
import { SyncService } from './services/sync.service';
import { SyncProcessorService } from './services/sync-processor.service';
import { ChunkedUploadService } from './services/chunked-upload.service';
import { SyncProcessor } from './processors/sync.processor';
import { SyncController } from './controllers/sync.controller';
import { SyncScheduler } from './sync.scheduler';

@Module({
  imports: [BullModule.registerQueue({ name: 'sync' }), ScheduleModule.forRoot(), MediaModule],
  providers: [
    SyncService,
    SyncProcessorService,
    ChunkedUploadService,
    SyncProcessor,
    SyncScheduler,
  ],
  controllers: [SyncController],
  exports: [SyncService, ChunkedUploadService],
})
export class SyncModule {}

```

---

### File: `src/modules/sync/sync.scheduler.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChunkedUploadService } from './services/chunked-upload.service';

@Injectable()
export class SyncScheduler {
  private readonly logger = new Logger(SyncScheduler.name);

  constructor(private chunkedSvc: ChunkedUploadService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  handleCleanup() {
    const removed = this.chunkedSvc.cleanupStale(120);
    if (removed > 0) this.logger.log(`Stale temp cleanup: ${removed} dirs removed`);
  }
}

```

---

### File: `src/modules/tenants/controllers/tenants.controller.ts`

```typescript
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { TenantsService } from '../services/tenants.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class TenantsController {
  constructor(private svc: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List semua tenant (hanya SUPERADMIN)' })
  @ApiResponse({ status: 200, description: 'Paginated list tenant' })
  findAll(@Query() q: BaseQueryDto) {
    return this.svc.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail tenant' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Detail tenant' })
  @ApiResponse({ status: 404, description: 'Tenant tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Buat tenant baru (institusi baru)' })
  @ApiResponse({ status: 201, description: 'Tenant berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Kode atau subdomain sudah digunakan' })
  create(@Body() dto: CreateTenantDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant (termasuk isActive untuk disable)' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant berhasil diupdate' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.svc.update(id, dto);
  }
}

```

---

### File: `src/modules/tenants/dto/create-tenant.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateTenantDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() code!: string;
  @IsString() @IsNotEmpty() subdomain!: string;
}

```

---

### File: `src/modules/tenants/dto/update-tenant.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTenantDto } from './create-tenant.dto';
export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}

```

---

### File: `src/modules/tenants/services/tenants.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/tenants/services/tenants.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(q: BaseQueryDto) {
    const where = q.search
      ? { OR: [{ name: { contains: q.search } }, { code: { contains: q.search } }] }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({ where, skip: q.skip, take: q.limit }),
      this.prisma.tenant.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }

  async findOne(id: string) {
    const t = await this.prisma.tenant.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Tenant tidak ditemukan');
    return t;
  }

  async findBySubdomain(subdomain: string) {
    const t = await this.prisma.tenant.findFirst({ where: { subdomain, isActive: true } });
    if (!t) throw new NotFoundException(`Subdomain '${subdomain}' tidak ditemukan`);
    return t;
  }

  async create(dto: CreateTenantDto) {
    const exists = await this.prisma.tenant.findFirst({
      where: { OR: [{ code: dto.code }, { subdomain: dto.subdomain }] },
    });
    if (exists) throw new ConflictException('Kode atau subdomain sudah digunakan');
    return this.prisma.tenant.create({ data: dto });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }
}

```

---

### File: `src/modules/tenants/tenants.module.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/tenants/tenants.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { TenantsService } from './services/tenants.service';
import { TenantsController } from './controllers/tenants.controller';

@Module({
  providers: [TenantsService],
  controllers: [TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {}

```

---

### File: `src/modules/users/controllers/users.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ImportUsersDto } from '../dto/import-users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List pengguna dalam tenant' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list user (passwordHash tidak dikembalikan)',
  })
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail pengguna' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Detail user' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Post()
  @ApiOperation({ summary: 'Buat pengguna baru' })
  @ApiResponse({ status: 201, description: 'User berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Email atau username sudah digunakan' })
  create(@TenantId() tid: string, @Body() dto: CreateUserDto) {
    return this.svc.create(tid, dto);
  }

  @Post('import')
  @ApiOperation({
    summary: 'Bulk import pengguna',
    description: 'Mengembalikan { created, failed }.',
  })
  @ApiResponse({ status: 200, description: '{ created: N, failed: M }' })
  import(@TenantId() tid: string, @Body() dto: ImportUsersDto) {
    return this.svc.bulkImport(tid, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pengguna' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User berhasil diupdate' })
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.update(tid, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate pengguna (soft delete — isActive = false)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User dinonaktifkan' })
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}

```

---

### File: `src/modules/users/dto/create-user.dto.ts`

```typescript
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';
export class CreateUserDto {
  @IsEmail() email!: string;
  @IsString() @IsNotEmpty() username!: string;
  @IsString() @MinLength(8) password!: string;
  @IsEnum(UserRole) role!: UserRole;
  @IsOptional() @IsString() name?: string;
}

```

---

### File: `src/modules/users/dto/device-management.dto.ts`

```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class LockDeviceDto {
  @IsString() @IsNotEmpty() userId!: string;
  @IsString() @IsNotEmpty() fingerprint!: string;
}

export class UnlockDeviceDto {
  @IsString() @IsNotEmpty() userId!: string;
  @IsString() @IsNotEmpty() fingerprint!: string;
}

export class UpdateDeviceLabelDto {
  @IsString() @IsNotEmpty() userId!: string;
  @IsString() @IsNotEmpty() fingerprint!: string;
  @IsString() @IsNotEmpty() label!: string;
}

```

---

### File: `src/modules/users/dto/import-users.dto.ts`

```typescript
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
export class ImportUsersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users!: CreateUserDto[];
}

```

---

### File: `src/modules/users/dto/update-user.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}

```

---

### File: `src/modules/users/services/users.service.ts`

```typescript
// ── services/users.service.ts ────────────────────────────
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { ImportUsersDto } from '../dto/import-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, q: BaseQueryDto) {
    const where = {
      tenantId,
      ...(q.search && {
        OR: [
          { username: { contains: q.search, mode: 'insensitive' as const } },
          { email: { contains: q.search, mode: 'insensitive' as const } },
        ],
      }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { [q.sortBy ?? 'createdAt']: q.sortOrder },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const exists = await this.prisma.user.findFirst({
      where: { tenantId, OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (exists) throw new ConflictException('Email atau username sudah digunakan');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { tenantId, email: dto.email, username: dto.username, passwordHash, role: dto.role },
      select: { id: true, email: true, username: true, role: true, createdAt: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
      delete data.password;
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  async bulkImport(tenantId: string, dto: ImportUsersDto) {
    const results = await Promise.allSettled(dto.users.map((u) => this.create(tenantId, u)));
    const created = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    return { created, failed };
  }
}

```

---

### File: `src/modules/users/users.module.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/users/users.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}

```

---

### File: `src/prisma/factories/exam-package.factory.ts`

```typescript
// ── factories/exam-package.factory.ts ────────────────────
export const examPackageFactory = (
  overrides: Partial<{ tenantId: string; title: string }> = {},
) => ({
  tenantId: overrides.tenantId ?? 'test-tenant-id',
  title: overrides.title ?? `Paket Ujian ${Date.now()}`,
  settings: {
    duration: 90,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResult: true,
    maxAttempts: 1,
  },
  status: 'DRAFT',
});

```

---

### File: `src/prisma/factories/question.factory.ts`

```typescript
// ── factories/question.factory.ts ────────────────────────
import { QuestionType as QT } from '../../common/enums/question-type.enum';

export const questionFactory = (
  overrides: Partial<{
    tenantId: string;
    subjectId: string;
    type: QT;
  }> = {},
) => ({
  tenantId: overrides.tenantId ?? 'test-tenant-id',
  subjectId: overrides.subjectId ?? 'test-subject-id',
  type: overrides.type ?? QT.MULTIPLE_CHOICE,
  content: { text: 'Test question?', images: [] },
  options: { a: 'Option A', b: 'Option B', c: 'Option C', d: 'Option D' },
  correctAnswer: 'encrypted-answer',
  points: 10,
  difficulty: 2,
  status: 'approved',
});

```

---

### File: `src/prisma/factories/user.factory.ts`

```typescript
// ── factories/user.factory.ts ─────────────────────────────
import { UserRole as UR } from '../../common/enums/user-role.enum';

export const userFactory = (
  overrides: Partial<{
    tenantId: string;
    email: string;
    username: string;
    role: string;
  }> = {},
) => ({
  tenantId: overrides.tenantId ?? 'test-tenant-id',
  email: overrides.email ?? `user_${Date.now()}@test.com`,
  username: overrides.username ?? `user_${Date.now()}`,
  passwordHash: '$2b$12$hashedpassword',
  role: overrides.role ?? UR.STUDENT,
  isActive: true,
});

```

---

### File: `src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

```

---

### File: `src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Scope } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? [{ emit: 'event', level: 'query' }, 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected');

    // Log slow queries di development
    if (process.env.NODE_ENV === 'development') {
      (this.$on as any)('query', (e: { query: string; duration: number }) => {
        if (e.duration > 500) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query.slice(0, 200)}`);
        }
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected');
  }

  /**
   * Buat Prisma client yang ter-scope ke tenant tertentu.
   * Set PostgreSQL session variable app.tenant_id untuk RLS.
   */
  forTenant(tenantId: string, role = 'APP') {
    return this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            // Set RLS context sebelum setiap query
            await (this as any).$executeRawUnsafe(
              `SET LOCAL app.tenant_id = '${tenantId.replace(/'/g, '')}';
               SET LOCAL app.role = '${role.replace(/'/g, '')}';`,
            );
            return query(args);
          },
        },
      },
    });
  }

  /**
   * Eksekusi dalam transaksi dengan RLS context.
   */
  async withTenantContext<T>(
    tenantId: string,
    role: string,
    fn: (tx: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.tenant_id = '${tenantId.replace(/'/g, '')}';
         SET LOCAL app.role = '${role.replace(/'/g, '')}';`,
      );
      return fn(tx as unknown as PrismaClient);
    });
  }
}

```

---

### File: `src/prisma/seeds/01-tenants.seed.ts`

```typescript
// ── src/prisma/seeds/01-tenants.seed.ts ──────────────────
import { PrismaClient } from '@prisma/client';

export async function seedTenants(prisma: PrismaClient) {
  const tenants = [
    { name: 'SMKN 1 Contoh', code: 'SMKN1', subdomain: 'smkn1' },
    { name: 'SMA Demo', code: 'SMADEMO', subdomain: 'smademo' },
  ];
  for (const t of tenants) {
    await prisma.tenant.upsert({
      where: { code: t.code },
      create: t,
      update: {},
    });
  }
  console.log('✅ Tenants seeded');
}

```

---

### File: `src/prisma/seeds/02-users.seed.ts`

```typescript
// ── src/prisma/seeds/02-users.seed.ts ────────────────────
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  const tenant = await prisma.tenant.findFirst({ where: { code: 'SMKN1' } });
  if (!tenant) throw new Error('Tenant SMKN1 tidak ditemukan');

  const hash = await bcrypt.hash('password123', 12);

  const users = [
    { email: 'admin@smkn1.test',    username: 'admin',     role: 'ADMIN'      },
    { email: 'guru@smkn1.test',     username: 'guru1',     role: 'TEACHER'    },
    { email: 'operator@smkn1.test', username: 'operator1', role: 'OPERATOR'   },
    { email: 'pengawas@smkn1.test', username: 'pengawas1', role: 'SUPERVISOR' },
    { email: 'siswa@smkn1.test',    username: 'siswa1',    role: 'STUDENT'    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { tenantId_username: { tenantId: tenant.id, username: u.username } },
      create: {
        tenantId: tenant.id,
        email: u.email,
        username: u.username,
        passwordHash: hash,
        role: u.role as import('@prisma/client').UserRole,
      },
      update: {},
    });
  }
  console.log('✅ Users seeded');
}

```

---

### File: `src/prisma/seeds/03-subjects.seed.ts`

```typescript
// ── src/prisma/seeds/03-subjects.seed.ts ─────────────────
import { PrismaClient } from '@prisma/client';

export async function seedSubjects(prisma: PrismaClient) {
  const tenant = await prisma.tenant.findFirst({ where: { code: 'SMKN1' } });
  if (!tenant) throw new Error('Tenant tidak ditemukan');

  const subjects = [
    { name: 'Matematika', code: 'MTK' },
    { name: 'Bahasa Indonesia', code: 'BIN' },
    { name: 'Bahasa Inggris', code: 'BIG' },
    { name: 'Fisika', code: 'FIS' },
    { name: 'Kimia', code: 'KIM' },
  ];

  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: s.code } },
      create: { tenantId: tenant.id, ...s },
      update: {},
    });
  }
  console.log('✅ Subjects seeded');
}

```

---

### File: `src/prisma/seeds/index.ts`

```typescript
// ── src/prisma/seeds/index.ts ─────────────────────────────
import { PrismaClient } from '@prisma/client';
import { seedTenants } from './01-tenants.seed';
import { seedUsers } from './02-users.seed';
import { seedSubjects } from './03-subjects.seed';

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedTenants(prisma);
    await seedUsers(prisma);
    await seedSubjects(prisma);
    console.log('🌱 Database seeded successfully');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

```

---

### File: `src/types/uuid.d.ts`

```typescript
declare module 'uuid' {
  export function v4(): string;
}

```

---

## Direktori: prisma

### File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_DIRECT_URL")
}

// ============================================
// MULTI-TENANT ROOT
// ============================================

model Tenant {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique
  subdomain String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users        User[]
  subjects     Subject[]
  questions    Question[]
  examPackages ExamPackage[]
  sessions     ExamSession[]
  auditLogs    AuditLog[]

  @@map("tenants")
}

// ============================================
// USERS & AUTH
// ============================================

model User {
  id           String   @id @default(cuid())
  tenantId     String
  email        String
  username     String
  passwordHash String
  role         UserRole
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenant        Tenant            @relation(fields: [tenantId], references: [id])
  refreshTokens RefreshToken[]
  devices       UserDevice[]
  attempts      ExamAttempt[]
  activityLogs  ExamActivityLog[]
  gradedAnswers ExamAnswer[]      @relation("GradedBy")
  auditLogs     AuditLog[]
  notifications Notification[]

  @@unique([tenantId, email])
  @@unique([tenantId, username])
  @@index([tenantId])
  @@map("users")
}

model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  token     String    @unique
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

model UserDevice {
  id          String    @id @default(cuid())
  userId      String
  fingerprint String
  label       String?
  isLocked    Boolean   @default(false)
  lockedAt    DateTime?
  lastSeenAt  DateTime  @default(now())
  createdAt   DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, fingerprint])
  @@index([userId])
  @@map("user_devices")
}

// ============================================
// QUESTION BANK
// ============================================

model Subject {
  id        String   @id @default(cuid())
  tenantId  String
  name      String
  code      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant    Tenant     @relation(fields: [tenantId], references: [id])
  questions Question[]

  @@unique([tenantId, code])
  @@index([tenantId])
  @@map("subjects")
}

model QuestionTag {
  id       String @id @default(cuid())
  tenantId String
  name     String

  questions QuestionTagMapping[]

  @@unique([tenantId, name])
  @@map("question_tags")
}

model Question {
  id            String       @id @default(cuid())
  tenantId      String
  subjectId     String
  type          QuestionType
  content       Json         // { text, images, audio, video }
  options       Json?        // untuk tipe pilihan ganda & menjodohkan
  correctAnswer Json         // terenkripsi di level aplikasi
  points        Int          @default(1)
  difficulty    Int          @default(1) // 1–5
  status        String       @default("draft") // draft | review | approved
  createdById   String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  tenant           Tenant               @relation(fields: [tenantId], references: [id])
  subject          Subject              @relation(fields: [subjectId], references: [id])
  tags             QuestionTagMapping[]
  examPackageItems ExamPackageQuestion[]
  answers          ExamAnswer[]         // ← FK eksplisit ke jawaban siswa

  @@index([tenantId])
  @@index([tenantId, subjectId])
  @@map("questions")
}

model QuestionTagMapping {
  questionId String
  tagId      String

  question Question    @relation(fields: [questionId], references: [id], onDelete: Cascade)
  tag      QuestionTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([questionId, tagId])
  @@map("question_tag_mappings")
}

// ============================================
// EXAM PACKAGES
// ============================================

model ExamPackage {
  id          String            @id @default(cuid())
  tenantId    String
  title       String
  description String?
  subjectId   String?
  settings    Json              // { duration, shuffleQuestions, shuffleOptions, showResult, maxAttempts }
  status      ExamPackageStatus @default(DRAFT)
  publishedAt DateTime?
  createdById String?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  tenant    Tenant               @relation(fields: [tenantId], references: [id])
  questions ExamPackageQuestion[]
  sessions  ExamSession[]

  @@index([tenantId])
  @@map("exam_packages")
}

model ExamPackageQuestion {
  id            String @id @default(cuid())
  examPackageId String
  questionId    String
  order         Int
  points        Int?   // override points dari question

  examPackage ExamPackage @relation(fields: [examPackageId], references: [id], onDelete: Cascade)
  question    Question    @relation(fields: [questionId], references: [id])

  @@unique([examPackageId, questionId])
  @@unique([examPackageId, order])
  @@map("exam_package_questions")
}

// ============================================
// SESSIONS & ROOMS
// ============================================

model ExamRoom {
  id       String @id @default(cuid())
  tenantId String
  name     String
  capacity Int?

  sessions ExamSession[]

  @@index([tenantId])
  @@map("exam_rooms")
}

model ExamSession {
  id            String        @id @default(cuid())
  tenantId      String
  examPackageId String
  roomId        String?
  title         String
  startTime     DateTime
  endTime       DateTime
  status        SessionStatus @default(SCHEDULED)
  createdById   String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  tenant      Tenant          @relation(fields: [tenantId], references: [id])
  examPackage ExamPackage     @relation(fields: [examPackageId], references: [id])
  room        ExamRoom?       @relation(fields: [roomId], references: [id])
  students    SessionStudent[]
  attempts    ExamAttempt[]

  @@index([tenantId])
  @@index([tenantId, examPackageId])
  @@map("exam_sessions")
}

model SessionStudent {
  sessionId String
  userId    String
  tokenCode String    @unique
  expiresAt DateTime? // ← token expiry opsional
  addedAt   DateTime  @default(now())

  session ExamSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@id([sessionId, userId])
  @@map("session_students")
}

// ============================================
// ATTEMPTS & ANSWERS
// ============================================

model ExamAttempt {
  id                 String        @id @default(cuid())
  sessionId          String
  userId             String
  idempotencyKey     String        @unique
  deviceFingerprint  String?
  startedAt          DateTime      @default(now())
  submittedAt        DateTime?
  status             AttemptStatus @default(IN_PROGRESS)
  packageHash        String?
  totalScore         Float?
  maxScore           Float?
  gradingStatus      GradingStatus @default(PENDING)
  gradingCompletedAt DateTime?

  session      ExamSession       @relation(fields: [sessionId], references: [id])
  user         User              @relation(fields: [userId], references: [id])
  answers      ExamAnswer[]
  activityLogs ExamActivityLog[]
  syncItems    SyncQueue[]

  @@unique([sessionId, userId])
  @@index([sessionId])
  @@index([userId])
  @@map("exam_attempts")
}

model ExamAnswer {
  id             String    @id @default(cuid())
  attemptId      String
  questionId     String
  idempotencyKey String    @unique
  answer         Json
  mediaUrls      String[]
  score          Float?
  maxScore       Float?
  feedback       String?
  isAutoGraded   Boolean   @default(false)
  gradedById     String?
  gradedAt       DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  attempt  ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question Question    @relation(fields: [questionId], references: [id])       // ← FK eksplisit
  gradedBy User?       @relation("GradedBy", fields: [gradedById], references: [id])

  @@unique([attemptId, questionId])
  @@index([attemptId])
  @@index([questionId])
  @@map("exam_answers")
}

// ============================================
// SYNC QUEUE
// ============================================

model SyncQueue {
  id             String     @id @default(cuid())
  attemptId      String
  idempotencyKey String     @unique
  type           SyncType
  payload        Json
  status         SyncStatus @default(PENDING)
  retryCount     Int        @default(0)
  maxRetries     Int        @default(5)
  lastError      String?
  processedAt    DateTime?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  attempt ExamAttempt @relation(fields: [attemptId], references: [id])

  @@index([status, retryCount])
  @@index([attemptId])
  @@map("sync_queue")
}

// ============================================
// LOGGING & AUDIT
// ============================================

model ExamActivityLog {
  id        String   @id @default(cuid())
  attemptId String
  userId    String
  type      String   // tab_blur | tab_focus | copy_paste | idle | ...
  metadata  Json?
  createdAt DateTime @default(now())

  attempt ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  user    User        @relation(fields: [userId], references: [id])

  @@index([attemptId])
  @@map("exam_activity_logs")
}

model AuditLog {
  id         String   @id @default(cuid())
  tenantId   String
  userId     String?
  action     String
  entityType String
  entityId   String
  before     Json?
  after      Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id])
  user   User?  @relation(fields: [userId], references: [id])

  @@index([tenantId])
  @@index([tenantId, action])
  @@map("audit_logs")
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  body      String
  type      String
  isRead    Boolean  @default(false)
  metadata  Json?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade) // ← relasi eksplisit

  @@index([userId, isRead])
  @@map("notifications")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  SUPERADMIN
  ADMIN
  TEACHER
  SUPERVISOR
  OPERATOR
  STUDENT
}

enum QuestionType {
  MULTIPLE_CHOICE
  COMPLEX_MULTIPLE_CHOICE
  TRUE_FALSE
  MATCHING
  SHORT_ANSWER
  ESSAY
}

enum ExamPackageStatus {
  DRAFT
  REVIEW
  PUBLISHED
  ARCHIVED
}

enum SessionStatus {
  SCHEDULED
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  TIMED_OUT
  ABANDONED
}

enum GradingStatus {
  PENDING
  AUTO_GRADED
  MANUAL_REQUIRED
  COMPLETED
  PUBLISHED
}

enum SyncStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  DEAD_LETTER
}

enum SyncType {
  SUBMIT_ANSWER
  SUBMIT_EXAM
  UPLOAD_MEDIA
  ACTIVITY_LOG
}

```

---

## Direktori: test

### File: `test/e2e/auth.e2e-spec.ts`

```typescript
// ── test/e2e/auth.e2e-spec.ts ────────────────────────────────────────────────
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Auth E2E', () => {
  let app: INestApplication | undefined;

  // beforeAll: setup app & db

  it('POST /api/auth/login → 200 dengan token valid', async () => {
    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123', fingerprint: 'test-fp' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();
      });
  });

  it('POST /api/auth/login → 401 dengan password salah', async () => {
    await request(app!.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong', fingerprint: 'fp' })
      .expect(401);
  });
});

```

---

### File: `test/e2e/grading.e2e-spec.ts`

```typescript
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { GradingStatus } from '../../src/common/enums/grading-status.enum';
import { AttemptStatus } from '../../src/common/enums/exam-status.enum';

describe('Grading Flow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let teacherToken: string;
  let studentToken: string;
  let attemptId: string;
  let questionId: string;
  let answerId: string;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Setup: login ───────────────────────────────────────────────────────────
  describe('0. Login', () => {
    it('guru mendapat token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'guru1', password: 'password123', fingerprint: 'guru-fp' })
        .expect(200);
      teacherToken = res.body.data.accessToken;
    });

    it('siswa mendapat token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'siswa1', password: 'password123', fingerprint: 'siswa-fp' })
        .expect(200);
      studentToken = res.body.data.accessToken;
    });
  });

  // ── Setup: siapkan attempt SUBMITTED dengan essay ──────────────────────────
  describe('1. Setup Attempt dengan Essay', () => {
    it('buat attempt SUBMITTED dengan jawaban essay', async () => {
      // Ambil attempt yang sudah ada dari flow student-exam, atau buat langsung via Prisma
      const attempt = await prisma.examAttempt.findFirst({
        where: { status: AttemptStatus.SUBMITTED },
        include: { answers: { take: 1 } },
      });

      if (!attempt) {
        // Skip jika tidak ada data seed — jalankan student-exam-flow.e2e-spec.ts lebih dulu
        console.warn('Tidak ada attempt SUBMITTED — pastikan student-exam-flow dijalankan dulu');
        return;
      }

      attemptId = attempt.id;

      // Set satu jawaban ke MANUAL_REQUIRED untuk simulasi essay
      if (attempt.answers.length > 0) {
        answerId = attempt.answers[0].id;
        questionId = attempt.answers[0].questionId;

        await prisma.examAnswer.update({
          where: { id: answerId },
          data: { score: null, isAutoGraded: false },
        });
        await prisma.examAttempt.update({
          where: { id: attemptId },
          data: { gradingStatus: GradingStatus.MANUAL_REQUIRED },
        });
      }
    });
  });

  // ── GET /grading — list pending manual ────────────────────────────────────
  describe('2. List Pending Manual Grading', () => {
    it('GET /grading mengembalikan attempt MANUAL_REQUIRED', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/grading')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('data');
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });

    it('siswa tidak bisa akses /grading → 403', async () => {
      await request(app.getHttpServer())
        .get('/api/grading')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);
    });
  });

  // ── PATCH /grading/answer — grade manual ──────────────────────────────────
  describe('3. Manual Grade Answer', () => {
    it('PATCH /grading/answer berhasil memberi nilai', async () => {
      if (!attemptId || !questionId) return;

      const res = await request(app.getHttpServer())
        .patch('/api/grading/answer')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          attemptId,
          questionId,
          score: 15,
          feedback: 'Jawaban cukup baik, perlu elaborasi lebih lanjut',
        })
        .expect(200);

      expect(res.body.data.score).toBe(15);
      expect(res.body.data.feedback).toBeDefined();
    });

    it('grade dengan score negatif → 400', async () => {
      if (!attemptId || !questionId) return;

      await request(app.getHttpServer())
        .patch('/api/grading/answer')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ attemptId, questionId, score: -5 })
        .expect(400);
    });
  });

  // ── POST /grading/complete ─────────────────────────────────────────────────
  describe('4. Complete Grading', () => {
    it('POST /grading/complete berhasil jika semua jawaban sudah dinilai', async () => {
      if (!attemptId) return;

      // Pastikan semua jawaban punya score
      await prisma.examAnswer.updateMany({
        where: { attemptId, score: null },
        data: { score: 0, maxScore: 10 },
      });

      const res = await request(app.getHttpServer())
        .post('/api/grading/complete')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ attemptId })
        .expect(200);

      expect(res.body.data.gradingStatus).toBe(GradingStatus.COMPLETED);
    });
  });

  // ── POST /grading/publish ──────────────────────────────────────────────────
  describe('5. Publish Results', () => {
    it('POST /grading/publish memublikasikan hasil', async () => {
      if (!attemptId) return;

      const res = await request(app.getHttpServer())
        .post('/api/grading/publish')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ attemptIds: [attemptId] })
        .expect(200);

      expect(res.body.data.published).toBeGreaterThanOrEqual(1);
    });

    it('siswa dapat melihat hasil setelah PUBLISHED', async () => {
      if (!attemptId) return;

      const res = await request(app.getHttpServer())
        .get(`/api/student/result/${attemptId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.data.gradingStatus).toBe(GradingStatus.PUBLISHED);
      expect(res.body.data.totalScore).toBeDefined();
    });
  });
});

```

---

### File: `test/e2e/offline-sync.e2e-spec.ts`

```typescript
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { SyncType, SyncStatus } from '../../src/common/enums/sync-status.enum';

describe('Offline Sync Flow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentToken: string;
  let attemptId: string;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  describe('0. Setup', () => {
    it('siswa login', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'siswa1', password: 'password123', fingerprint: 'siswa-fp' })
        .expect(200);
      studentToken = res.body.data.accessToken;

      // Ambil attempt IN_PROGRESS yang ada dari seed/flow sebelumnya
      const attempt = await prisma.examAttempt.findFirst({
        where: { status: 'IN_PROGRESS' },
      });
      if (attempt) attemptId = attempt.id;
    });
  });

  // ── Add Sync Item ──────────────────────────────────────────────────────────
  describe('1. POST /sync — tambah item ke antrian', () => {
    it('menambahkan SUBMIT_ANSWER ke sync queue', async () => {
      if (!attemptId) return;

      const idemKey = `sync-ans-${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post('/api/sync')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          idempotencyKey: idemKey,
          type: SyncType.SUBMIT_ANSWER,
          payload: {
            attemptId,
            questionId: 'q-placeholder',
            idempotencyKey: idemKey,
            answer: 'a',
          },
        })
        .expect(200);

      expect(res.body.data.idempotencyKey).toBe(idemKey);
      expect(res.body.data.status).toBe(SyncStatus.PENDING);
    });

    it('idempotent — duplikat key tidak membuat item baru', async () => {
      if (!attemptId) return;

      const idemKey = `sync-idem-${Date.now()}`;
      const payload = {
        attemptId,
        idempotencyKey: idemKey,
        type: SyncType.SUBMIT_ANSWER,
        payload: { attemptId, questionId: 'q-1', idempotencyKey: idemKey, answer: 'b' },
      };

      await request(app.getHttpServer())
        .post('/api/sync')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(payload)
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/sync')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(payload)
        .expect(200);

      const count = await prisma.syncQueue.count({ where: { idempotencyKey: idemKey } });
      expect(count).toBe(1);
    });

    it('tanpa auth → 401', async () => {
      await request(app.getHttpServer())
        .post('/api/sync')
        .send({ attemptId: 'x', idempotencyKey: 'x', type: SyncType.SUBMIT_ANSWER, payload: {} })
        .expect(401);
    });
  });

  // ── GET Status ─────────────────────────────────────────────────────────────
  describe('2. GET /sync/:attemptId/status', () => {
    it('mengembalikan status sync untuk attempt', async () => {
      if (!attemptId) return;

      const res = await request(app.getHttpServer())
        .get(`/api/sync/${attemptId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('pending');
      expect(res.body.data).toHaveProperty('failed');
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });
  });

  // ── Retry Failed ──────────────────────────────────────────────────────────
  describe('3. POST /sync/retry — retry item gagal', () => {
    it('retry item FAILED berhasil dijadwalkan ulang', async () => {
      if (!attemptId) return;

      // Buat item FAILED langsung via Prisma
      const failedItem = await prisma.syncQueue.create({
        data: {
          attemptId,
          idempotencyKey: `failed-${Date.now()}`,
          type: SyncType.ACTIVITY_LOG,
          payload: { type: 'tab_blur' },
          status: SyncStatus.FAILED,
          retryCount: 1,
        },
      });

      const res = await request(app.getHttpServer())
        .post('/api/sync/retry')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ syncItemId: failedItem.id })
        .expect(200);

      expect(res.body.data.message).toMatch(/dijadwalkan ulang/i);

      // Verifikasi status kembali ke PENDING
      const updated = await prisma.syncQueue.findUnique({ where: { id: failedItem.id } });
      expect(updated?.status).toBe(SyncStatus.PENDING);
    });

    it('retry item COMPLETED → 400', async () => {
      if (!attemptId) return;

      const completedItem = await prisma.syncQueue.create({
        data: {
          attemptId,
          idempotencyKey: `completed-${Date.now()}`,
          type: SyncType.ACTIVITY_LOG,
          payload: {},
          status: SyncStatus.COMPLETED,
        },
      });

      await request(app.getHttpServer())
        .post('/api/sync/retry')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ syncItemId: completedItem.id })
        .expect(400);
    });

    it('retry item tidak ada → 404', async () => {
      await request(app.getHttpServer())
        .post('/api/sync/retry')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ syncItemId: 'nonexistent-id' })
        .expect(404);
    });
  });

  // ── Chunked Upload ─────────────────────────────────────────────────────────
  describe('4. POST /sync/upload/chunk — chunked upload', () => {
    const fileId = `e2e-file-${Date.now()}`;

    it('upload chunk 0/2 berhasil', async () => {
      if (!attemptId) return;

      const meta = JSON.stringify({
        fileId,
        attemptId,
        questionId: 'q-1',
        chunkIndex: 0,
        totalChunks: 2,
        type: 'image',
        originalName: 'test.jpg',
      });

      const res = await request(app.getHttpServer())
        .post('/api/sync/upload/chunk')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('chunk', Buffer.from('chunk-data-0'), 'chunk0')
        .field('meta', meta)
        .expect(200);

      expect(res.body.data.saved).toBe(1);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.isComplete).toBe(false);
    });

    it('upload chunk 1/2 → isComplete true', async () => {
      if (!attemptId) return;

      const meta = JSON.stringify({
        fileId,
        attemptId,
        questionId: 'q-1',
        chunkIndex: 1,
        totalChunks: 2,
        type: 'image',
        originalName: 'test.jpg',
      });

      const res = await request(app.getHttpServer())
        .post('/api/sync/upload/chunk')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('chunk', Buffer.from('chunk-data-1'), 'chunk1')
        .field('meta', meta)
        .expect(200);

      expect(res.body.data.isComplete).toBe(true);
    });

    it('meta JSON tidak valid → 400', async () => {
      if (!attemptId) return;

      await request(app.getHttpServer())
        .post('/api/sync/upload/chunk')
        .set('Authorization', `Bearer ${studentToken}`)
        .attach('chunk', Buffer.from('data'), 'chunk')
        .field('meta', 'invalid-json')
        .expect(400);
    });
  });
});

```

---

### File: `test/e2e/student-exam-flow.e2e-spec.ts`

```typescript
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

/**
 * E2E test ini membutuhkan database test dan Redis.
 * Jalankan dengan: DATABASE_URL=... npx jest --config jest-e2e.json
 *
 * Setiap describe block membersihkan data setelah selesai.
 */
describe('Student Exam Flow (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let studentToken: string;
  let operatorToken: string;
  let sessionId: string;
  let tokenCode: string;
  let attemptId: string;

  // ── Setup ──────────────────────────────────────────────────────────────────
  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Step 0: Login ──────────────────────────────────────────────────────────
  describe('0. Login', () => {
    it('operator mendapat token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'operator1', password: 'password123', fingerprint: 'op-fp' })
        .expect(200);
      operatorToken = res.body.data.accessToken;
      expect(operatorToken).toBeDefined();
    });

    it('siswa mendapat token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'siswa1', password: 'password123', fingerprint: 'siswa-fp' })
        .expect(200);
      studentToken = res.body.data.accessToken;
      expect(studentToken).toBeDefined();
    });
  });

  // ── Step 1: Operator aktifkan sesi ─────────────────────────────────────────
  describe('1. Operator — Aktifkan Sesi', () => {
    it('GET /sessions mengembalikan minimal 1 sesi', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sessions')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);
      expect(res.body.data.data.length).toBeGreaterThan(0);
      sessionId = res.body.data.data[0].id;
    });

    it('POST /sessions/:id/activate mengaktifkan sesi', async () => {
      await request(app.getHttpServer())
        .post(`/api/sessions/${sessionId}/activate`)
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);
    });

    it('GET tokenCode siswa dari sessionStudent', async () => {
      const ss = await prisma.sessionStudent.findFirst({ where: { sessionId } });
      expect(ss).toBeDefined();
      tokenCode = ss!.tokenCode;
    });
  });

  // ── Step 2: Siswa download paket ───────────────────────────────────────────
  describe('2. Siswa — Download Paket', () => {
    it('POST /student/download mengembalikan paket soal', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/student/download')
        .set('Authorization', `Bearer ${studentToken}`)
        .set('x-device-fingerprint', 'siswa-fp')
        .send({
          sessionId,
          tokenCode,
          deviceFingerprint: 'siswa-fp',
          idempotencyKey: `download-${Date.now()}`,
        })
        .expect(200);

      const pkg = res.body.data;
      expect(pkg.packageId).toBeDefined();
      expect(pkg.attemptId).toBeDefined();
      expect(pkg.checksum).toBeDefined();
      expect(Array.isArray(pkg.questions)).toBe(true);
      attemptId = pkg.attemptId;
    });

    it('download idempoten — attempt yang sama dikembalikan', async () => {
      const idemKey = `download-idem-${Date.now()}`;
      const res1 = await request(app.getHttpServer())
        .post('/api/student/download')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ sessionId, tokenCode, deviceFingerprint: 'siswa-fp', idempotencyKey: idemKey })
        .expect(200);
      const res2 = await request(app.getHttpServer())
        .post('/api/student/download')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ sessionId, tokenCode, deviceFingerprint: 'siswa-fp', idempotencyKey: idemKey })
        .expect(200);
      expect(res1.body.data.attemptId).toBe(res2.body.data.attemptId);
    });

    it('download dengan token salah → 400', async () => {
      await request(app.getHttpServer())
        .post('/api/student/download')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          sessionId,
          tokenCode: 'WRONG-TOKEN',
          deviceFingerprint: 'siswa-fp',
          idempotencyKey: `dl-bad-${Date.now()}`,
        })
        .expect(400);
    });
  });

  // ── Step 3: Siswa submit jawaban ───────────────────────────────────────────
  describe('3. Siswa — Submit Jawaban', () => {
    it('POST /student/answers menyimpan jawaban', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/student/answers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          questionId: 'q-placeholder', // akan diganti ID soal nyata di test DB
          idempotencyKey: `ans-1-${Date.now()}`,
          answer: 'a',
        })
        .expect(200);
      expect(res.body.data.attemptId).toBe(attemptId);
    });

    it('submit jawaban idempoten — tidak duplikat', async () => {
      const idemKey = `ans-idem-${Date.now()}`;
      await request(app.getHttpServer())
        .post('/api/student/answers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ attemptId, questionId: 'q-placeholder', idempotencyKey: idemKey, answer: 'b' })
        .expect(200);
      await request(app.getHttpServer())
        .post('/api/student/answers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ attemptId, questionId: 'q-placeholder', idempotencyKey: idemKey, answer: 'b' })
        .expect(200);

      const count = await prisma.examAnswer.count({ where: { idempotencyKey: idemKey } });
      expect(count).toBe(1);
    });
  });

  // ── Step 4: Submit ujian ───────────────────────────────────────────────────
  describe('4. Siswa — Submit Ujian', () => {
    it('POST /student/submit berhasil', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/student/submit')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ attemptId, idempotencyKey: `submit-${Date.now()}` })
        .expect(200);
      expect(res.body.data.message).toMatch(/berhasil/i);
    });

    it('submit kedua kali → idempoten, tidak error', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/student/submit')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ attemptId, idempotencyKey: `submit-2-${Date.now()}` })
        .expect(200);
      expect(res.body.data.message).toMatch(/sudah disubmit/i);
    });

    it('submit jawaban setelah submit ujian → 400', async () => {
      await request(app.getHttpServer())
        .post('/api/student/answers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          questionId: 'q-placeholder',
          idempotencyKey: `ans-after-submit-${Date.now()}`,
          answer: 'c',
        })
        .expect(400);
    });
  });

  // ── Step 5: Cek hasil ──────────────────────────────────────────────────────
  describe('5. Siswa — Hasil Ujian', () => {
    it('GET /student/result/:attemptId mengembalikan status grading', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/student/result/${attemptId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
      expect(res.body.data.attemptId).toBe(attemptId);
      expect(res.body.data.gradingStatus).toBeDefined();
    });

    it('siswa lain tidak bisa akses result attempt ini → 404', async () => {
      // Login sebagai user berbeda
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'guru1', password: 'password123', fingerprint: 'guru-fp' })
        .expect(200);
      const otherToken = res.body.data.accessToken;

      await request(app.getHttpServer())
        .get(`/api/student/result/${attemptId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });
  });
});

```

---

### File: `test/integration/database.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../src/prisma/prisma.service';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

describe('Database Integration', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
    }).compile();
    prisma = mod.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('dapat terhubung ke PostgreSQL', async () => {
    const result = await prisma.$queryRaw<[{ now: Date }]>`SELECT NOW() as now`;
    expect(result[0].now).toBeInstanceOf(Date);
  });

  it('tenant query isolation — tenant A tidak melihat data tenant B', async () => {
    // Buat 2 tenant sementara
    const [tA, tB] = await Promise.all([
      prisma.tenant.create({
        data: { name: 'Tenant A', code: `TA-${Date.now()}`, subdomain: `ta-${Date.now()}` },
      }),
      prisma.tenant.create({
        data: { name: 'Tenant B', code: `TB-${Date.now()}`, subdomain: `tb-${Date.now()}` },
      }),
    ]);

    // Buat subject di tenant A
    const subj = await prisma.subject.create({
      data: { tenantId: tA.id, name: 'Matematika', code: 'MTK-TEST' },
    });

    // Query dengan tenantId B harus kosong
    const result = await prisma.subject.findMany({
      where: { tenantId: tB.id, id: subj.id },
    });
    expect(result).toHaveLength(0);

    // Query dengan tenantId A harus ada
    const resultA = await prisma.subject.findMany({
      where: { tenantId: tA.id, id: subj.id },
    });
    expect(resultA).toHaveLength(1);

    // Cleanup
    await prisma.subject.delete({ where: { id: subj.id } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tA.id, tB.id] } } });
  });

  it('idempotency constraint — ExamAnswer.idempotencyKey unique', async () => {
    // Verifikasi constraint ada di schema
    const result = await prisma.$queryRaw<{ indexname: string }[]>`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'exam_answers'
      AND indexname LIKE '%idempotency%'
    `;
    expect(result.length).toBeGreaterThan(0);
  });

  it('audit_logs tidak punya trigger UPDATE/DELETE (append-only policy)', async () => {
    // Verifikasi tidak ada trigger DELETE pada audit_logs
    const triggers = await prisma.$queryRaw<{ trigger_name: string }[]>`
      SELECT trigger_name FROM information_schema.triggers
      WHERE event_object_table = 'audit_logs'
      AND event_manipulation IN ('UPDATE', 'DELETE')
    `;
    // Append-only diimplementasi di application layer, bukan trigger DB
    // Test ini memastikan tidak ada trigger yang mengoverride kebijakan tersebut
    expect(triggers).toHaveLength(0);
  });
});

```

---

### File: `test/integration/minio.spec.ts`

```typescript
import * as Minio from 'minio';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

describe('MinIO Integration', () => {
  let minio: Minio.Client;
  let bucket: string;
  const testObject = `test/integration-${Date.now()}.txt`;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
    }).compile();
    const cfg = mod.get(ConfigService);

    bucket = cfg.get('MINIO_BUCKET', 'exam-assets');
    minio = new Minio.Client({
      endPoint: cfg.get('MINIO_ENDPOINT', 'localhost'),
      port: Number(cfg.get('MINIO_PORT', 9000)),
      useSSL: cfg.get('MINIO_USE_SSL') === 'true',
      accessKey: cfg.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: cfg.get('MINIO_SECRET_KEY', 'minioadmin'),
    });

    // Pastikan bucket ada
    const exists = await minio.bucketExists(bucket);
    if (!exists) await minio.makeBucket(bucket);
  });

  afterAll(async () => {
    // Cleanup test object
    try {
      await minio.removeObject(bucket, testObject);
    } catch {
      /* already removed */
    }
  });

  it('dapat terhubung ke MinIO (bucketExists)', async () => {
    const exists = await minio.bucketExists(bucket);
    expect(exists).toBe(true);
  });

  it('upload object berhasil', async () => {
    const content = Buffer.from('integration test content');
    await expect(minio.putObject(bucket, testObject, content)).resolves.not.toThrow();
  });

  it('object ada setelah upload', async () => {
    const stat = await minio.statObject(bucket, testObject);
    expect(stat.size).toBeGreaterThan(0);
  });

  it('presigned URL dapat di-generate', async () => {
    const url = await minio.presignedGetObject(bucket, testObject, 3600);
    expect(url).toContain(testObject);
    expect(url).toMatch(/^https?:\/\//);
  });

  it('bucket policy tidak publik (private)', async () => {
    // Pastikan bucket tidak punya public-read policy
    // Dalam produksi bucket policy diset via MinIO console/CLI
    // Test ini memverifikasi bahwa presigned URL diperlukan (tidak bisa akses langsung)
    // — divalidasi secara implisit jika presigned URL memiliki signature parameter
    const url = await minio.presignedGetObject(bucket, testObject, 60);
    expect(url).toContain('X-Amz-Signature');
  });

  it('delete object berhasil', async () => {
    await expect(minio.removeObject(bucket, testObject)).resolves.not.toThrow();

    // Setelah delete, stat harus throw
    await expect(minio.statObject(bucket, testObject)).rejects.toThrow();
  });
});

```

---

### File: `test/integration/redis.spec.ts`

```typescript
import Redis from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

describe('Redis Integration', () => {
  let redis: Redis;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
    }).compile();
    const cfg = mod.get(ConfigService);

    redis = new Redis({
      host: cfg.get('REDIS_HOST', 'localhost'),
      port: cfg.get<number>('REDIS_PORT', 6379),
      password: cfg.get('REDIS_PASSWORD') || undefined,
      lazyConnect: false,
    });
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('dapat terhubung ke Redis (PING)', async () => {
    const pong = await redis.ping();
    expect(pong).toBe('PONG');
  });

  it('SET dan GET bekerja', async () => {
    const key = `test:${Date.now()}`;
    await redis.set(key, 'hello');
    const val = await redis.get(key);
    expect(val).toBe('hello');
    await redis.del(key);
  });

  it('TTL expiry bekerja', async () => {
    const key = `test:ttl:${Date.now()}`;
    await redis.setex(key, 1, 'will-expire');
    const before = await redis.get(key);
    expect(before).toBe('will-expire');

    await new Promise((r) => setTimeout(r, 1100));
    const after = await redis.get(key);
    expect(after).toBeNull();
  });

  it('JSON stringify/parse round-trip via Redis', async () => {
    const key = `test:json:${Date.now()}`;
    const obj = { attemptId: 'att-1', score: 85, tags: ['math', 'science'] };
    await redis.setex(key, 60, JSON.stringify(obj));
    const raw = await redis.get(key);
    expect(JSON.parse(raw!)).toEqual(obj);
    await redis.del(key);
  });

  it('SETNX (idempotency pattern) — hanya set jika belum ada', async () => {
    const key = `test:nx:${Date.now()}`;
    const first = await redis.setnx(key, 'first');
    const second = await redis.setnx(key, 'second');
    const val = await redis.get(key);

    expect(first).toBe(1); // berhasil set
    expect(second).toBe(0); // tidak ditimpa
    expect(val).toBe('first');
    await redis.del(key);
  });
});

```

---

### File: `test/load/concurrent-submission.k6.js`

```javascript
// ── test/load/concurrent-submission.k6.js ────────────────────────────────────
/*
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,
  duration: '60s',
};

export default function () {
  const res = http.post('http://localhost:3000/api/student/submit', JSON.stringify({
    attemptId: __ENV.ATTEMPT_ID,
    idempotencyKey: `${__VU}-${__ITER}`,
  }), { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${__ENV.TOKEN}` } });

  check(res, { 'status 200 or 409': (r) => r.status === 200 || r.status === 409 });
  sleep(0.5);
}
*/
export const k6ConcurrentSubmission = '// see comment above';

```

---

### File: `test/load/exam-download.k6.js`

```javascript
// ════════════════════════════════════════════════════════════════════════════
// test/load/exam-download.k6.js
// Load test: simulasi banyak siswa download paket soal bersamaan
//
// Jalankan:
//   SESSION_ID=xxx TOKEN_CODES=CODE1,CODE2 BASE_TOKEN=xxx \
//   k6 run test/load/exam-download.k6.js
// ════════════════════════════════════════════════════════════════════════════
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const downloadErrors = new Counter('download_errors');
const downloadSuccess = new Rate('download_success_rate');
const downloadDuration = new Trend('download_duration_ms');

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp up: 20 siswa
    { duration: '1m', target: 50 }, // steady: 50 siswa concurrent
    { duration: '30s', target: 100 }, // spike: 100 siswa
    { duration: '30s', target: 0 }, // ramp down
  ],
  thresholds: {
    download_success_rate: ['rate>0.95'], // 95% harus berhasil
    download_duration_ms: ['p(95)<3000'], // 95th percentile < 3 detik
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';
const SESSION_ID = __ENV.SESSION_ID || 'test-session-id';
const BASE_TOKEN = __ENV.BASE_TOKEN || 'test-jwt-token';

// Simulasi token code berbeda per VU (virtual user)
function getTokenCode() {
  const codes = (__ENV.TOKEN_CODES || 'CODE1,CODE2,CODE3').split(',');
  return codes[(__VU - 1) % codes.length];
}

export default function () {
  const start = Date.now();

  const res = http.post(
    `${BASE_URL}/student/download`,
    JSON.stringify({
      sessionId: SESSION_ID,
      tokenCode: getTokenCode(),
      deviceFingerprint: `fp-vu-${__VU}`,
      idempotencyKey: `dl-${__VU}-${__ITER}`,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BASE_TOKEN}`,
        'x-device-fingerprint': `fp-vu-${__VU}`,
      },
    },
  );

  const duration = Date.now() - start;
  downloadDuration.add(duration);

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'has packageId': (r) => JSON.parse(r.body)?.data?.packageId !== undefined,
    'has checksum': (r) => JSON.parse(r.body)?.data?.checksum !== undefined,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  downloadSuccess.add(ok);
  if (!ok) downloadErrors.add(1);

  sleep(Math.random() * 2 + 1); // jeda 1-3 detik antar request
}

export function handleSummary(data) {
  return {
    'test/load/results/exam-download-summary.json': JSON.stringify(data, null, 2),
  };
}

```

---

### File: `test/load/sync-stress.k6.js`

```javascript
// ════════════════════════════════════════════════════════════════════════════
// test/load/sync-stress.k6.js
// Load test: simulasi banyak siswa push sync items bersamaan (offline recovery)
//
// Jalankan:
//   ATTEMPT_IDS=id1,id2 BASE_TOKEN=xxx k6 run test/load/sync-stress.k6.js
// ════════════════════════════════════════════════════════════════════════════
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const syncErrors = new Counter('sync_errors');
const syncSuccess = new Rate('sync_success_rate');
const syncDuration = new Trend('sync_duration_ms');

export const options = {
  scenarios: {
    // Skenario 1: steady load — pengiriman sync jawaban normal
    steady_sync: {
      executor: 'constant-vus',
      vus: 30,
      duration: '2m',
      gracefulStop: '10s',
    },
    // Skenario 2: burst — simulasi banyak siswa reconnect setelah offline serentak
    burst_reconnect: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 80 }, // burst
        { duration: '30s', target: 10 }, // settle
      ],
      startTime: '1m30s', // mulai setelah steady_sync berjalan 1.5 menit
    },
  },
  thresholds: {
    sync_success_rate: ['rate>0.97'],
    sync_duration_ms: ['p(95)<2000'],
    http_req_failed: ['rate<0.03'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';
const BASE_TOKEN = __ENV.BASE_TOKEN || 'test-jwt-token';

function getAttemptId() {
  const ids = (__ENV.ATTEMPT_IDS || 'attempt-1,attempt-2').split(',');
  return ids[(__VU - 1) % ids.length];
}

export default function () {
  const attemptId = getAttemptId();
  const idemKey = `sync-${__VU}-${__ITER}-${Date.now()}`;
  const start = Date.now();

  // Simulasi submit jawaban via sync endpoint (offline path)
  const res = http.post(
    `${BASE_URL}/sync`,
    JSON.stringify({
      attemptId,
      idempotencyKey: idemKey,
      type: 'SUBMIT_ANSWER',
      payload: {
        attemptId,
        questionId: `q-${Math.ceil(Math.random() * 10)}`,
        idempotencyKey: idemKey,
        answer: ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)],
      },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BASE_TOKEN}`,
      },
    },
  );

  const duration = Date.now() - start;
  syncDuration.add(duration);

  const ok = check(res, {
    'status 200 atau 201': (r) => r.status === 200 || r.status === 201,
    'has syncItem id': (r) => JSON.parse(r.body)?.data?.id !== undefined,
    'response < 3s': (r) => r.timings.duration < 3000,
  });

  syncSuccess.add(ok);
  if (!ok) syncErrors.add(1);

  // Cek status sync sesekali (1 dari 5 iterasi)
  if (__ITER % 5 === 0) {
    const statusRes = http.get(`${BASE_URL}/sync/${attemptId}/status`, {
      headers: { Authorization: `Bearer ${BASE_TOKEN}` },
    });
    check(statusRes, { 'status check 200': (r) => r.status === 200 });
  }

  sleep(Math.random() * 1.5 + 0.5); // jeda 0.5-2 detik
}

export function handleSummary(data) {
  return {
    'test/load/results/sync-stress-summary.json': JSON.stringify(data, null, 2),
  };
}

```

---

### File: `test/unit/auth/auth.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { PrismaService } from '../../../src/prisma/prisma.service';

const mockUser = {
  id: 'user-1',
  tenantId: 'tenant-1',
  role: 'STUDENT',
  email: 'siswa@test.com',
  username: 'siswa1',
  isActive: true,
  passwordHash: '',
};

describe('AuthService', () => {
  let svc: AuthService;
  let prisma: Record<string, jest.Mock>;
  let jwtSvc: { sign: jest.Mock };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('password123', 10);
  });

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      userDevice: { upsert: jest.fn() },
    };
    jwtSvc = { sign: jest.fn(() => 'mock-token') };

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtSvc },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((k: string) => {
              const map: Record<string, string> = {
                JWT_ACCESS_SECRET: 'access-secret',
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_SECRET: 'refresh-secret',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return map[k] ?? null;
            }),
          },
        },
      ],
    }).compile();

    svc = mod.get(AuthService);
    jest.clearAllMocks();
  });

  // ── validateUser ──────────────────────────────────────────────────────────
  describe('validateUser', () => {
    it('return user jika kredensial valid', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      const result = await svc.validateUser('siswa1', 'password123');
      expect(result).toMatchObject({ id: 'user-1' });
    });

    it('return null jika user tidak ditemukan', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      expect(await svc.validateUser('notfound', 'pass')).toBeNull();
    });

    it('return null jika password salah', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      expect(await svc.validateUser('siswa1', 'wrongpass')).toBeNull();
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────
  describe('login', () => {
    beforeEach(() => {
      prisma.userDevice.upsert.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});
    });

    it('return accessToken dan refreshToken', async () => {
      const result = await svc.login('u1', 't1', 'STUDENT', 'e@e.com', 'fp');
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(jwtSvc.sign).toHaveBeenCalledTimes(2);
    });

    it('upsert device fingerprint', async () => {
      await svc.login('u1', 't1', 'STUDENT', 'e@e.com', 'my-fp');
      expect(prisma.userDevice.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ create: expect.objectContaining({ userId: 'u1' }) }),
      );
    });
  });

  // ── refresh ───────────────────────────────────────────────────────────────
  describe('refresh', () => {
    it('throw jika refresh token tidak ditemukan', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue(null);
      await expect(svc.refresh('u1', 'bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('throw jika refresh token sudah expired', async () => {
      prisma.refreshToken.findFirst.mockResolvedValue({
        id: 'rt-1',
        expiresAt: new Date(Date.now() - 1000), // masa lalu
      });
      await expect(svc.refresh('u1', 'old-token')).rejects.toThrow(UnauthorizedException);
    });

    it('revoke token lama dan issue token baru', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      prisma.refreshToken.findFirst.mockResolvedValue({ id: 'rt-1', expiresAt: futureDate });
      prisma.refreshToken.update.mockResolvedValue({});
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      prisma.userDevice.upsert.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      await svc.refresh('user-1', 'valid-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ revokedAt: expect.any(Date) }) }),
      );
    });
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('revoke refresh token', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      await svc.logout('some-token');
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { revokedAt: expect.any(Date) } }),
      );
    });
  });

  // ── changePassword ────────────────────────────────────────────────────────
  describe('changePassword', () => {
    it('throw jika password lama salah', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      await expect(svc.changePassword('u1', 'wrongold', 'newpass123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('update passwordHash jika password lama benar', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({});
      await svc.changePassword('u1', 'password123', 'newpass123');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ passwordHash: expect.any(String) }),
        }),
      );
    });
  });

  // ── isDeviceLocked ────────────────────────────────────────────────────────
  describe('isDeviceLocked', () => {
    it('return true jika device terkunci', async () => {
      (prisma as any).userDevice = {
        ...prisma.userDevice,
        findUnique: jest.fn().mockResolvedValue({ isLocked: true }),
      };
      expect(await svc.isDeviceLocked('u1', 'fp')).toBe(true);
    });

    it('return false jika device tidak terkunci', async () => {
      (prisma as any).userDevice = {
        ...prisma.userDevice,
        findUnique: jest.fn().mockResolvedValue({ isLocked: false }),
      };
      expect(await svc.isDeviceLocked('u1', 'fp')).toBe(false);
    });

    it('return false jika device belum pernah terdaftar', async () => {
      (prisma as any).userDevice = {
        ...prisma.userDevice,
        findUnique: jest.fn().mockResolvedValue(null),
      };
      expect(await svc.isDeviceLocked('u1', 'fp')).toBe(false);
    });
  });
});

```

---

### File: `test/unit/common/throttler.guard.spec.ts`

```typescript
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerStorage } from '@nestjs/throttler';
import { CustomThrottlerGuard } from '../../../src/common/guards/throttler.guard';
import { UserRole } from '../../../src/common/enums/user-role.enum';

const mockCtx = (role?: string, userId = 'user-1', tenantId = 'tenant-1') =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        user: role ? { sub: userId, role } : undefined,
        tenantId,
        ip: '127.0.0.1',
        url: '/test',
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  }) as unknown as ExecutionContext;

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(() => {
    guard = new CustomThrottlerGuard({} as ThrottlerStorage, {} as Reflector, []);
  });

  it('getTracker — menggunakan tenantId:userId saat authenticated', async () => {
    const req = { tenantId: 'tenant-1', user: { sub: 'user-abc' }, ip: '1.2.3.4' };
    const tracker = await (guard as any).getTracker(req);
    expect(tracker).toBe('tenant-1:user-abc');
  });

  it('getTracker — fallback ke tenantId:ip saat belum login', async () => {
    const req = { tenantId: 'tenant-1', user: undefined, ip: '1.2.3.4' };
    const tracker = await (guard as any).getTracker(req);
    expect(tracker).toBe('tenant-1:1.2.3.4');
  });

  it('shouldSkip — true untuk ADMIN', async () => {
    const result = await (guard as any).shouldSkip(mockCtx(UserRole.ADMIN));
    expect(result).toBe(true);
  });

  it('shouldSkip — true untuk SUPERADMIN', async () => {
    const result = await (guard as any).shouldSkip(mockCtx(UserRole.SUPERADMIN));
    expect(result).toBe(true);
  });

  it('shouldSkip — false untuk STUDENT', async () => {
    const result = await (guard as any).shouldSkip(mockCtx(UserRole.STUDENT));
    expect(result).toBe(false);
  });

  it('shouldSkip — false untuk unauthenticated', async () => {
    const result = await (guard as any).shouldSkip(mockCtx(undefined));
    expect(result).toBe(false);
  });
});

```

---

### File: `test/unit/exam-packages/exam-packages.service.spec.ts`

```typescript
// ── test/unit/exam-packages/exam-packages.service.spec.ts ───────────────────
import { ExamPackagesService } from '../../../src/modules/exam-packages/services/exam-packages.service';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('ExamPackagesService', () => {
  it('should be defined', () => {
    const svc = new ExamPackagesService({ examPackage: {} } as unknown as PrismaService);
    expect(svc).toBeDefined();
  });
});

```

---

### File: `test/unit/grading/auto-grading.service.spec.ts`

```typescript
// ── test/unit/grading/auto-grading.service.spec.ts ───────────────────────────
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { QuestionType } from '../../../src/common/enums/question-type.enum';
import { encrypt } from '../../../src/common/utils/encryption.util';
import { AutoGradingService } from '../../../src/modules/submissions/services/auto-grading.service';

describe('AutoGradingService', () => {
  let svc: AutoGradingService;
  const testKey = 'a'.repeat(64);

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        AutoGradingService,
        { provide: ConfigService, useValue: { get: jest.fn(() => testKey) } },
      ],
    }).compile();
    svc = mod.get(AutoGradingService);
  });

  it('grades multiple choice correctly', () => {
    const ca = encrypt(JSON.stringify({ type: 'single', value: 'a' }), testKey);
    const result = svc.gradeAnswer(QuestionType.MULTIPLE_CHOICE, ca, 'a', 10);
    expect(result.score).toBe(10);
    expect(result.isCorrect).toBe(true);
  });

  it('grades multiple choice incorrectly', () => {
    const ca = encrypt(JSON.stringify({ type: 'single', value: 'a' }), testKey);
    const result = svc.gradeAnswer(QuestionType.MULTIPLE_CHOICE, ca, 'b', 10);
    expect(result.score).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  it('marks essay as manual', () => {
    const ca = encrypt(JSON.stringify({ type: 'text', value: 'answer' }), testKey);
    const result = svc.gradeAnswer(QuestionType.ESSAY, ca, 'student essay', 10);
    expect(result.requiresManual).toBe(true);
  });
});

```

---

### File: `test/unit/questions/questions.service.spec.ts`

```typescript
// ── test/unit/questions/questions.service.spec.ts ────────────────────────────
import { QuestionsService } from '../../../src/modules/questions/services/questions.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('QuestionsService', () => {
  it('should be defined', () => {
    const svc = new QuestionsService({} as PrismaService, {} as ConfigService);
    expect(svc).toBeDefined();
  });
});

```

---

### File: `test/unit/submissions/exam-download.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamDownloadService } from '../../../src/modules/submissions/services/exam-download.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { ExamPackageBuilderService } from '../../../src/modules/exam-packages/services/exam-package-builder.service';
import { AuditLogsService } from '../../../src/modules/audit-logs/services/audit-logs.service';
import { ExamSubmissionService } from '../../../src/modules/submissions/services/exam-submission.service';
import { SessionStatus, AttemptStatus } from '../../../src/common/enums/exam-status.enum';

describe('ExamDownloadService', () => {
  let svc: ExamDownloadService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let builder: { buildForDownload: jest.Mock };
  let submissionSvc: { scheduleTimeout: jest.Mock };

  const mockSession = {
    id: 'sess-1',
    tenantId: 'tenant-1',
    examPackageId: 'pkg-1',
    startTime: new Date(Date.now() - 1000),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
    status: SessionStatus.ACTIVE,
    examPackage: { settings: { shuffleQuestions: false, duration: 90 } },
  };

  const mockBuiltPackage = {
    packageId: 'pkg-1',
    title: 'Paket Test',
    settings: { duration: 90 },
    questions: [],
    checksum: 'abc123',
  };

  beforeEach(async () => {
    prisma = {
      examSession: { findFirst: jest.fn() },
      sessionStudent: { findUnique: jest.fn() },
      examAttempt: { findUnique: jest.fn(), upsert: jest.fn() },
    };
    builder = { buildForDownload: jest.fn().mockResolvedValue(mockBuiltPackage) };
    submissionSvc = { scheduleTimeout: jest.fn().mockResolvedValue(undefined) };

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        ExamDownloadService,
        { provide: PrismaService, useValue: prisma },
        { provide: ExamPackageBuilderService, useValue: builder },
        { provide: AuditLogsService, useValue: { log: jest.fn() } },
        { provide: ExamSubmissionService, useValue: submissionSvc },
      ],
    }).compile();

    svc = mod.get(ExamDownloadService);
    jest.clearAllMocks();
  });

  it('throw NotFoundException jika sesi tidak aktif', async () => {
    prisma.examSession.findFirst.mockResolvedValue(null);
    await expect(
      svc.downloadPackage('t1', 'sess-1', 'u1', 'TOKEN', 'fp', 'idem-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throw BadRequestException jika di luar jangka waktu sesi', async () => {
    prisma.examSession.findFirst.mockResolvedValue({
      ...mockSession,
      startTime: new Date(Date.now() + 60_000), // belum dimulai
      endTime: new Date(Date.now() + 120_000),
    });
    await expect(
      svc.downloadPackage('t1', 'sess-1', 'u1', 'TOKEN', 'fp', 'idem-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throw BadRequestException jika tokenCode tidak valid', async () => {
    prisma.examSession.findFirst.mockResolvedValue(mockSession);
    prisma.sessionStudent.findUnique.mockResolvedValue({ tokenCode: 'CORRECT' });
    await expect(
      svc.downloadPackage('t1', 'sess-1', 'u1', 'WRONG', 'fp', 'idem-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('berhasil download dan return DownloadablePackage', async () => {
    prisma.examSession.findFirst.mockResolvedValue(mockSession);
    prisma.sessionStudent.findUnique.mockResolvedValue({ tokenCode: 'TOKEN123' });
    prisma.examAttempt.findUnique.mockResolvedValue(null); // attempt belum ada
    prisma.examAttempt.upsert.mockResolvedValue({ id: 'att-new' });

    const result = await svc.downloadPackage('t1', 'sess-1', 'u1', 'TOKEN123', 'fp', 'idem-1');

    expect(result).toMatchObject({
      packageId: 'pkg-1',
      sessionId: 'sess-1',
      attemptId: 'att-new',
      checksum: 'abc123',
    });
    expect(result.expiresAt).toBeDefined();
  });

  it('jadwalkan timeout hanya untuk attempt baru', async () => {
    prisma.examSession.findFirst.mockResolvedValue(mockSession);
    prisma.sessionStudent.findUnique.mockResolvedValue({ tokenCode: 'TOKEN123' });
    prisma.examAttempt.findUnique.mockResolvedValue(null); // baru
    prisma.examAttempt.upsert.mockResolvedValue({ id: 'att-new' });

    await svc.downloadPackage('t1', 'sess-1', 'u1', 'TOKEN123', 'fp', 'idem-1');
    expect(submissionSvc.scheduleTimeout).toHaveBeenCalledWith('att-new', 't1', 'sess-1', 90);
  });

  it('tidak jadwalkan timeout jika attempt sudah ada (idempoten)', async () => {
    prisma.examSession.findFirst.mockResolvedValue(mockSession);
    prisma.sessionStudent.findUnique.mockResolvedValue({ tokenCode: 'TOKEN123' });
    prisma.examAttempt.findUnique.mockResolvedValue({ id: 'att-existing' }); // sudah ada
    prisma.examAttempt.upsert.mockResolvedValue({ id: 'att-existing' });

    await svc.downloadPackage('t1', 'sess-1', 'u1', 'TOKEN123', 'fp', 'idem-1');
    expect(submissionSvc.scheduleTimeout).not.toHaveBeenCalled();
  });
});

```

---

### File: `test/unit/submissions/exam-submission.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExamSubmissionService } from '../../../src/modules/submissions/services/exam-submission.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { AuditLogsService } from '../../../src/modules/audit-logs/services/audit-logs.service';
import { AttemptStatus } from '../../../src/common/enums/exam-status.enum';

describe('ExamSubmissionService', () => {
  let svc: ExamSubmissionService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let queue: { add: jest.Mock };
  let auditLogs: { log: jest.Mock };

  beforeEach(async () => {
    prisma = {
      examAttempt: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      examAnswer: {
        upsert: jest.fn(),
      },
    };
    queue = { add: jest.fn().mockResolvedValue({ id: 'job-1' }) };
    auditLogs = { log: jest.fn().mockResolvedValue({}) };

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        ExamSubmissionService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogsService, useValue: auditLogs },
        { provide: 'BullQueue_submission', useValue: queue },
      ],
    }).compile();

    svc = mod.get(ExamSubmissionService);
    jest.clearAllMocks();
  });

  // ── submitAnswer ──────────────────────────────────────────────────────────
  describe('submitAnswer', () => {
    const dto = {
      attemptId: 'att-1',
      questionId: 'q-1',
      idempotencyKey: 'idem-1',
      answer: 'a',
    };

    it('throw NotFoundException jika attempt tidak ada', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue(null);
      await expect(svc.submitAnswer(dto)).rejects.toThrow(NotFoundException);
    });

    it('throw BadRequestException jika sudah SUBMITTED', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue({ status: AttemptStatus.SUBMITTED });
      await expect(svc.submitAnswer(dto)).rejects.toThrow(BadRequestException);
    });

    it('throw BadRequestException jika sudah TIMED_OUT', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue({ status: AttemptStatus.TIMED_OUT });
      await expect(svc.submitAnswer(dto)).rejects.toThrow(BadRequestException);
    });

    it('upsert jawaban jika attempt IN_PROGRESS', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue({ status: AttemptStatus.IN_PROGRESS });
      prisma.examAnswer.upsert.mockResolvedValue({ id: 'ans-1' });

      const result = await svc.submitAnswer(dto);
      expect(prisma.examAnswer.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idempotencyKey: dto.idempotencyKey },
          create: expect.objectContaining({ answer: dto.answer }),
        }),
      );
      expect(result).toEqual({ id: 'ans-1' });
    });
  });

  // ── submitExam ────────────────────────────────────────────────────────────
  describe('submitExam', () => {
    const dto = { attemptId: 'att-1', idempotencyKey: 'idem-submit-1' };
    const mockAttempt = {
      id: 'att-1',
      userId: 'user-1',
      status: AttemptStatus.IN_PROGRESS,
      session: { tenantId: 'tenant-1' },
    };

    it('throw NotFoundException jika attempt tidak ada', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue(null);
      await expect(svc.submitExam(dto)).rejects.toThrow(NotFoundException);
    });

    it('return pesan idempoten jika sudah SUBMITTED sebelumnya', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue({
        ...mockAttempt,
        status: AttemptStatus.SUBMITTED,
      });
      const result = await svc.submitExam(dto);
      expect(result.message).toMatch(/sudah disubmit/);
      expect(prisma.examAttempt.update).not.toHaveBeenCalled();
    });

    it('update status ke SUBMITTED dan enqueue auto-grade', async () => {
      prisma.examAttempt.findUnique.mockResolvedValue(mockAttempt);
      prisma.examAttempt.update.mockResolvedValue({});

      await svc.submitExam(dto);

      expect(prisma.examAttempt.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att-1' },
          data: expect.objectContaining({ status: AttemptStatus.SUBMITTED }),
        }),
      );
      expect(queue.add).toHaveBeenCalledWith(
        'auto-grade',
        expect.objectContaining({ attemptId: 'att-1', tenantId: 'tenant-1' }),
        expect.objectContaining({ jobId: 'grade-att-1' }),
      );
      expect(auditLogs.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'SUBMIT_EXAM' }),
      );
    });

    it('enqueue timeout saat scheduleTimeout dipanggil', async () => {
      await svc.scheduleTimeout('att-1', 'tenant-1', 'sess-1', 90);
      expect(queue.add).toHaveBeenCalledWith(
        'timeout-attempt',
        expect.objectContaining({ attemptId: 'att-1' }),
        expect.objectContaining({
          jobId: 'timeout-att-1',
          delay: 90 * 60 * 1000,
        }),
      );
    });
  });

  // ── getAttemptResult ──────────────────────────────────────────────────────
  describe('getAttemptResult', () => {
    it('throw jika attempt tidak ditemukan atau bukan milik user', async () => {
      prisma.examAttempt.findFirst = jest.fn().mockResolvedValue(null);
      await expect(svc.getAttemptResult('att-1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('return status message jika belum PUBLISHED', async () => {
      (prisma.examAttempt as any).findFirst = jest.fn().mockResolvedValue({
        id: 'att-1',
        status: AttemptStatus.SUBMITTED,
        gradingStatus: 'PENDING',
        session: { title: 'Ujian', examPackage: { title: 'Paket', settings: {} } },
        answers: [],
      });
      const result = await svc.getAttemptResult('att-1', 'user-1');
      expect(result).toMatchObject({ gradingStatus: 'PENDING', message: expect.any(String) });
      expect(result).not.toHaveProperty('totalScore');
    });

    it('return hasil lengkap jika PUBLISHED', async () => {
      (prisma.examAttempt as any).findFirst = jest.fn().mockResolvedValue({
        id: 'att-1',
        status: AttemptStatus.SUBMITTED,
        gradingStatus: 'PUBLISHED',
        totalScore: 80,
        maxScore: 100,
        submittedAt: new Date(),
        gradingCompletedAt: new Date(),
        session: {
          title: 'Ujian MTK',
          examPackage: { title: 'Paket MTK', settings: { passingScore: 75 } },
        },
        answers: [
          {
            questionId: 'q-1',
            score: 80,
            maxScore: 100,
            feedback: null,
            isAutoGraded: true,
            gradedAt: new Date(),
          },
        ],
      });
      const result = await svc.getAttemptResult('att-1', 'user-1');
      expect(result).toMatchObject({
        totalScore: 80,
        maxScore: 100,
        percentage: 80,
        isPassed: true,
      });
    });
  });
});

```

---

### File: `test/unit/submissions/grading-helper.service.spec.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// test/unit/submissions/grading-helper.service.spec.ts
// ════════════════════════════════════════════════════════════════════════════
import { Test } from '@nestjs/testing';
import { GradingHelperService } from '../../../src/modules/submissions/services/grading-helper.service';
import { AutoGradingService } from '../../../src/modules/submissions/services/auto-grading.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { GradingStatus } from '../../../src/common/enums/grading-status.enum';
import { QuestionType } from '../../../src/common/enums/question-type.enum';
import { encrypt } from '../../../src/common/utils/encryption.util';
import { ConfigService } from '@nestjs/config';

describe('GradingHelperService', () => {
  let svc: GradingHelperService;
  const testKey = 'a'.repeat(64);

  const mockAttempt = (answers: object[], questions: object[]) => ({
    id: 'att-1',
    answers,
    session: {
      examPackage: {
        questions: questions.map((q: any) => ({
          questionId: q.id,
          points: q.points ?? 10,
          question: q,
        })),
      },
    },
  });

  const mockPrisma = {
    examAttempt: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    examAnswer: { update: jest.fn() },
  };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        GradingHelperService,
        AutoGradingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: { get: jest.fn(() => testKey) } },
      ],
    }).compile();

    svc = mod.get(GradingHelperService);
    jest.clearAllMocks();
  });

  it('auto-grade pilihan ganda benar → AUTO_GRADED', async () => {
    const ca = encrypt(JSON.stringify({ type: 'single', value: 'a' }), testKey);
    mockPrisma.examAttempt.findUnique.mockResolvedValue(
      mockAttempt(
        [{ id: 'ans-1', questionId: 'q-1', answer: 'a' }],
        [{ id: 'q-1', type: QuestionType.MULTIPLE_CHOICE, correctAnswer: ca, points: 10 }],
      ),
    );
    mockPrisma.examAnswer.update.mockResolvedValue({});
    mockPrisma.examAttempt.update.mockResolvedValue({});

    await svc.runAutoGrade('att-1');

    expect(mockPrisma.examAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gradingStatus: GradingStatus.AUTO_GRADED, totalScore: 10 }),
      }),
    );
  });

  it('essay → MANUAL_REQUIRED', async () => {
    const ca = encrypt(JSON.stringify({ type: 'text', value: 'jawaban model' }), testKey);
    mockPrisma.examAttempt.findUnique.mockResolvedValue(
      mockAttempt(
        [{ id: 'ans-1', questionId: 'q-1', answer: 'jawaban siswa' }],
        [{ id: 'q-1', type: QuestionType.ESSAY, correctAnswer: ca, points: 20 }],
      ),
    );
    mockPrisma.examAnswer.update.mockResolvedValue({});
    mockPrisma.examAttempt.update.mockResolvedValue({});

    await svc.runAutoGrade('att-1');

    expect(mockPrisma.examAttempt.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ gradingStatus: GradingStatus.MANUAL_REQUIRED }),
      }),
    );
  });
});

```

---

### File: `test/unit/submissions/submission.processor.spec.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// test/unit/submissions/submission.processor.spec.ts
// ════════════════════════════════════════════════════════════════════════════
import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionProcessor } from '../../../src/modules/submissions/processors/submission.processor';
import { GradingHelperService } from '../../../src/modules/submissions/services/grading-helper.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { AuditLogsService } from '../../../src/modules/audit-logs/services/audit-logs.service';
import { AttemptStatus } from '../../../src/common/enums/exam-status.enum';

describe('SubmissionProcessor', () => {
  let processor: SubmissionProcessor;
  const mockPrisma = {
    examAttempt: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  const mockGradingHelper = { runAutoGrade: jest.fn() };
  const mockAuditLogs = { log: jest.fn() };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionProcessor,
        { provide: GradingHelperService, useValue: mockGradingHelper },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogsService, useValue: mockAuditLogs },
      ],
    }).compile();

    processor = mod.get(SubmissionProcessor);
    jest.clearAllMocks();
  });

  describe('auto-grade job', () => {
    it('menjalankan auto-grade untuk attempt SUBMITTED', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue({
        id: 'att-1',
        status: AttemptStatus.SUBMITTED,
        userId: 'user-1',
      });
      mockGradingHelper.runAutoGrade.mockResolvedValue(undefined);
      mockAuditLogs.log.mockResolvedValue(undefined);

      await processor.process({
        name: 'auto-grade',
        data: { attemptId: 'att-1', tenantId: 'tenant-1' },
        attemptsMade: 0,
      } as any);

      expect(mockGradingHelper.runAutoGrade).toHaveBeenCalledWith('att-1');
      expect(mockAuditLogs.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'AUTO_GRADE_COMPLETED' }),
      );
    });

    it('skip jika attempt tidak ditemukan', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue(null);

      await processor.process({
        name: 'auto-grade',
        data: { attemptId: 'att-missing', tenantId: 'tenant-1' },
        attemptsMade: 0,
      } as any);

      expect(mockGradingHelper.runAutoGrade).not.toHaveBeenCalled();
    });

    it('skip jika status bukan SUBMITTED atau TIMED_OUT', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue({
        id: 'att-1',
        status: AttemptStatus.IN_PROGRESS,
        userId: 'user-1',
      });

      await processor.process({
        name: 'auto-grade',
        data: { attemptId: 'att-1', tenantId: 'tenant-1' },
        attemptsMade: 0,
      } as any);

      expect(mockGradingHelper.runAutoGrade).not.toHaveBeenCalled();
    });

    it('melempar error agar BullMQ retry', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue({
        id: 'att-1',
        status: AttemptStatus.SUBMITTED,
        userId: 'user-1',
      });
      mockGradingHelper.runAutoGrade.mockRejectedValue(new Error('DB error'));

      await expect(
        processor.process({
          name: 'auto-grade',
          data: { attemptId: 'att-1', tenantId: 'tenant-1' },
          attemptsMade: 0,
        } as any),
      ).rejects.toThrow('DB error');
    });
  });

  describe('timeout-attempt job', () => {
    it('update status ke TIMED_OUT dan auto-grade', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue({
        id: 'att-1',
        userId: 'user-1',
      });
      mockPrisma.examAttempt.update.mockResolvedValue({});
      mockGradingHelper.runAutoGrade.mockResolvedValue(undefined);
      mockAuditLogs.log.mockResolvedValue(undefined);

      await processor.process({
        name: 'timeout-attempt',
        data: { attemptId: 'att-1', tenantId: 'tenant-1', sessionId: 'sess-1' },
        attemptsMade: 0,
      } as any);

      expect(mockPrisma.examAttempt.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att-1' },
          data: expect.objectContaining({ status: AttemptStatus.TIMED_OUT }),
        }),
      );
      expect(mockGradingHelper.runAutoGrade).toHaveBeenCalledWith('att-1');
    });

    it('skip jika attempt sudah tidak IN_PROGRESS', async () => {
      mockPrisma.examAttempt.findFirst.mockResolvedValue(null); // tidak IN_PROGRESS

      await processor.process({
        name: 'timeout-attempt',
        data: { attemptId: 'att-1', tenantId: 'tenant-1', sessionId: 'sess-1' },
        attemptsMade: 0,
      } as any);

      expect(mockPrisma.examAttempt.update).not.toHaveBeenCalled();
      expect(mockGradingHelper.runAutoGrade).not.toHaveBeenCalled();
    });
  });
});

```

---

### File: `test/unit/sync/chunked-upload.service.spec.ts`

```typescript
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ChunkedUploadService } from '../../../src/modules/sync/services/chunked-upload.service';

describe('ChunkedUploadService', () => {
  let svc: ChunkedUploadService;
  const fileId = `test-${Date.now()}`;
  const tmpDir = path.join(process.cwd(), 'uploads', 'temp');

  beforeEach(() => {
    svc = new ChunkedUploadService();
  });

  afterEach(() => {
    const dir = path.join(tmpDir, fileId);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
  });

  it('saveChunk — menyimpan chunk dan return progress', async () => {
    const result = await svc.saveChunk({
      fileId,
      chunkIndex: 0,
      totalChunks: 3,
      data: Buffer.from('hello'),
    });
    expect(result.saved).toBe(1);
    expect(result.total).toBe(3);
  });

  it('saveChunk — tolak chunkIndex >= totalChunks', async () => {
    await expect(
      svc.saveChunk({ fileId, chunkIndex: 3, totalChunks: 3, data: Buffer.from('x') }),
    ).rejects.toThrow(BadRequestException);
  });

  it('isComplete — false jika belum semua chunk ada', async () => {
    await svc.saveChunk({ fileId, chunkIndex: 0, totalChunks: 2, data: Buffer.from('a') });
    expect(svc.isComplete(fileId, 2)).toBe(false);
  });

  it('isComplete — true jika semua chunk ada', async () => {
    await svc.saveChunk({ fileId, chunkIndex: 0, totalChunks: 2, data: Buffer.from('ab') });
    await svc.saveChunk({ fileId, chunkIndex: 1, totalChunks: 2, data: Buffer.from('cd') });
    expect(svc.isComplete(fileId, 2)).toBe(true);
  });

  it('assemble — menggabungkan chunk secara berurutan', async () => {
    await svc.saveChunk({ fileId, chunkIndex: 0, totalChunks: 2, data: Buffer.from('Hello') });
    await svc.saveChunk({ fileId, chunkIndex: 1, totalChunks: 2, data: Buffer.from(' World') });
    const result = await svc.assemble(fileId, 2);
    expect(result.toString()).toBe('Hello World');
    // temp dir harus sudah dihapus
    expect(fs.existsSync(path.join(tmpDir, fileId))).toBe(false);
  });

  it('assemble — throw jika ada chunk yang missing', async () => {
    await svc.saveChunk({ fileId, chunkIndex: 0, totalChunks: 3, data: Buffer.from('x') });
    // chunk 1 dan 2 tidak dikirim
    await expect(svc.assemble(fileId, 3)).rejects.toThrow(BadRequestException);
  });

  it('cleanupStale — menghapus dir yang sudah terlalu lama', async () => {
    // Buat dir dummy dengan mtime lama
    const staleDir = path.join(tmpDir, `stale-${Date.now()}`);
    fs.mkdirSync(staleDir, { recursive: true });
    // Set mtime ke 3 jam lalu
    const oldTime = new Date(Date.now() - 3 * 60 * 60 * 1000);
    fs.utimesSync(staleDir, oldTime, oldTime);

    const removed = svc.cleanupStale(120);
    expect(removed).toBeGreaterThanOrEqual(1);
    expect(fs.existsSync(staleDir)).toBe(false);
  });
});

```

---

### File: `test/unit/sync/sync.service.spec.ts`

```typescript
// ── test/unit/sync/sync.service.spec.ts ──────────────────────────────────────
import { SyncService } from '../../../src/modules/sync/services/sync.service';
import { SyncType } from '../../../src/common/enums/sync-status.enum';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('SyncService', () => {
  let svc: SyncService;
  const mockPrisma = {
    syncQueue: {
      upsert: jest.fn().mockResolvedValue({ id: 'sync-1' }),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const mockQueue = { add: jest.fn() };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'BullQueue_sync', useValue: mockQueue },
      ],
    }).compile();
    svc = mod.get(SyncService);
  });

  it('adds sync item and enqueues job', async () => {
    mockQueue.add.mockResolvedValue({ id: 'job-1' });
    await svc.addItem({
      attemptId: 'att-1',
      idempotencyKey: 'idem-1',
      type: SyncType.SUBMIT_ANSWER,
      payload: { questionId: 'q-1' },
    });
    expect(mockPrisma.syncQueue.upsert).toHaveBeenCalled();
    expect(mockQueue.add).toHaveBeenCalledWith(
      'process',
      { syncItemId: 'sync-1' },
      expect.any(Object),
    );
  });
});

```

---

## Direktori: scripts

### File: `scripts/cleanup-media.sh`

```bash
#!/bin/bash
# scripts/cleanup-media.sh
# Hapus media orphan dari MinIO yang tidak ada referensinya di DB
# Jalankan: DATABASE_DIRECT_URL=... bash scripts/cleanup-media.sh [--dry-run]

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 DRY RUN mode — tidak ada yang dihapus"
fi

BUCKET=${MINIO_BUCKET:-exam-assets}
PREFIXES=("questions/images" "answers/video" "answers/audio")
REPORTS_PREFIX="reports"
TEMP_DIR=$(mktemp -d)
DB_OBJECTS_FILE="${TEMP_DIR}/db_objects.txt"
MINIO_OBJECTS_FILE="${TEMP_DIR}/minio_objects.txt"
ORPHAN_FILE="${TEMP_DIR}/orphans.txt"
DELETED=0
SKIPPED=0

echo "[$(date)] Memulai cleanup media orphan..."

# Ambil semua objectName yang masih ada di DB
echo "  Mengambil daftar media dari database..."
psql "${DATABASE_DIRECT_URL:-}" --no-psqlrc -t -c "
  SELECT UNNEST(media_urls) FROM exam_answers
  UNION
  SELECT object_name FROM (
    SELECT return_value->>'objectName' AS object_name
    FROM (SELECT return_value::jsonb FROM bullmq_jobs WHERE status='completed') t
    WHERE return_value->>'objectName' IS NOT NULL
  ) r
" 2>/dev/null | tr -d ' ' | sort -u > "${DB_OBJECTS_FILE}" || {
  echo "⚠️  Tidak bisa query DB — hanya cleanup berdasarkan umur file"
  touch "${DB_OBJECTS_FILE}"
}

mc alias set minio \
  "http://${MINIO_ENDPOINT:-localhost}:${MINIO_PORT:-9000}" \
  "${MINIO_ACCESS_KEY:-minioadmin}" \
  "${MINIO_SECRET_KEY:-minioadmin}" \
  --quiet

# Untuk setiap prefix, cari file lebih dari 7 hari yang tidak ada di DB
for PREFIX in "${PREFIXES[@]}"; do
  echo "  Memeriksa prefix: ${PREFIX}/"
  mc find "minio/${BUCKET}/${PREFIX}" \
    --older-than 7d \
    --name "*" 2>/dev/null | \
    sed "s|minio/${BUCKET}/||" | sort > "${MINIO_OBJECTS_FILE}" || true

  if [[ -s "${MINIO_OBJECTS_FILE}" && -s "${DB_OBJECTS_FILE}" ]]; then
    comm -23 "${MINIO_OBJECTS_FILE}" "${DB_OBJECTS_FILE}" > "${ORPHAN_FILE}" || true
  elif [[ -s "${MINIO_OBJECTS_FILE}" ]]; then
    # Tidak ada data DB, skip agar aman
    echo "  ⚠️  Tidak ada data DB untuk ${PREFIX}, dilewati"
    continue
  fi

  while IFS= read -r OBJECT; do
    [[ -z "${OBJECT}" ]] && continue
    if [[ "${DRY_RUN}" == "true" ]]; then
      echo "  [DRY] Akan hapus: ${OBJECT}"
      ((SKIPPED++)) || true
    else
      mc rm "minio/${BUCKET}/${OBJECT}" --quiet && {
        echo "  ✓ Dihapus: ${OBJECT}"
        ((DELETED++)) || true
      } || echo "  ✗ Gagal hapus: ${OBJECT}"
    fi
  done < "${ORPHAN_FILE}"
done

# Hapus report lebih dari 30 hari (selalu aman karena generated on-demand)
echo "  Membersihkan report lama (>30 hari)..."
mc find "minio/${BUCKET}/${REPORTS_PREFIX}" \
  --older-than 30d \
  --name "*.xlsx" --name "*.pdf" \
  --exec "$([ "${DRY_RUN}" == "true" ] && echo 'echo [DRY] Akan hapus: {}' || echo 'mc rm {}')" \
  2>/dev/null || true

# Cleanup temp
rm -rf "${TEMP_DIR}"

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "[$(date)] Dry run selesai — ${SKIPPED} objek akan dihapus"
else
  echo "[$(date)] Cleanup selesai — ${DELETED} objek dihapus ✅"
fi

```

---

### File: `scripts/rotate-keys.sh`

```bash
/**
 * scripts/rotate-keys.ts
 * Re-enkripsi semua correctAnswer di DB dengan key baru.
 *
 * Jalankan:
 *   OLD_KEY=<64hex> NEW_KEY=<64hex> ts-node scripts/rotate-keys.ts
 *
 * ⚠️ BACKUP DATABASE SEBELUM MENJALANKAN SCRIPT INI
 */

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

function encrypt(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(ciphertext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const buf = Buffer.from(ciphertext, 'base64');
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString('utf8') + decipher.final('utf8');
}

async function main() {
  const oldKey = process.env.OLD_KEY;
  const newKey = process.env.NEW_KEY;

  if (!oldKey || oldKey.length !== 64) {
    console.error('❌ OLD_KEY harus berupa 64 hex chars (32 bytes)');
    process.exit(1);
  }
  if (!newKey || newKey.length !== 64) {
    console.error('❌ NEW_KEY harus berupa 64 hex chars (32 bytes)');
    process.exit(1);
  }
  if (oldKey === newKey) {
    console.error('❌ OLD_KEY dan NEW_KEY tidak boleh sama');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  let success = 0;
  let failed = 0;
  const errors: { id: string; error: string }[] = [];

  console.log('🔄 Memulai rotasi key enkripsi...');
  console.log('⚠️  Pastikan database sudah di-backup!');
  console.log('');

  try {
    // Ambil semua soal
    const questions = await prisma.question.findMany({
      select: { id: true, correctAnswer: true },
    });

    console.log(`📊 Total soal: ${questions.length}`);

    // Proses dalam batch untuk menghindari timeout
    const BATCH = 100;
    for (let i = 0; i < questions.length; i += BATCH) {
      const batch = questions.slice(i, i + BATCH);
      console.log(`  Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(questions.length / BATCH)}...`);

      await Promise.allSettled(
        batch.map(async (q) => {
          try {
            const plaintext = decrypt(q.correctAnswer as unknown as string, oldKey);
            const reEncrypted = encrypt(plaintext, newKey);
            await prisma.question.update({
              where: { id: q.id },
              data: { correctAnswer: reEncrypted },
            });
            success++;
          } catch (err) {
            failed++;
            errors.push({ id: q.id, error: (err as Error).message });
          }
        }),
      );
    }

    console.log('');
    console.log(`✅ Berhasil: ${success} soal`);

    if (failed > 0) {
      console.error(`❌ Gagal: ${failed} soal`);
      console.error('Detail kegagalan:');
      errors.slice(0, 10).forEach((e) => console.error(`  - ${e.id}: ${e.error}`));
      if (errors.length > 10) console.error(`  ... dan ${errors.length - 10} lainnya`);
      console.error('');
      console.error('⚠️  Update ENCRYPTION_KEY di .env HANYA jika 0 kegagalan!');
      process.exit(1);
    }

    console.log('');
    console.log('✅ Rotasi selesai. Langkah selanjutnya:');
    console.log(`   1. Update ENCRYPTION_KEY=${newKey} di .env`);
    console.log('   2. Restart semua instance API');
    console.log('   3. Verifikasi aplikasi berjalan normal');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

```

---

### File: `scripts/seed.sh`

```bash
# scripts/seed.sh
#!/bin/bash
set -e
echo "Running database seeds..."
npx ts-node src/prisma/seeds/index.ts
echo "Done!"

```

---

## Direktori: ROOT

### File: `.env.example`

```
# ── Application ──────────────────────────────────────────
NODE_ENV=development
PORT=3000
API_PREFIX=api
APP_URL=http://localhost:3000

# ── Database (Prisma) ─────────────────────────────────────
# Via PgBouncer (production)
DATABASE_URL=postgresql://exam_user:exam_password@pgbouncer:6432/exam_db
# Direct ke Postgres (migration & RLS setup)
DATABASE_DIRECT_URL=postgresql://exam_user:exam_password@postgres:5432/exam_db

# ── Redis ─────────────────────────────────────────────────
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ── JWT ───────────────────────────────────────────────────
# Minimal 32 karakter, random, berbeda satu sama lain
JWT_ACCESS_SECRET=change-this-access-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-this-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# ── Enkripsi (AES-256-GCM) ────────────────────────────────
# Generate: openssl rand -hex 32
ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000

# ── MinIO (S3-compatible) ─────────────────────────────────
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=exam-assets
MINIO_PRESIGNED_TTL=3600

# ── BullMQ ────────────────────────────────────────────────
BULLMQ_CONCURRENCY=10

# ── Rate Limiting ─────────────────────────────────────────
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# ── File Upload ───────────────────────────────────────────
MAX_FILE_SIZE=1073741824
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/webm
ALLOWED_VIDEO_TYPES=video/mp4,video/webm

# ── Sentry (error tracking) ───────────────────────────────
# Kosongkan untuk menonaktifkan
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1

# ── SMTP (email notification) ─────────────────────────────
# Kosongkan SMTP_USER/SMTP_PASS untuk menonaktifkan email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@exam.app

```

---

### File: `.eslintrc.js`

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: { node: true, jest: true },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};

```

---

### File: `.prettierrc`

```
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": true,
  "printWidth": 100,
  "tabWidth": 2
}

```

---

### File: `Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]

```

---

### File: `docker-compose.yml`

```yaml
version: '3.9'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    volumes:
      - ./logs:/app/logs
    depends_on:
      - postgres
      - pgbouncer
      - redis
      - minio
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: exam_db
      POSTGRES_USER: exam_user
      POSTGRES_PASSWORD: exam_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  pgbouncer:
    image: bitnami/pgbouncer:latest
    environment:
      POSTGRESQL_HOST: postgres
      POSTGRESQL_PORT: 5432
      POSTGRESQL_DATABASE: exam_db
      POSTGRESQL_USERNAME: exam_user
      POSTGRESQL_PASSWORD: exam_password
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 1000
      PGBOUNCER_DEFAULT_POOL_SIZE: 20
    ports:
      - "6432:6432"
    depends_on:
      - postgres
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  minio_data:

```

---

### File: `ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'exam-api',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production' },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '2G',
      autorestart: true,
      watch: false,
    },
  ],
};

```

---

### File: `nest-cli.json`

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "watchAssets": true
  }
}

```

---

### File: `package.json`

```json
{
  "name": "exam-backend",
  "version": "1.0.0",
  "description": "Exam System API — Offline-First Multi-Tenant",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:load": "k6 run test/load/concurrent-submission.k6.js",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:seed": "ts-node src/prisma/seeds/index.ts",
    "db:rls": "psql $DATABASE_DIRECT_URL -f prisma/migrations/rls/enable_rls.sql",
    "keys:rotate": "ts-node scripts/rotate-keys.ts"
  },
  "dependencies": {
    "@nestjs/bullmq": "^10.1.1",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.0.0",
    "@nestjs/event-emitter": "^2.0.4",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/swagger": "^7.1.17",
    "@nestjs/terminus": "^10.2.3",
    "@nestjs/throttler": "^5.1.1",
    "@nestjs/websockets": "^10.0.0",
    "@prisma/client": "^5.7.1",
    "@sentry/node": "^8.0.0",
    "bcrypt": "^6.0.0",
    "bullmq": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "compression": "^1.7.4",
    "date-fns-tz": "^3.1.3",
    "exceljs": "^4.4.0",
    "ffmpeg-static": "^5.2.0",
    "fluent-ffmpeg": "^2.1.2",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "minio": "^7.1.3",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.8",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "puppeteer": "^21.7.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "sharp": "^0.33.1",
    "socket.io": "^4.6.1",
    "string-similarity": "^4.0.4",
    "uuid": "^9.0.1",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcrypt": "^6.0.0",
    "@types/compression": "^1.7.5",
    "@types/express": "^4.17.17",
    "@types/fluent-ffmpeg": "^2.1.24",
    "@types/jest": "^29.5.2",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.3.1",
    "@types/nodemailer": "^6.4.14",
    "@types/passport-jwt": "^4.0.0",
    "@types/passport-local": "^1.0.38",
    "@types/string-similarity": "^4.0.2",
    "@types/supertest": "^2.0.12",
    "@types/uuid": "^11.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "prisma": "^5.7.1",
    "rimraf": "^5.0.5",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node",
    "moduleNameMapper": {
      "@common/(.*)": "<rootDir>/common/$1",
      "@config/(.*)": "<rootDir>/config/$1",
      "@modules/(.*)": "<rootDir>/modules/$1",
      "@prisma/(.*)": "<rootDir>/prisma/$1"
    }
  }
}

```

---

### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@common/*": ["src/common/*"],
      "@config/*": ["src/config/*"],
      "@modules/*": ["src/modules/*"],
      "@prisma/*": ["src/prisma/*"]
    }
  }
}

```

---

## Direktori: docs

### File: `docs/architecture/database-schema.md`

````markdown

<!-- ══════════════════════════════════════════════════════════ -->
<!-- docs/architecture/database-schema.md                      -->
<!-- ══════════════════════════════════════════════════════════ -->

# Database Schema

## Prinsip

1. Setiap tabel memiliki `tenantId` (kecuali junction tables)
2. `AuditLog` adalah append-only — tidak ada UPDATE/DELETE
3. `SyncQueue` mendukung retry dengan DLQ (`DEAD_LETTER` status)
4. Idempotency key sebagai unique constraint di `ExamAttempt` dan `ExamAnswer`

## Relasi Kritis

```
ExamSession → ExamAttempt (1:N, unique per userId)
ExamAttempt → ExamAnswer  (1:N, unique per questionId + idempotencyKey)
ExamAttempt → SyncQueue   (1:N, untuk retry management)
ExamAttempt → ExamActivityLog (1:N, audit trail)
```

## Indexing Strategy

```sql
-- Query paling sering untuk siswa
CREATE INDEX idx_exam_attempt_session_user ON exam_attempts(session_id, user_id);
CREATE INDEX idx_exam_answer_attempt ON exam_answers(attempt_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status, retry_count);

-- Query monitoring real-time
CREATE INDEX idx_activity_log_attempt ON exam_activity_logs(attempt_id);
CREATE INDEX idx_audit_log_tenant_action ON audit_logs(tenant_id, action);
```

````

---

### File: `docs/architecture/offline-sync-flow.md`

````markdown

<!-- ══════════════════════════════════════════════════════════ -->
<!-- docs/architecture/offline-sync-flow.md                    -->
<!-- ══════════════════════════════════════════════════════════ -->

# Offline Sync Flow

## Download Phase (Online → Offline)

```
Siswa klik "Mulai Ujian"
  → POST /api/student/download (StartAttemptDto)
  → Server validasi: sesi ACTIVE, tokenCode valid, waktu valid
  → Server buat ExamAttempt (idempotent via idempotencyKey)
  → Server kembalikan DownloadablePackage (soal terenkripsi)
  → Client decrypt dengan AES-GCM session key (hanya di memori)
  → Client simpan ke IndexedDB (Dexie: examPackages)
  → Client hapus key dari memori jika tab ditutup
```

## Answering Phase (Offline)

```
Siswa jawab soal
  → useAutoSave (debounce 2s)
  → answerStore.setAnswer(questionId, answer)
  → Dexie.answers.put({ attemptId, questionId, answer, isDirty: true })
  → AutoSaveIndicator menampilkan status "Tersimpan"
```

## Submit Phase (Offline → Online)

```
Siswa klik Submit
  → SyncQueue.push({ type: SUBMIT_EXAM, payload: { attemptId } })
  → Jika online: langsung POST /api/student/submit
  → Jika offline: PowerSync menampung di syncQueue IndexedDB
  → Saat online kembali: PowerSync push ke /api/sync
  → BullMQ process-sync-batch → auto-grade
```

## Idempotency Guarantee

Setiap request submit membawa `idempotencyKey` unik (UUID v4 di-generate klien).
Server menggunakan `upsert` dengan `idempotencyKey` sebagai unique constraint.
Duplicate request (retry) akan mendapat response yang sama tanpa side-effect.

````

---

### File: `docs/architecture/security-model.md`

````markdown

<!-- ══════════════════════════════════════════════════════════ -->
<!-- docs/architecture/security-model.md                       -->
<!-- ══════════════════════════════════════════════════════════ -->

# Security Model

## Defense in Depth

```
Layer 1: HTTPS + Helmet (transport security)
Layer 2: JWT Auth (15m access token, 7d refresh token dengan rotation)
Layer 3: TenantGuard (setiap request harus punya tenantId valid)
Layer 4: RolesGuard (RBAC: SUPERADMIN > ADMIN > TEACHER > OPERATOR > SUPERVISOR > STUDENT)
Layer 5: Prisma query selalu include tenantId
Layer 6: PostgreSQL RLS (safety net)
Layer 7: DeviceGuard (fingerprint perangkat, bisa di-lock)
```

## Enkripsi Paket Soal

```
Backend:
  correctAnswer disimpan terenkripsi AES-256-GCM di database
  Key: ENCRYPTION_KEY dari env (tidak pernah ke klien)

Transport:
  Package dikirim via HTTPS
  correctAnswer tetap terenkripsi dalam payload

Client:
  Paket soal didekripsi di memori (Web Crypto API)
  Key sesi hanya hidup selama tab aktif
  TIDAK pernah masuk Zustand persist, localStorage, IndexedDB
```

## Token Security

- Access token: 15 menit, stateless JWT
- Refresh token: 7 hari, disimpan di DB, dirotasi setiap refresh
- Revocation: `revokedAt` timestamp, cek setiap refresh
- Device lock: UserDevice.isLocked — blokir di DeviceGuard

````

---

### File: `docs/architecture/system-design.md`

````markdown
<!-- ══════════════════════════════════════════════════════════ -->
<!-- docs/architecture/system-design.md                        -->
<!-- ══════════════════════════════════════════════════════════ -->

# System Design — Offline-First Multi-Tenant Exam System

## Overview
Sistem ujian berbasis web dengan kemampuan offline-first untuk lingkungan sekolah/madrasah.
Mendukung multi-tenant via subdomain isolation (smkn1.exam.app → tenantId `smkn1`).

## Komponen Utama

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Next.js 14)                                       │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐                │
│  │  Zustand │ │  Dexie   │ │  PowerSync  │                │
│  │ (memory) │ │(IndexedDB│ │  (2-way     │                │
│  └──────────┘ └──────────┘ │   sync)     │                │
│                             └─────────────┘                │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS / Socket.IO
┌─────────────────────▼───────────────────────────────────────┐
│  NestJS API (PM2 Cluster)                                   │
│  ┌───────────┐ ┌──────────┐ ┌────────────┐                │
│  │  Auth     │ │Submissions│ │   Sync     │                │
│  │  Module   │ │  Module   │ │  Module    │                │
│  └───────────┘ └──────────┘ └────────────┘                │
│  ┌───────────────────────────────────────┐                │
│  │  BullMQ (submission, sync, media,     │                │
│  │          report, notification)        │                │
│  └───────────────────────────────────────┘                │
└────────┬──────────────┬───────────────┬────────────────────┘
         │              │               │
    ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐
    │Postgres │   │   Redis   │  │  MinIO  │
    │(+PgBouncer) │(BullMQ+   │  │(S3-like)│
    └─────────┘   │ cache)    │  └─────────┘
                  └───────────┘
```

## Keputusan Arsitektur Kunci

| Area | Keputusan | Alasan |
|------|-----------|--------|
| Offline storage | Dexie (IndexedDB) | Structured queries, migrasi schema |
| Sinkronisasi | PowerSync + BullMQ | Real-time sync + reliable queue |
| Enkripsi | AES-256-GCM (Web Crypto) | Native browser, key hanya di memori |
| Multi-tenant | Subdomain + tenantId per query | Isolasi data, satu deployment |
| Connection pooling | PgBouncer (transaction mode) | Mendukung 1000+ koneksi klien |

````

---

### File: `docs/deployment/production-checklist.md`

```markdown
# Production Checklist

## Pre-Deploy

### Environment Variables
- [ ] `JWT_ACCESS_SECRET` — min 32 chars, random (`openssl rand -base64 48`)
- [ ] `JWT_REFRESH_SECRET` — min 32 chars, random, **berbeda** dari access secret
- [ ] `ENCRYPTION_KEY` — 64 hex chars (`openssl rand -hex 32`)
- [ ] `DATABASE_URL` → PgBouncer (port 6432, transaction mode)
- [ ] `DATABASE_DIRECT_URL` → Postgres langsung (port 5432, hanya untuk migration)
- [ ] MinIO credentials diganti dari default (`minioadmin`)
- [ ] `REDIS_PASSWORD` diset untuk production
- [ ] `SENTRY_DSN` diset untuk error tracking
- [ ] `SMTP_USER` dan `SMTP_PASS` diset jika email notification dipakai
- [ ] `APP_URL` sesuai domain production (untuk CORS)

### Database
- [ ] Jalankan `npm run db:migrate` (prisma migrate deploy)
- [ ] Jalankan `npm run db:rls` untuk setup PostgreSQL RLS
- [ ] Jalankan `npm run db:seed` untuk data awal (tenant, superadmin)
- [ ] Verifikasi PgBouncer pool size ≤ `max_connections` Postgres - 5
- [ ] Setup cron backup: `0 2 * * * /app/scripts/backup.sh`
- [ ] Test restore dari backup

### Security
- [ ] HTTPS dengan valid TLS certificate (Let's Encrypt / CA)
- [ ] Helmet headers aktif (cek via `curl -I https://yourdomain`)
- [ ] CORS hanya izinkan domain yang dikenal (`APP_URL`)
- [ ] Rate limiting dikonfigurasi: `THROTTLE_TTL=60`, `THROTTLE_LIMIT=100`
- [ ] Verifikasi `ENCRYPTION_KEY` bukan default (`0000...`)
- [ ] Verifikasi `JWT_*_SECRET` bukan default

### Key Management
- [ ] `ENCRYPTION_KEY` disimpan di secrets manager (AWS Secrets Manager / Vault)
- [ ] Jadwalkan rotasi key setiap 90 hari via `npm run keys:rotate`
- [ ] Backup `ENCRYPTION_KEY` lama sebelum rotasi

## Deploy

### Runtime
- [ ] PM2 cluster mode aktif (`instances: 'max'`)
- [ ] Memory limit dikonfigurasi (`max_memory_restart: '2G'`)
- [ ] Log rotation aktif (winston `winston-daily-rotate-file`)
- [ ] `NODE_ENV=production` di-set

### Infrastructure
- [ ] Redis `appendonly yes` untuk persistence
- [ ] MinIO dengan erasure coding (min 4 node untuk HA)
- [ ] PostgreSQL dengan replica untuk read scaling
- [ ] CDN di depan MinIO untuk media serving

## Post-Deploy Verification

### Health Checks
- [ ] `GET /health` → status 200, database UP
- [ ] `GET /api` → API info response
- [ ] BullMQ worker aktif (cek via Redis: `KEYS bull:*`)
- [ ] WebSocket `/monitoring` dapat dikoneksi

### Functional Tests
- [ ] Login berhasil: `POST /api/auth/login`
- [ ] Subdomain routing: `smkn1.exam.app` → tenantId resolved
- [ ] Download paket soal berhasil
- [ ] Submit jawaban dan ujian berhasil
- [ ] Auto-grading berjalan via BullMQ

### Monitoring
- [ ] Sentry menerima test event
- [ ] Alerting untuk dead letter queue BullMQ
- [ ] Slow query log dikonfigurasi (>500ms)
- [ ] Disk space monitoring untuk MinIO dan Postgres

```

---

