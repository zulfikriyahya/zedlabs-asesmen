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
