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
