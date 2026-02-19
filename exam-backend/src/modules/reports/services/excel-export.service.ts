// ════════════════════════════════════════════════════════════════════════════
// src/modules/reports/services/excel-export.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable } from '@nestjs/common';

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
