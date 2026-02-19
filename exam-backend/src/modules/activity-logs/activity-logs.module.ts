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
