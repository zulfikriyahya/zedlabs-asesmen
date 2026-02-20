import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { DeviceManagementService } from '../services/device-management.service';
import { LockDeviceDto, UnlockDeviceDto, UpdateDeviceLabelDto } from '../dto/device-management.dto';

@ApiTags('Device Management')
@ApiBearerAuth()
@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeviceManagementController {
  constructor(private svc: DeviceManagementService) {}

  @Get('mine')
  @ApiOperation({ summary: 'Daftar perangkat milik user yang sedang login' })
  @ApiResponse({ status: 200, description: 'List perangkat terdaftar' })
  myDevices(@CurrentUser() u: CurrentUserPayload) {
    return this.svc.getUserDevices(u.sub);
  }

  @Get(':userId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Daftar perangkat milik user tertentu' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'List perangkat user' })
  userDevices(@TenantId() tid: string, @Param('userId') userId: string) {
    return this.svc.getUserDevicesByTenant(tid, userId);
  }

  @Patch('lock')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @ApiOperation({
    summary: 'Kunci perangkat siswa',
    description: 'Perangkat yang dikunci tidak bisa digunakan untuk login atau ujian.',
  })
  @ApiResponse({ status: 200, description: 'Perangkat berhasil dikunci' })
  @ApiResponse({ status: 404, description: 'Perangkat tidak ditemukan' })
  lock(@TenantId() tid: string, @Body() dto: LockDeviceDto) {
    return this.svc.lockDevice(tid, dto.userId, dto.fingerprint);
  }

  @Patch('unlock')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Buka kunci perangkat (hanya ADMIN/SUPERADMIN)' })
  @ApiResponse({ status: 200, description: 'Perangkat berhasil dibuka' })
  unlock(@TenantId() tid: string, @Body() dto: UnlockDeviceDto) {
    return this.svc.unlockDevice(tid, dto.userId, dto.fingerprint);
  }

  @Patch('label')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Beri label pada perangkat (misal: "Lab Komputer 1 - PC 05")' })
  @ApiResponse({ status: 200, description: 'Label berhasil diperbarui' })
  updateLabel(@TenantId() tid: string, @Body() dto: UpdateDeviceLabelDto) {
    return this.svc.updateLabel(tid, dto.userId, dto.fingerprint, dto.label);
  }

  @Delete(':userId/:fingerprint')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Hapus perangkat dari daftar terdaftar' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'fingerprint', description: 'Device fingerprint (hashed)' })
  @ApiResponse({ status: 200, description: 'Perangkat berhasil dihapus' })
  remove(
    @TenantId() tid: string,
    @Param('userId') userId: string,
    @Param('fingerprint') fp: string,
  ) {
    return this.svc.removeDevice(tid, userId, fp);
  }
}
