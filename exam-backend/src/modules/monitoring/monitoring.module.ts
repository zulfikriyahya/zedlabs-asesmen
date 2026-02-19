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
