// ══════════════════════════════════════════════════════════════
// src/modules/users/controllers/users.controller.ts
// ══════════════════════════════════════════════════════════════
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

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class UsersController {
  constructor(private svc: UsersService) {}

  @Get()
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Post()
  create(@TenantId() tid: string, @Body() dto: CreateUserDto) {
    return this.svc.create(tid, dto);
  }

  @Post('import')
  import(@TenantId() tid: string, @Body() dto: ImportUsersDto) {
    return this.svc.bulkImport(tid, dto);
  }

  @Patch(':id')
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.svc.update(tid, id, dto);
  }

  @Delete(':id')
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}
