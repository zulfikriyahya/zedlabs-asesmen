// ════════════════════════════════════════════════════════════════════════════
// src/modules/question-tags/services/question-tags.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

@Injectable()
export class QuestionTagsService {
  constructor(private prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.questionTag.findMany({ where: { tenantId } });
  }

  async create(tenantId: string, dto: CreateTagDto) {
    const exists = await this.prisma.questionTag.findUnique({
      where: { tenantId_name: { tenantId, name: dto.name } },
    });
    if (exists) throw new ConflictException(`Tag '${dto.name}' sudah ada`);
    return this.prisma.questionTag.create({ data: { tenantId, name: dto.name } });
  }

  async update(tenantId: string, id: string, dto: UpdateTagDto) {
    const tag = await this.prisma.questionTag.findFirst({ where: { id, tenantId } });
    if (!tag) throw new NotFoundException('Tag tidak ditemukan');
    return this.prisma.questionTag.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const tag = await this.prisma.questionTag.findFirst({ where: { id, tenantId } });
    if (!tag) throw new NotFoundException('Tag tidak ditemukan');
    return this.prisma.questionTag.delete({ where: { id } });
  }
}
