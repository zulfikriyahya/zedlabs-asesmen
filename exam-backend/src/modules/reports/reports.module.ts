// ── reports.module.ts ──────────────────────────────────
import { BullModule, Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';

export class ExportFilterDto {
  @IsString() @IsNotEmpty() sessionId: string;
  @IsOptional() @IsString() format?: 'excel' | 'pdf';
}

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

@Injectable()
export class PdfExportService {
  async generate(html: string): Promise<Buffer> {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    return Buffer.from(pdf);
  }
}

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
    this.logger.log(`Generating ${job.data.format} report for session ${job.data.sessionId}`);
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
      const html = `<html><body><table>${rows.map((r) => `<tr><td>${Object.values(r).join('</td><td>')}</td></tr>`).join('')}</table></body></html>`;
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

@Controller('reports')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.OPERATOR, UserRole.ADMIN)
export class ReportsController {
  constructor(private svc: ReportsService) {}
  @Post('export') export(@TenantId() tid: string, @Body() dto: ExportFilterDto) {
    return this.svc.requestExport(tid, dto);
  }
}

import { MediaService } from '../media/services/media.service';
@Module({
  imports: [BullModule.registerQueue({ name: 'report' }), MediaModule],
  providers: [ExcelExportService, PdfExportService, ReportQueueProcessor, ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
