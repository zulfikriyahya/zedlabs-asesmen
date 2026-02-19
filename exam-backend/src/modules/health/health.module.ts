// ════════════════════════════════════════════════════════════════════════════
// src/modules/health/health.module.ts  (clean)
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
