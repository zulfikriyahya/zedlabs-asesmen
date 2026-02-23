import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { ExamPackageStatus } from '../../../common/enums/exam-status.enum';
import { AddQuestionsDto } from '../dto/add-questions.dto';
import { CreateExamPackageDto } from '../dto/create-exam-package.dto';
import { UpdateExamPackageDto } from '../dto/update-exam-package.dto';

@Injectable()
export class ExamPackagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, q: BaseQueryDto & { status?: ExamPackageStatus }) {
    const where = {
      tenantId,
      ...(q.status && { status: q.status }),
      ...(q.search && { title: { contains: q.search, mode: 'insensitive' as const } }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.examPackage.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { [q.sortBy ?? 'createdAt']: q.sortOrder },
        include: { _count: { select: { questions: true, sessions: true } } },
      }),
      this.prisma.examPackage.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }

  async findOne(tenantId: string, id: string) {
    const pkg = await this.prisma.examPackage.findFirst({
      where: { id, tenantId },
      include: {
        questions: {
          include: { question: { include: { subject: true, tags: { include: { tag: true } } } } },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!pkg) throw new NotFoundException('Paket ujian tidak ditemukan');
    return pkg;
  }

  async create(tenantId: string, dto: CreateExamPackageDto, createdById: string) {
    return this.prisma.examPackage.create({
      data: { tenantId, createdById, ...dto, settings: dto.settings as object },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateExamPackageDto) {
    const pkg = await this.findOne(tenantId, id);
    if (pkg.status === ExamPackageStatus.PUBLISHED) {
      throw new BadRequestException('Paket yang sudah dipublish tidak bisa diedit');
    }
    return this.prisma.examPackage.update({
      where: { id },
      data: { ...dto, settings: dto.settings as object },
    });
  }

  async addQuestions(tenantId: string, id: string, dto: AddQuestionsDto) {
    await this.findOne(tenantId, id);

    /**
     * [Fix #3] Unique constraint [examPackageId, order] bisa conflict saat reorder.
     * Solusi: dalam satu transaksi, set semua order ke nilai negatif (temporary)
     * terlebih dahulu sebelum set ke nilai final, sehingga tidak ada collision.
     */
    await this.prisma.$transaction(async (tx) => {
      // Step 1: Temporary order (negatif) untuk semua soal yang akan di-upsert
      await Promise.all(
        dto.questions.map((q, i) =>
          tx.examPackageQuestion.upsert({
            where: { examPackageId_questionId: { examPackageId: id, questionId: q.questionId } },
            create: {
              examPackageId: id,
              questionId: q.questionId,
              order: -(i + 1), // temporary negatif
              points: q.points,
            },
            update: { order: -(i + 1) },
          }),
        ),
      );

      // Step 2: Set ke order final setelah collision dihilangkan
      await Promise.all(
        dto.questions.map((q) =>
          tx.examPackageQuestion.update({
            where: { examPackageId_questionId: { examPackageId: id, questionId: q.questionId } },
            data: { order: q.order, points: q.points },
          }),
        ),
      );
    });

    return this.findOne(tenantId, id);
  }

  async removeQuestion(tenantId: string, pkgId: string, questionId: string) {
    await this.findOne(tenantId, pkgId);
    await this.prisma.examPackageQuestion.delete({
      where: { examPackageId_questionId: { examPackageId: pkgId, questionId } },
    });
  }

  async publish(tenantId: string, id: string) {
    const pkg = await this.findOne(tenantId, id);
    if (!pkg.questions.length) throw new BadRequestException('Paket harus memiliki minimal 1 soal');
    return this.prisma.examPackage.update({
      where: { id },
      data: { status: ExamPackageStatus.PUBLISHED, publishedAt: new Date() },
    });
  }

  async archive(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.examPackage.update({
      where: { id },
      data: { status: ExamPackageStatus.ARCHIVED },
    });
  }
}
