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
