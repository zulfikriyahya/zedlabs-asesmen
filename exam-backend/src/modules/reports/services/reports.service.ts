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
