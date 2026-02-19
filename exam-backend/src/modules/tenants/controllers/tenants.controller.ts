// ════════════════════════════════════════════════════════════════════════════
// src/modules/tenants/controllers/tenants.controller.ts
// ════════════════════════════════════════════════════════════════════════════
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { TenantsService } from '../services/tenants.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class TenantsController {
  constructor(private svc: TenantsService) {}

  @Get()
  findAll(@Query() q: BaseQueryDto) {
    return this.svc.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.svc.update(id, dto);
  }
}
