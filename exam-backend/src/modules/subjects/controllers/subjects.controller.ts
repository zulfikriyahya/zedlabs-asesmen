// ════════════════════════════════════════════════════════════════════════════
// src/modules/subjects/controllers/subjects.controller.ts  (standalone)
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { SubjectsService } from '../services/subjects.service';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
  constructor(private svc: SubjectsService) {}

  @Get()
  findAll(@TenantId() tid: string) {
    return this.svc.findAll(tid);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(@TenantId() tid: string, @Body() dto: CreateSubjectDto) {
    return this.svc.create(tid, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.svc.update(tid, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}
