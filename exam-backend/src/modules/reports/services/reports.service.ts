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
