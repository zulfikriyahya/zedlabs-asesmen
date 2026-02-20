import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ImportUsersDto } from '../dto/import-users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List pengguna dalam tenant' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list user (passwordHash tidak dikembalikan)',
  })
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail pengguna' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Detail user' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Post()
  @ApiOperation({ summary: 'Buat pengguna baru' })
  @ApiResponse({ status: 201, description: 'User berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Email atau username sudah digunakan' })
  create(@TenantId() tid: string, @Body() dto: CreateUserDto) {
    return this.svc.create(tid, dto);
  }

  @Post('import')
  @ApiOperation({
    summary: 'Bulk import pengguna',
    description: 'Mengembalikan { created, failed }.',
  })
  @ApiResponse({ status: 200, description: '{ created: N, failed: M }' })
  import(@TenantId() tid: string, @Body() dto: ImportUsersDto) {
    return this.svc.bulkImport(tid, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pengguna' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User berhasil diupdate' })
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.update(tid, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate pengguna (soft delete — isActive = false)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User dinonaktifkan' })
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}
