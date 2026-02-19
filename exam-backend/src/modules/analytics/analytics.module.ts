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
