import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { TenantsService } from '../services/tenants.service';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class TenantsController {
  constructor(private svc: TenantsService) {}

  @Get()
  @ApiOperation({ summary: 'List semua tenant (hanya SUPERADMIN)' })
  @ApiResponse({ status: 200, description: 'Paginated list tenant' })
  findAll(@Query() q: BaseQueryDto) {
    return this.svc.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail tenant' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Detail tenant' })
  @ApiResponse({ status: 404, description: 'Tenant tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Buat tenant baru (institusi baru)' })
  @ApiResponse({ status: 201, description: 'Tenant berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Kode atau subdomain sudah digunakan' })
  create(@Body() dto: CreateTenantDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant (termasuk isActive untuk disable)' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant berhasil diupdate' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.svc.update(id, dto);
  }
}
