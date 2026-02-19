// ════════════════════════════════════════════════════════════════════════════
// src/modules/question-tags/controllers/question-tags.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { QuestionTagsService } from '../services/question-tags.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

@Controller('question-tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionTagsController {
  constructor(private svc: QuestionTagsService) {}

  @Get()
  findAll(@TenantId() tid: string) {
    return this.svc.findAll(tid);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(@TenantId() tid: string, @Body() dto: CreateTagDto) {
    return this.svc.create(tid, dto);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.svc.update(tid, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}
