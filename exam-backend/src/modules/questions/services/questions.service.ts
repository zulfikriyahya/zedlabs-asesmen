// ── services/questions.service.ts ────────────────────────
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { encrypt, decrypt } from '../../../common/utils/encryption.util';
import { ConfigService } from '@nestjs/config';
import { shuffleArray } from '../../../common/utils/randomizer.util';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private cfg: ConfigService,
  ) {}

  private get encKey() {
    return this.cfg.get<string>('ENCRYPTION_KEY', '');
  }

  async findAll(
    tenantId: string,
    q: BaseQueryDto & { subjectId?: string; type?: string; status?: string },
  ) {
    const where = {
      tenantId,
      ...(q.subjectId && { subjectId: q.subjectId }),
      ...(q.type && { type: q.type as import('@prisma/client').QuestionType }),
      ...(q.status && { status: q.status }),
      ...(q.search && { content: { path: ['text'], string_contains: q.search } }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        skip: q.skip,
        take: q.limit,
        orderBy: { [q.sortBy ?? 'createdAt']: q.sortOrder },
        include: { subject: { select: { name: true } }, tags: { include: { tag: true } } },
      }),
      this.prisma.question.count({ where }),
    ]);
    // strip correctAnswer dari list response
    const safe = data.map(({ correctAnswer: _ca, ...rest }) => rest);
    return new PaginatedResponseDto(safe, total, q.page, q.limit);
  }

  async findOne(tenantId: string, id: string, includeAnswer = false) {
    const q = await this.prisma.question.findFirst({
      where: { id, tenantId },
      include: { subject: true, tags: { include: { tag: true } } },
    });
    if (!q) throw new NotFoundException('Soal tidak ditemukan');
    if (!includeAnswer) {
      const { correctAnswer: _ca, ...rest } = q;
      return rest;
    }
    // decrypt correctAnswer
    const ca = decrypt(q.correctAnswer as unknown as string, this.encKey);
    return { ...q, correctAnswer: JSON.parse(ca) };
  }

  async create(tenantId: string, dto: CreateQuestionDto, createdById: string) {
    const encAnswer = encrypt(JSON.stringify(dto.correctAnswer), this.encKey);
    const { tagIds, correctAnswer: _ca, ...rest } = dto;

    const question = await this.prisma.question.create({
      data: {
        tenantId,
        createdById,
        ...rest,
        correctAnswer: encAnswer,
        tags: tagIds?.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
      },
      include: { tags: { include: { tag: true } } },
    });
    return question;
  }

  async update(tenantId: string, id: string, dto: UpdateQuestionDto) {
    await this.findOne(tenantId, id);
    const { tagIds, correctAnswer, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (correctAnswer) data.correctAnswer = encrypt(JSON.stringify(correctAnswer), this.encKey);

    if (tagIds !== undefined) {
      await this.prisma.questionTagMapping.deleteMany({ where: { questionId: id } });
      data.tags = { create: tagIds.map((tagId) => ({ tagId })) };
    }
    return this.prisma.question.update({ where: { id }, data });
  }

  async approve(tenantId: string, id: string, dto: ApproveQuestionDto) {
    await this.findOne(tenantId, id);
    return this.prisma.question.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.question.delete({ where: { id } });
  }

  async bulkImport(tenantId: string, dto: ImportQuestionsDto, createdById: string) {
    const results = await Promise.allSettled(
      dto.questions.map((q) => this.create(tenantId, q, createdById)),
    );
    return {
      created: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };
  }
}
