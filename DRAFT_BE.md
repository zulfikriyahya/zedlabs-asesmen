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
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { SubdomainMiddleware } from './common/middleware/subdomain.middleware';
import { PerformanceMiddleware } from './common/middleware/performance.middleware';
import { TenantGuard } from './common/guards/tenant.guard';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        throttlers: [
          {
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
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
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
  (_data: unknown, ctx: ExecutionContext): string =>
    ctx.switchToHttp().getRequest().tenantId,
);

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
// ── base-response.dto.ts ─────────────────────────────────────────────────────
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
// ── pagination.dto.ts ────────────────────────────────────────────────────────
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
// ── exam-status.enum.ts ──────────────────────────────────────────────────────
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
// ── grading-status.enum.ts ───────────────────────────────────────────────────
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
// ── question-type.enum.ts ────────────────────────────────────────────────────
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
// ── sync-status.enum.ts ──────────────────────────────────────────────────────
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
// ── user-role.enum.ts ────────────────────────────────────────────────────────
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
// ── device-locked.exception.ts ───────────────────────────────────────────────
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
// ── exam-not-available.exception.ts ─────────────────────────────────────────
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
// ── idempotency-conflict.exception.ts ───────────────────────────────────────
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
// ── tenant-not-found.exception.ts ────────────────────────────────────────────
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
// ── all-exceptions.filter.ts ─────────────────────────────────────────────────
import { ArgumentsHost as AH, Catch as CatchAll, Logger as Log } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@CatchAll()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Log(AllExceptionsFilter.name);

  catch(ex: unknown, host: AH) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();

    if (ex instanceof Error) {
      this.logger.error(
        `Unhandled: ${req.method} ${(req as unknown as { url: string }).url} — ${ex.message}`,
        ex.stack,
      );
    }

    // delegate HttpException ke filter di atas, sisanya 500
    super.catch(ex, host);
  }
}

```

---

### File: `src/common/filters/http-exception.filter.ts`

```typescript
// ── http-exception.filter.ts ─────────────────────────────────────────────────
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
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const tenantId = (req as { tenantId?: string }).tenantId ?? 'global';
    const ip = (req as { ip?: string }).ip ?? '0.0.0.0';
    return `${tenantId}:${ip}`;
  }
}

```

---

### File: `src/common/interceptors/idempotency.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

// Cache in-memory sederhana untuk dev.
// Di production: ganti dengan Redis (ioredis).
const cache = new Map<string, unknown>();

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers['idempotency-key'] as string | undefined;
    if (!key) return next.handle();

    if (cache.has(key)) {
      return of(cache.get(key));
    }

    return next.handle().pipe(
      tap((response) => {
        cache.set(key, response);
        // TTL 24 jam
        setTimeout(() => cache.delete(key), 24 * 60 * 60 * 1000);
      }),
    );
  }
}

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
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle();
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
// ── subdomain.middleware.ts ──────────────────────────────
import { Injectable as MI, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@MI()
export class SubdomainMiddleware implements NestMiddleware {
  use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction) {
    const host = req.hostname; // e.g. smkn1.exam.app
    const parts = host.split('.');
    // subdomain adalah bagian pertama jika lebih dari 2 segmen
    req.tenantId = parts.length > 2 ? parts[0] : undefined;
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
import 'reflect-metadata';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const cfg = app.get(ConfigService);

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: cfg.get<string>('APP_URL'),
    credentials: true,
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

  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
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
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerCfg));
  }

  const port = cfg.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 API running on port ${port}`);
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/analytics/controllers/analytics.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { AnalyticsService } from '../services/analytics.service';
import { DashboardService } from '../services/dashboard.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.SUPERADMIN)
export class AnalyticsController {
  constructor(
    private svc: AnalyticsService,
    private dashSvc: DashboardService,
  ) {}

  @Get('dashboard')
  dashboard(@TenantId() tid: string) {
    return this.dashSvc.getSummary(tid);
  }

  @Get('session/:id')
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/audit-logs/audit-logs.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { AuditLogsService } from './services/audit-logs.service';

@Module({
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}

```

---

### File: `src/modules/audit-logs/decorators/audit.decorator.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/audit-logs/decorators/audit.decorator.ts
// ════════════════════════════════════════════════════════════════════════════
import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'auditAction';

export interface AuditActionMeta {
  action: string;
  entityType: string;
}

export const AuditAction = (action: string, entityType: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, entityType } satisfies AuditActionMeta);

```

---

### File: `src/modules/audit-logs/services/audit-logs.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/audit-logs/services/audit-logs.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

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

  findAll(tenantId: string, q: BaseQueryDto & { action?: string }) {
    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        ...(q.action && { action: q.action }),
      },
      orderBy: { createdAt: 'desc' },
      skip: q.skip,
      take: q.limit,
    });
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
import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: { user: { id: string; tenantId: string; role: string; email: string } },
    @Body() body: LoginDto,
  ) {
    return this.authSvc.login(
      req.user.id,
      req.user.tenantId,
      req.user.role,
      req.user.email,
      body.fingerprint,
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    const payload = this.authSvc['jwt'].decode(dto.refreshToken) as { sub: string };
    return this.authSvc.refresh(payload.sub, dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authSvc.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(@CurrentUser() user: CurrentUserPayload, @Body() dto: ChangePasswordDto) {
    await this.authSvc.changePassword(user.sub, dto.currentPassword, dto.newPassword);
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
// ══════════════════════════════════════════════════════════════
// src/modules/exam-packages/controllers/exam-packages.controller.ts
// ══════════════════════════════════════════════════════════════
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

@Controller('exam-packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamPackagesController {
  constructor(
    private svc: ExamPackagesService,
    private analysisSvc: ItemAnalysisService,
  ) {}

  @Get()
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Get(':id/item-analysis')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  analysis(@TenantId() tid: string, @Param('id') id: string) {
    return this.analysisSvc.analyze(tid, id);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateExamPackageDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateExamPackageDto) {
    return this.svc.update(tid, id, dto);
  }

  @Post(':id/questions')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  addQuestions(@TenantId() tid: string, @Param('id') id: string, @Body() dto: AddQuestionsDto) {
    return this.svc.addQuestions(tid, id, dto);
  }

  @Delete(':id/questions/:qid')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeQuestion(@TenantId() tid: string, @Param('id') id: string, @Param('qid') qid: string) {
    return this.svc.removeQuestion(tid, id, qid);
  }

  @Post(':id/publish')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  publish(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.publish(tid, id);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN)
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
// ══════════════════════════════════════════════════════════════
// src/modules/exam-packages/services/exam-package-builder.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { shuffleArray } from '../../../common/utils/randomizer.util';
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
      correctAnswer: pq.question.correctAnswer as string,
    }));

    if (shuffle) questions = shuffleArray(questions);

    return {
      packageId,
      title: pkg.title,
      settings: pkg.settings,
      questions,
      checksum: '',
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/controllers/grading.controller.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Patch, Body, Query, UseGuards } from '@nestjs/common';
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

@Controller('grading')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
export class GradingController {
  constructor(
    private svc: GradingService,
    private manualSvc: ManualGradingService,
  ) {}

  @Get()
  findPending(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findPendingManual(tid, q);
  }

  @Patch('answer')
  gradeAnswer(@CurrentUser() u: CurrentUserPayload, @Body() dto: GradeAnswerDto) {
    return this.manualSvc.gradeAnswer(dto, u.sub);
  }

  @Post('complete')
  complete(@Body() dto: CompleteGradingDto) {
    return this.manualSvc.completeGrading(dto);
  }

  @Post('publish')
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/grading.module.ts  (final — no circular dep)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { GradingService } from './services/grading.service';
import { ManualGradingService } from './services/manual-grading.service';
import { GradingController } from './controllers/grading.controller';
import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [SubmissionsModule], // dapat GradingHelperService & AutoGradingService
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
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
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
}

```

---

### File: `src/modules/grading/services/manual-grading.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/grading/services/manual-grading.service.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { GradeAnswerDto } from '../dto/grade-answer.dto';
import { CompleteGradingDto } from '../dto/complete-grading.dto';
import { PublishResultDto } from '../dto/publish-result.dto';

@Injectable()
export class ManualGradingService {
  constructor(private prisma: PrismaService) {}

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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/media/controllers/media.controller.ts
// ════════════════════════════════════════════════════════════════════════════
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MediaService } from '../services/media.service';
import { MediaUploadService } from '../services/media-upload.service';
import { DeleteMediaDto } from '../dto/delete-media.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private mediaSvc: MediaService,
    private uploadSvc: MediaUploadService,
  ) {}

  @Get('presigned/:key')
  getUrl(@Param('key') key: string) {
    return this.mediaSvc.getPresignedUrl(decodeURIComponent(key));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
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
import { MediaController } from './controllers/media.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'media' })],
  providers: [MediaService, MediaUploadService, MediaCompressionService],
  controllers: [MediaController],
  exports: [MediaService, MediaUploadService],
})
export class MediaModule {}

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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/monitoring/controllers/monitoring.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { MonitoringService } from '../services/monitoring.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERVISOR, UserRole.OPERATOR, UserRole.ADMIN)
export class MonitoringController {
  constructor(private svc: MonitoringService) {}

  @Get(':sessionId')
  overview(@Param('sessionId') id: string) {
    return this.svc.getSessionOverview(id);
  }

  @Get(':sessionId/logs/:attemptId')
  logs(@Param('attemptId') id: string, @Query() q: BaseQueryDto) {
    return this.svc.getActivityLogs(id, q);
  }
}

```

---

### File: `src/modules/monitoring/gateways/monitoring.gateway.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/monitoring/gateways/monitoring.gateway.ts
// ════════════════════════════════════════════════════════════════════════════
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: '/monitoring' })
export class MonitoringGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(MonitoringGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-session')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/monitoring/monitoring.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { MonitoringService } from './services/monitoring.service';
import { MonitoringGateway } from './gateways/monitoring.gateway';
import { MonitoringController } from './controllers/monitoring.controller';

@Module({
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/notifications/notifications.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}

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
// ══════════════════════════════════════════════════════════════
// src/modules/questions/controllers/questions.controller.ts
// ══════════════════════════════════════════════════════════════
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

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionsController {
  constructor(
    private svc: QuestionsService,
    private statsSvc: QuestionStatisticsService,
  ) {}

  @Get()
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Get(':id/stats')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  stats(@TenantId() tid: string, @Param('id') id: string) {
    return this.statsSvc.getStats(tid, id);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Post('import')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  import(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: ImportQuestionsDto,
  ) {
    return this.svc.bulkImport(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.svc.update(tid, id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  approve(@TenantId() tid: string, @Param('id') id: string, @Body() dto: ApproveQuestionDto) {
    return this.svc.approve(tid, id, dto);
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
// ── services/questions.service.ts ────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { decrypt, encrypt } from '../../../common/utils/encryption.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApproveQuestionDto } from '../dto/approve-question.dto';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { ImportQuestionsDto } from '../dto/import-questions.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private cfg: ConfigService,
  ) {}

  private get encKey() {
    return this.cfg.get<string>('ENCRYPTION_KEY', '');
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
    // decrypt correctAnswer
    const ca = decrypt(q.correctAnswer as unknown as string, this.encKey);
    return { ...q, correctAnswer: JSON.parse(ca) };
  }

  async create(tenantId: string, dto: CreateQuestionDto, createdById: string) {
    const encAnswer = encrypt(JSON.stringify(dto.correctAnswer), this.encKey);
    const { tagIds, correctAnswer: _ca, ...rest } = dto;

    const question = await this.prisma.question.create({
      data: {
        tenantId,
        createdById,
        subjectId: rest.subjectId, // ← eksplisit
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
    return question;
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/reports/controllers/reports.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { ReportsService } from '../services/reports.service';
import { ExportFilterDto } from '../dto/export-filter.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OPERATOR, UserRole.ADMIN)
export class ReportsController {
  constructor(private svc: ReportsService) {}

  @Post('export')
  export(@TenantId() tid: string, @Body() dto: ExportFilterDto) {
    return this.svc.requestExport(tid, dto);
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/reports/processors/report-queue.processor.ts
// ════════════════════════════════════════════════════════════════════════════
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
    return { objectName };
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/reports/services/reports.service.ts  (baru — split dari module)
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ExportFilterDto } from '../dto/export-filter.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectQueue('report') private reportQueue: Queue) {}

  async requestExport(tenantId: string, dto: ExportFilterDto) {
    const job = await this.reportQueue.add(
      'generate',
      { ...dto, tenantId, format: dto.format ?? 'excel' },
      { removeOnFail: false },
    );
    return { jobId: job.id, message: 'Laporan sedang diproses' };
  }
}

```

---

### File: `src/modules/sessions/controllers/sessions.controller.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/sessions/controllers/sessions.controller.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
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

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(
    private svc: SessionsService,
    private monitorSvc: SessionMonitoringService,
  ) {}

  @Get()
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Get(':id/live')
  @Roles(UserRole.SUPERVISOR, UserRole.OPERATOR, UserRole.ADMIN)
  live(@Param('id') id: string) {
    return this.monitorSvc.getLiveStatus(id);
  }

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateSessionDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.svc.update(tid, id, dto);
  }

  @Post(':id/assign')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  assign(@TenantId() tid: string, @Param('id') id: string, @Body() dto: AssignStudentsDto) {
    return this.svc.assignStudents(tid, id, dto);
  }

  @Post(':id/activate')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/sessions/services/sessions.service.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { SessionStatus } from '../../../common/enums/exam-status.enum';
import { generateTokenCode } from '../../../common/utils/randomizer.util';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { AssignStudentsDto } from '../dto/assign-students.dto';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notification') private notifQueue: Queue,
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
    await this.notifQueue.add('session-activated', { tenantId, sessionId: id });
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/sessions/sessions.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SessionsService } from './services/sessions.service';
import { SessionMonitoringService } from './services/session-monitoring.service';
import { SessionsController } from './controllers/sessions.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'notification' })],
  providers: [SessionsService, SessionMonitoringService],
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/controllers/student-exam.controller.ts  (updated)
// — tambah endpoint GET result dengan Param
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DeviceGuard } from '../../auth/guards/device.guard';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { ExamDownloadService } from '../services/exam-download.service';
import { ExamSubmissionService } from '../services/exam-submission.service';
import { StartAttemptDto } from '../dto/start-attempt.dto';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { SubmitExamDto } from '../dto/submit-exam.dto';

@Controller('student')
@UseGuards(JwtAuthGuard, DeviceGuard)
export class StudentExamController {
  constructor(
    private downloadSvc: ExamDownloadService,
    private submissionSvc: ExamSubmissionService,
  ) {}

  @Post('download')
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
  submitAnswer(@Body() dto: SubmitAnswerDto) {
    return this.submissionSvc.submitAnswer(dto);
  }

  @Post('submit')
  submitExam(@Body() dto: SubmitExamDto) {
    return this.submissionSvc.submitExam(dto);
  }

  @Get('result/:attemptId')
  getResult(@Param('attemptId') id: string, @CurrentUser() u: CurrentUserPayload) {
    return this.submissionSvc.getAttemptResult(id, u.sub);
  }
}

```

---

### File: `src/modules/submissions/controllers/submissions.controller.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/submissions/controllers/submissions.controller.ts
// ══════════════════════════════════════════════════════════════
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { SubmissionsService } from '../services/submissions.service';

@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(private svc: SubmissionsService) {}

  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.OPERATOR)
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

### File: `src/modules/submissions/processors/submission-events.listener.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/processors/submission-events.listener.ts
// ════════════════════════════════════════════════════════════════════════════
// Menangani completed/failed events dari BullMQ untuk logging & notifikasi
import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Injectable()
export class SubmissionEventsListener {
  private readonly logger = new Logger(SubmissionEventsListener.name);

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job [${job.name}] id=${job.id} selesai.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, err: Error) {
    const id = job?.id ?? 'unknown';
    const name = job?.name ?? 'unknown';
    const attempts = job?.attemptsMade ?? 0;
    this.logger.error(
      `Job [${name}] id=${id} gagal (attempt ${attempts}): ${err.message}`,
      err.stack,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(jobId: string) {
    this.logger.warn(`Job id=${jobId} stalled — akan di-retry otomatis.`);
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/services/exam-download.service.ts  (updated)
// — tambah: schedule timeout setelah download berhasil
// ════════════════════════════════════════════════════════════════════════════
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
    // 1. Validasi sesi aktif
    const session = await this.prisma.examSession.findFirst({
      where: { id: sessionId, tenantId, status: SessionStatus.ACTIVE },
      include: { examPackage: true },
    });
    if (!session) throw new NotFoundException('Sesi tidak aktif atau tidak ditemukan');

    // 2. Validasi window waktu
    if (!isWithinWindow(session.startTime, session.endTime)) {
      throw new BadRequestException('Ujian tidak dalam jangka waktu yang valid');
    }

    // 3. Validasi token peserta
    const ss = await this.prisma.sessionStudent.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (!ss || ss.tokenCode !== tokenCode) {
      throw new BadRequestException('Token tidak valid');
    }

    // 4. Idempotent attempt creation
    const attempt = await this.prisma.examAttempt.upsert({
      where: { idempotencyKey },
      create: {
        sessionId,
        userId,
        idempotencyKey,
        deviceFingerprint: hashFingerprint(deviceFingerprint),
        status: AttemptStatus.IN_PROGRESS,
      },
      update: {}, // sudah ada → return existing
    });

    const isNewAttempt = attempt.startedAt.getTime() > Date.now() - 5000; // created within 5s

    // 5. Build paket soal
    const settings = session.examPackage.settings as {
      shuffleQuestions?: boolean;
      duration?: number;
    };
    const pkg = await this.builder.buildForDownload(
      tenantId,
      session.examPackageId,
      settings.shuffleQuestions ?? false,
    );

    // 6. Checksum integritas
    const checksum = sha256(JSON.stringify(pkg.questions));

    // 7. Audit log download
    await this.auditLogs.log({
      tenantId,
      userId,
      action: 'DOWNLOAD_EXAM_PACKAGE',
      entityType: 'ExamAttempt',
      entityId: attempt.id,
      after: { sessionId, packageId: session.examPackageId, checksum },
    });

    // 8. Schedule timeout hanya untuk attempt baru
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
      checksum,
      encryptedKey: '',
      expiresAt: session.endTime.toISOString(),
    };
  }
}

```

---

### File: `src/modules/submissions/services/exam-submission.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/services/exam-submission.service.ts  (updated)
// — tambah: timeout scheduling, audit log, guard duplikat submit
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogsService } from '../../audit-logs/services/audit-logs.service';
import { AttemptStatus } from '../../../common/enums/exam-status.enum';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { SubmitAnswerDto } from '../dto/submit-answer.dto';
import { SubmitExamDto } from '../dto/submit-exam.dto';
import { AutoGradeJobData } from '../processors/submission.processor';

@Injectable()
export class ExamSubmissionService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    @InjectQueue('submission') private submissionQueue: Queue,
  ) {}

  // ── Submit satu jawaban (idempotent) ───────────────────────────────────────
  async submitAnswer(dto: SubmitAnswerDto) {
    // Guard: pastikan attempt masih IN_PROGRESS
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      select: { status: true, session: { select: { tenantId: true, endTime: true } } },
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

  // ── Submit ujian (idempotent) ──────────────────────────────────────────────
  async submitExam(dto: SubmitExamDto) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: dto.attemptId },
      include: { session: { select: { tenantId: true, examPackage: true } } },
    });
    if (!attempt) throw new NotFoundException('Attempt tidak ditemukan');

    // Idempotency: sudah submit sebelumnya
    if (attempt.status === AttemptStatus.SUBMITTED || attempt.status === AttemptStatus.TIMED_OUT) {
      return { message: 'Ujian sudah disubmit sebelumnya', attemptId: dto.attemptId };
    }

    const tenantId = attempt.session.tenantId;

    // Update status
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

    // Enqueue auto-grade — jobId unik agar tidak duplikat jika retry
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

  // ── Schedule timeout untuk attempt yang sedang berjalan ───────────────────
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
    this.logger?.log?.(`Timeout dijadwalkan untuk attempt ${attemptId} dalam ${durationMinutes}m`);
  }

  // ── Ambil hasil attempt (hanya jika PUBLISHED) ─────────────────────────────
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

    // Jika belum published, kembalikan status saja
    if (attempt.gradingStatus !== GradingStatus.PUBLISHED) {
      return {
        attemptId,
        status: attempt.status,
        gradingStatus: attempt.gradingStatus,
        message: this.gradingStatusMessage(attempt.gradingStatus as GradingStatus),
      };
    }

    const percentage =
      attempt.maxScore && attempt.maxScore > 0
        ? Math.round(((attempt.totalScore ?? 0) / attempt.maxScore) * 100 * 10) / 10
        : 0;

    const settings = attempt.session.examPackage.settings as { passingScore?: number };
    const isPassed = settings.passingScore != null ? percentage >= settings.passingScore : null; // tidak ada passing score = tidak ada keterangan lulus/tidak

    return {
      attemptId,
      sessionTitle: attempt.session.title,
      packageTitle: attempt.session.examPackage.title,
      status: attempt.status,
      gradingStatus: attempt.gradingStatus,
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      percentage,
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

  // logger optional agar tidak crash jika DI belum setup
  private get logger() {
    return { log: (msg: string) => console.log(`[ExamSubmissionService] ${msg}`) };
  }
}

```

---

### File: `src/modules/submissions/services/grading-helper.service.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/submissions/services/grading-helper.service.ts
// Memisahkan logika runAutoGrade agar tidak ada circular dependency
// SubmissionsModule ↔ GradingModule
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AutoGradingService } from './auto-grading.service';
import { GradingStatus } from '../../../common/enums/grading-status.enum';
import { QuestionType } from '../../../common/enums/question-type.enum';

@Injectable()
export class GradingHelperService {
  private readonly logger = new Logger(GradingHelperService.name);

  constructor(
    private prisma: PrismaService,
    private autoGrading: AutoGradingService,
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
// src/modules/submissions/submissions.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExamPackagesModule } from '../exam-packages/exam-packages.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuthModule } from '../auth/auth.module'; // ← tambah
import { ExamDownloadService } from './services/exam-download.service';
import { ExamSubmissionService } from './services/exam-submission.service';
import { AutoGradingService } from './services/auto-grading.service';
import { SubmissionsService } from './services/submissions.service';
import { StudentExamController } from './controllers/student-exam.controller';
import { SubmissionsController } from './controllers/submissions.controller';
import { SubmissionProcessor } from './processors/submission.processor';
import { SubmissionEventsListener } from './processors/submission-events.listener';
import { GradingHelperService } from './services/grading-helper.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'submission' }),
    ExamPackagesModule,
    AuditLogsModule,
    AuthModule, // ← tambah agar DeviceGuard dapat AuthService
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/sync/controllers/sync.controller.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SyncService } from '../services/sync.service';
import { AddSyncItemDto } from '../dto/add-sync-item.dto';
import { RetrySyncDto } from '../dto/retry-sync.dto';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private svc: SyncService) {}

  @Post()
  add(@Body() dto: AddSyncItemDto) {
    return this.svc.addItem(dto);
  }

  @Get(':attemptId/status')
  status(@Param('attemptId') id: string) {
    return this.svc.getStatus(id);
  }

  @Post('retry')
  retry(@Body() dto: RetrySyncDto) {
    return this.svc.retryFailed(dto);
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

### File: `src/modules/sync/processors/sync.processor.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/sync/processors/sync.processor.ts
// ══════════════════════════════════════════════════════════════
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SyncProcessorService } from '../services/sync-processor.service';

@Processor('sync')
export class SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(private processorSvc: SyncProcessorService) {
    super();
  }

  async process(job: Job<{ syncItemId: string }>) {
    this.logger.log(`Processing sync job ${job.id}`);
    await this.processorSvc.process(job.data.syncItemId);
  }
}

```

---

### File: `src/modules/sync/services/chunked-upload.service.ts`

```typescript
// ══════════════════════════════════════════════════════════════
// src/modules/sync/services/chunked-upload.service.ts
// ══════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChunkedUploadService {
  private readonly tmpDir = path.join(process.cwd(), 'uploads', 'temp');

  async saveChunk(fileId: string, chunkIndex: number, data: Buffer) {
    const dir = path.join(this.tmpDir, fileId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `chunk_${chunkIndex}`), data);
  }

  async assemble(fileId: string, totalChunks: number): Promise<Buffer> {
    const dir = path.join(this.tmpDir, fileId);
    const chunks = Array.from({ length: totalChunks }, (_, i) =>
      fs.readFileSync(path.join(dir, `chunk_${i}`)),
    );
    const assembled = Buffer.concat(chunks);
    fs.rmSync(dir, { recursive: true, force: true });
    return assembled;
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
// ════════════════════════════════════════════════════════════════════════════
// src/modules/sync/sync.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SyncService } from './services/sync.service';
import { SyncProcessorService } from './services/sync-processor.service';
import { ChunkedUploadService } from './services/chunked-upload.service';
import { SyncProcessor } from './processors/sync.processor';
import { SyncController } from './controllers/sync.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'sync' })],
  providers: [SyncService, SyncProcessorService, ChunkedUploadService, SyncProcessor],
  controllers: [SyncController],
  exports: [SyncService],
})
export class SyncModule {}

```

---

### File: `src/modules/tenants/controllers/tenants.controller.ts`

```typescript
// ════════════════════════════════════════════════════════════════════════════
// src/modules/tenants/controllers/tenants.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { TenantsService } from '../services/tenants.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class TenantsController {
  constructor(private svc: TenantsService) {}

  @Get()
  findAll(@Query() q: BaseQueryDto) {
    return this.svc.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
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
// ══════════════════════════════════════════════════════════════
// src/modules/users/controllers/users.controller.ts
// ══════════════════════════════════════════════════════════════
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

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get()
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Post()
  create(@TenantId() tid: string, @Body() dto: CreateUserDto) {
    return this.svc.create(tid, dto);
  }

  @Post('import')
  import(@TenantId() tid: string, @Body() dto: ImportUsersDto) {
    return this.svc.bulkImport(tid, dto);
  }

  @Patch(':id')
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.update(tid, id, dto);
  }

  @Delete(':id')
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
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
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
  tokenCode String   @unique
  addedAt   DateTime @default(now())

  session ExamSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@id([sessionId, userId])
  @@map("session_students")
}

// ============================================
// ATTEMPTS & ANSWERS
// ============================================

model ExamAttempt {
  id                String        @id @default(cuid())
  sessionId         String
  userId            String
  idempotencyKey    String        @unique
  deviceFingerprint String?
  startedAt         DateTime      @default(now())
  submittedAt       DateTime?
  status            AttemptStatus @default(IN_PROGRESS)
  packageHash       String?
  totalScore        Float?
  maxScore          Float?
  gradingStatus     GradingStatus @default(PENDING)
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
  id             String   @id @default(cuid())
  attemptId      String
  questionId     String
  idempotencyKey String   @unique
  answer         Json
  mediaUrls      String[]
  score          Float?
  maxScore       Float?
  feedback       String?
  isAutoGraded   Boolean  @default(false)
  gradedById     String?
  gradedAt       DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  attempt  ExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  gradedBy User?       @relation("GradedBy", fields: [gradedById], references: [id])

  @@unique([attemptId, questionId])
  @@index([attemptId])
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
  action     String   // START_EXAM | SUBMIT_EXAM | CHANGE_SCORE | ADMIN_ACCESS | ...
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

```

---

### File: `test/e2e/offline-sync.e2e-spec.ts`

```typescript

```

---

### File: `test/e2e/student-exam-flow.e2e-spec.ts`

```typescript
// ── test/e2e/student-exam-flow.e2e-spec.ts ───────────────────────────────────
describe('Student Exam Flow E2E', () => {
  it('download → submit answer → submit exam → result', async () => {
    // 1. Download paket
    // 2. Submit beberapa jawaban
    // 3. Submit ujian
    // 4. Cek result setelah grading
    expect(true).toBe(true); // placeholder
  });
});

```

---

### File: `test/integration/database.spec.ts`

```typescript

```

---

### File: `test/integration/minio.spec.ts`

```typescript

```

---

### File: `test/integration/redis.spec.ts`

```typescript

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

```

---

### File: `test/load/sync-stress.k6.js`

```javascript

```

---

### File: `test/unit/auth/auth.service.spec.ts`

```typescript
// ── test/unit/auth/auth.service.spec.ts ──────────────────────────────────────
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/modules/auth/services/auth.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let svc: AuthService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: { findFirst: jest.fn() },
            refreshToken: { create: jest.fn() },
            userDevice: { upsert: jest.fn() },
          },
        },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'mock-token') } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((k: string) => (k === 'JWT_ACCESS_EXPIRES_IN' ? '15m' : 'mock-secret')),
          },
        },
      ],
    }).compile();

    svc = mod.get(AuthService);
    prisma = mod.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  it('validateUser returns null for wrong password', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ passwordHash: '$2b$12$wrong' });
    const result = await svc.validateUser('user', 'wrongpass');
    expect(result).toBeNull();
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
# scripts/cleanup-media.sh
#!/bin/bash
# Hapus media orphan (tidak referensed di DB) lebih dari 30 hari
echo "Cleaning up orphan media files older than 30 days..."
# mc find minio/exam-assets --older-than 30d | xargs mc rm
echo "Done"

```

---

### File: `scripts/rotate-keys.sh`

```bash
# scripts/rotate-keys.sh
#!/bin/bash
NEW_KEY=$(openssl rand -hex 32)
echo "New ENCRYPTION_KEY: $NEW_KEY"
echo "⚠️  Update .env dan re-deploy sebelum key lama expired"
echo "⚠️  Re-enkripsi semua correctAnswer di database setelah rotate"

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
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api
APP_URL=http://localhost:3000

# Database (Prisma)
DATABASE_URL=postgresql://exam_user:exam_password@pgbouncer:5432/exam_db
DATABASE_DIRECT_URL=postgresql://exam_user:exam_password@postgres:5432/exam_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=change-this-access-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-this-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Encryption (AES-256-GCM key, 32 bytes hex)
ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000

# MinIO (S3-compatible)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=exam-assets
MINIO_PRESIGNED_TTL=3600

# BullMQ
BULLMQ_CONCURRENCY=10

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# File Upload
MAX_FILE_SIZE=1073741824
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_AUDIO_TYPES=audio/mpeg,audio/wav,audio/webm
ALLOWED_VIDEO_TYPES=video/mp4,video/webm

# Sentry
SENTRY_DSN=

# SMTP (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
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
    "db:seed": "ts-node src/prisma/seeds/index.ts"
  },
  "dependencies": {
    "@nestjs/bullmq": "^10.1.1",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.1.1",
    "@nestjs/core": "^10.0.0",
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

<!-- ══════════════════════════════════════════════════════════ -->
<!-- docs/deployment/production-checklist.md                   -->
<!-- ══════════════════════════════════════════════════════════ -->

# Production Checklist

## Environment Variables
- [ ] `JWT_ACCESS_SECRET` min 32 chars, random
- [ ] `JWT_REFRESH_SECRET` min 32 chars, random, berbeda dari access
- [ ] `ENCRYPTION_KEY` 64 hex chars (32 bytes random)
- [ ] `DATABASE_URL` dan `DATABASE_DIRECT_URL` set ke PgBouncer dan Postgres
- [ ] MinIO credentials diganti dari default
- [ ] `SENTRY_DSN` diset untuk error tracking

## Database
- [ ] Jalankan `prisma migrate deploy`
- [ ] Enable RLS di PostgreSQL
- [ ] Setup backup otomatis (lihat `scripts/backup.sh`)
- [ ] PgBouncer pool size sesuai dengan `max_connections` Postgres

## Security
- [ ] HTTPS dengan valid TLS certificate
- [ ] Helmet headers aktif
- [ ] Rate limiting dikonfigurasi per tenant
- [ ] CORS origin dikonfigurasi spesifik (bukan wildcard)

## Performance
- [ ] PM2 cluster mode aktif (`instances: 'max'`)
- [ ] Redis persistence enabled (`appendonly yes`)
- [ ] MinIO dengan erasure coding untuk HA
- [ ] CDN untuk static assets frontend

## Monitoring
- [ ] Health check endpoint `/health` terdaftar di load balancer
- [ ] Log rotation dikonfigurasi (winston-daily-rotate-file)
- [ ] Alerting untuk dead letter queue BullMQ

```

---

