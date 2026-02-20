import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CurrentUser, CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantId } from '../../../common/decorators/tenant-id.decorator';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { UserRole } from '../../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AddQuestionsDto } from '../dto/add-questions.dto';
import { CreateExamPackageDto } from '../dto/create-exam-package.dto';
import { UpdateExamPackageDto } from '../dto/update-exam-package.dto';
import { ExamPackagesService } from '../services/exam-packages.service';
import { ItemAnalysisService } from '../services/item-analysis.service';

@ApiTags('Exam Packages')
@ApiBearerAuth()
@Controller('exam-packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamPackagesController {
  constructor(
    private svc: ExamPackagesService,
    private analysisSvc: ItemAnalysisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List paket ujian milik tenant' })
  @ApiResponse({ status: 200, description: 'Paginated list paket ujian' })
  findAll(@TenantId() tid: string, @Query() q: BaseQueryDto) {
    return this.svc.findAll(tid, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail paket ujian beserta soal-soalnya' })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Detail paket' })
  @ApiResponse({ status: 404, description: 'Paket tidak ditemukan' })
  findOne(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.findOne(tid, id);
  }

  @Get(':id/item-analysis')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Item analysis soal dalam paket',
    description: 'Menghitung difficulty index dan distribusi jawaban per soal.',
  })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Array item analysis per soal' })
  analysis(@TenantId() tid: string, @Param('id') id: string) {
    return this.analysisSvc.analyze(tid, id);
  }

  @Post()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Buat paket ujian baru (status DRAFT)' })
  @ApiResponse({ status: 201, description: 'Paket berhasil dibuat' })
  create(
    @TenantId() tid: string,
    @CurrentUser() u: CurrentUserPayload,
    @Body() dto: CreateExamPackageDto,
  ) {
    return this.svc.create(tid, dto, u.sub);
  }

  @Patch(':id')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update paket ujian (hanya status DRAFT/REVIEW)' })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Paket berhasil diupdate' })
  @ApiResponse({ status: 400, description: 'Paket sudah PUBLISHED tidak bisa diedit' })
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: UpdateExamPackageDto) {
    return this.svc.update(tid, id, dto);
  }

  @Post(':id/questions')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Tambah / update soal dalam paket (upsert per questionId)' })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Soal berhasil ditambahkan' })
  addQuestions(@TenantId() tid: string, @Param('id') id: string, @Body() dto: AddQuestionsDto) {
    return this.svc.addQuestions(tid, id, dto);
  }

  @Delete(':id/questions/:qid')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus soal dari paket' })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiParam({ name: 'qid', description: 'Question ID' })
  @ApiResponse({ status: 204, description: 'Soal berhasil dihapus dari paket' })
  removeQuestion(@TenantId() tid: string, @Param('id') id: string, @Param('qid') qid: string) {
    return this.svc.removeQuestion(tid, id, qid);
  }

  @Post(':id/publish')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Publish paket ujian',
    description: 'Paket harus memiliki minimal 1 soal. Status berubah menjadi PUBLISHED.',
  })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Paket berhasil dipublish' })
  @ApiResponse({ status: 400, description: 'Paket tidak memiliki soal' })
  publish(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.publish(tid, id);
  }

  @Post(':id/archive')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Archive paket ujian (hanya ADMIN)' })
  @ApiParam({ name: 'id', description: 'ExamPackage ID' })
  @ApiResponse({ status: 200, description: 'Paket berhasil diarsipkan' })
  archive(@TenantId() tid: string, @Param('id') id: string) {
    return this.svc.archive(tid, id);
  }
}
