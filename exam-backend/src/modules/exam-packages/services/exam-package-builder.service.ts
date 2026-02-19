// ── services/exam-package-builder.service.ts ─────────────
import { Injectable as IB } from '@nestjs/common';
import { shuffleArray } from '../../../common/utils/randomizer.util';
import { decrypt } from '../../../common/utils/encryption.util';
import { ConfigService } from '@nestjs/config';

@IB()
export class ExamPackageBuilderService {
  constructor(
    private prisma: PrismaService,
    private cfg: ConfigService,
  ) {}

  /**
   * Build payload paket ujian untuk dikirim ke siswa (terenkripsi di layer atas).
   * correctAnswer dienkripsi ulang dengan session key sementara.
   */
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
      content: pq.question.content,
      options: pq.question.options,
      points: pq.points ?? pq.question.points,
      order: pq.order,
      // correctAnswer dikirim terenkripsi — client decrypt dengan session key
      correctAnswer: pq.question.correctAnswer,
    }));

    if (shuffle) questions = shuffleArray(questions);

    return {
      packageId,
      title: pkg.title,
      settings: pkg.settings,
      questions,
      checksum: '', // diisi oleh caller
    };
  }
}
