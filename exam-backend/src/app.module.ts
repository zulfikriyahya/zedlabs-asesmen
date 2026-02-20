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
import { RedisProvider } from './common/providers/redis.provider';
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
          password: cfg.get('REDIS_PASSWORD') || undefined,
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
    // SentryService & EmailService disediakan di module masing-masing yang butuh,
    // tapi kita daftarkan di root agar bisa di-inject secara global via exports
    SentryService,
    EmailService,
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
  ],
  // Export agar modul lain bisa inject tanpa import ulang
  exports: [SentryService, EmailService, RedisProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SubdomainMiddleware, LoggerMiddleware, PerformanceMiddleware).forRoutes('*');
  }
}
