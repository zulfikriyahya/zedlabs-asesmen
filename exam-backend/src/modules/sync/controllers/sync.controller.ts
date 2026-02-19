// ════════════════════════════════════════════════════════════════════════════
// src/modules/sync/controllers/sync.controller.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SyncService } from '../services/sync.service';
import { AddSyncItemDto } from '../dto/add-sync-item.dto';
import { RetrySyncDto } from '../dto/retry-sync.dto';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private svc: SyncService) {}

  @Post()
  add(@Body() dto: AddSyncItemDto) {
    return this.svc.addItem(dto);
  }

  @Get(':attemptId/status')
  status(@Param('attemptId') id: string) {
    return this.svc.getStatus(id);
  }

  @Post('retry')
  retry(@Body() dto: RetrySyncDto) {
    return this.svc.retryFailed(dto);
  }
}
