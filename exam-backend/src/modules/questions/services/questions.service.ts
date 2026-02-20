import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { decrypt, encrypt } from '../../../common/utils/encryption.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApproveQuestionDto } from '../dto/approve-question.dto';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { ImportQuestionsDto } from '../dto/import-questions.dto';
import { UpdateQuestionDto } from '../dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    private prisma: PrismaService,
    private cfg: ConfigService,
  ) {}

  /** Throw jika ENCRYPTION_KEY tidak dikonfigurasi — mencegah silent failure di production */
  private get encKey(): string {
    const key = this.cfg.get<string>('ENCRYPTION_KEY');
    if (!key || key.length !== 64) {
      throw new InternalServerErrorException(
        'ENCRYPTION_KEY tidak valid. Harus berupa 64 hex chars (32 bytes).',
      );
    }
    return key;
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
    const ca = decrypt(q.correctAnswer as unknown as string, this.encKey);
    return { ...q, correctAnswer: JSON.parse(ca) };
  }

  async create(tenantId: string, dto: CreateQuestionDto, createdById: string) {
    const encAnswer = encrypt(JSON.stringify(dto.correctAnswer), this.encKey);
    const { tagIds, correctAnswer: _ca, ...rest } = dto;

    return this.prisma.question.create({
      data: {
        tenantId,
        createdById,
        subjectId: rest.subjectId,
        type: rest.type,
        content: rest.content as Prisma.InputJsonValue,
        options:
          rest.options !== undefined ? (rest.options as Prisma.InputJsonValue) : Prisma.JsonNull,
        points: rest.points,
        difficulty: rest.difficulty,
        correctAnswer: encAnswer as Prisma.InputJsonValue,
        tags: tagIds?.length ? { create: tagIds.map((tagId: string) => ({ tagId })) } : undefined,
      },
      include: { tags: { include: { tag: true } } },
    });
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
