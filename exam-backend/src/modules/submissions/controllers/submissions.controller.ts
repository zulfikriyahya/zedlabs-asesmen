import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { SubmissionsService } from '../services/submissions.service';

@ApiTags('Submissions')
@ApiBearerAuth()
@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(private svc: SubmissionsService) {}

  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({
    summary: 'List semua submission (attempt) dalam tenant',
    description: 'Digunakan guru/operator untuk overview status pengerjaan siswa.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list attempt' })
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }
}
