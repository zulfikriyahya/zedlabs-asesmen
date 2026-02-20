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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums/user-role.enum';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { QuestionsService } from '../services/questions.service';
import { QuestionStatisticsService } from '../services/question-statistics.service';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';
import { ImportQuestionsDto } from '../dto/import-questions.dto';
import { ApproveQuestionDto } from '../dto/approve-question.dto';

@ApiTags('Questions')
@ApiBearerAuth()
@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionsController {
  constructor(
    private svc: QuestionsService,
    private statsSvc: QuestionStatisticsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List soal milik tenant (correctAnswer tidak dikembalikan)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'subjectId', required: false })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: [
      'MULTIPLE_CHOICE',
      'COMPLEX_MULTIPLE_CHOICE',
      'TRUE_FALSE',
      'MATCHING',
      'SHORT_ANSWER',
      'ESSAY',
    ],
  })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'review', 'approved'] })
  @ApiResponse({ status: 200, description: 'Paginated list soal' })
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail soal (correctAnswer tidak dikembalikan)' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Detail soal' })
  @ApiResponse({ status: 404, description: 'Soal tidak ditemukan' })
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Get(':id/stats')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Statistik soal',
    description: 'Difficulty index, total attempt, dan rata-rata skor dari semua ujian.',
  })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Statistik soal' })
  stats(@TenantId() tid: string, @Param('id') id: string) {
    return this.statsSvc.getStats(tid, id);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Buat soal baru',
    description: 'correctAnswer akan dienkripsi AES-256-GCM sebelum disimpan.',
  })
  @ApiResponse({ status: 201, description: 'Soal berhasil dibuat' })
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Post('import')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Bulk import soal',
    description: 'Mengembalikan jumlah soal yang berhasil dibuat dan yang gagal.',
  })
  @ApiResponse({ status: 200, description: '{ created: N, failed: M }' })
  import(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: ImportQuestionsDto,
  ) {
    return this.svc.bulkImport(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update soal' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Soal berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'Soal tidak ditemukan' })
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.svc.update(tid, id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Ubah status soal (draft → review → approved)' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Status berhasil diubah' })
  approve(@TenantId() tid: string, @Param('id') id: string, @Body() dto: ApproveQuestionDto) {
    return this.svc.approve(tid, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus soal (hanya ADMIN)' })
  @ApiParam({ name: 'id', description: 'Question ID' })
  @ApiResponse({ status: 204, description: 'Soal berhasil dihapus' })
  remove(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.remove(tid, id);
  }
}
