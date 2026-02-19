// ── app.service.ts ────────────────────────────────────────────────────────────
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Exam System API',
      version: '1.0.0',
      description: 'Offline-First Multi-Tenant Exam System',
    };
  }
}
