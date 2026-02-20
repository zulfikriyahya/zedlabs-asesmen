// ────────────────────────────────────────────────────────────────────────────
// src/modules/exam-packages/services/exam-package-builder.service.ts — fix checksum
// ────────────────────────────────────────────────────────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { shuffleArray } from '../../../common/utils/randomizer.util';
import { sha256 } from '../../../common/utils/checksum.util';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ExamPackageBuilderService {
  constructor(
    private prisma: PrismaService,
    private cfg: ConfigService,
  ) {}

  async buildForDownload(tenantId: string, packageId: string, shuffle: boolean) {
    const pkg = await this.prisma.examPackage.findFirst({
      where: { id: packageId, tenantId, status: 'PUBLISHED' },
      include: {
        questions: {
          include: { question: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!pkg) throw new NotFoundException('Paket tidak tersedia');

    let questions = pkg.questions.map((pq) => ({
      id: pq.question.id,
      type: pq.question.type,
      content: pq.question.content as Record<string, unknown>,
      options: pq.question.options as Record<string, unknown> | undefined,
      points: pq.points ?? pq.question.points,
      order: pq.order,
      correctAnswer: pq.question.correctAnswer as string, // tetap encrypted
    }));

    if (shuffle) questions = shuffleArray(questions);

    // Checksum dari soal tanpa correctAnswer (siswa tidak dapat kunci jawaban mentah)
    const forChecksum = questions.map(({ correctAnswer: _ca, ...rest }) => rest);
    const checksum = sha256(JSON.stringify(forChecksum));

    return {
      packageId,
      title: pkg.title,
      settings: pkg.settings,
      questions,
      checksum,
    };
  }
}
