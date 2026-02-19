// ════════════════════════════════════════════════════════════════════════════
// src/modules/activity-logs/controllers/activity-logs.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ActivityLogsService } from '../services/activity-logs.service';
import { CreateActivityLogDto } from '../dto/create-activity-log.dto';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogsController {
  constructor(private svc: ActivityLogsService) {}

  @Get(':attemptId')
  findByAttempt(@Param('attemptId') id: string) {
    return this.svc.findByAttempt(id);
  }

  @Post()
  create(@Body() dto: CreateActivityLogDto) {
    return this.svc.create(dto);
  }
}
