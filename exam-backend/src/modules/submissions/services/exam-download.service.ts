// ── services/exam-download.service.ts ────────────────────
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExamPackageBuilderService } from '../../exam-packages/services/exam-package-builder.service';
import { sha256 } from '../../../common/utils/checksum.util';
import { SessionStatus, AttemptStatus } from '../../../common/enums/exam-status.enum';
import { isWithinWindow } from '../../../common/utils/time-validation.util';
import { hashFingerprint } from '../../../common/utils/device-fingerprint.util';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ExamDownloadService {
  constructor(
    private prisma: PrismaService,
    private builder: ExamPackageBuilderService,
  ) {}

  async downloadPackage(
    tenantId: string,
    sessionId: string,
    userId: string,
    tokenCode: string,
    deviceFingerprint: string,
    idempotencyKey: string,
  ): Promise<DownloadablePackage> {
    // 1. Validasi sesi
    const session = await this.prisma.examSession.findFirst({
      where: { id: sessionId, tenantId, status: SessionStatus.ACTIVE },
      include: { examPackage: true },
    });
    if (!session) throw new NotFoundException('Sesi tidak aktif atau tidak ditemukan');

    // 2. Validasi waktu
    if (!isWithinWindow(session.startTime, session.endTime)) {
      throw new BadRequestException('Ujian tidak dalam jangka waktu yang valid');
    }

    // 3. Validasi token peserta
    const ss = await this.prisma.sessionStudent.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
    if (!ss || ss.tokenCode !== tokenCode) {
      throw new BadRequestException('Token tidak valid');
    }

    // 4. Idempotent attempt creation
    const attempt = await this.prisma.examAttempt.upsert({
      where: { idempotencyKey },
      create: {
        sessionId,
        userId,
        idempotencyKey,
        deviceFingerprint: hashFingerprint(deviceFingerprint),
        status: AttemptStatus.IN_PROGRESS,
      },
      update: {},
    });

    // 5. Build paket
    const settings = session.examPackage.settings as Record<string, { shuffleQuestions?: boolean }>;
    const pkg = await this.builder.buildForDownload(
      tenantId,
      session.examPackageId,
      settings?.shuffleQuestions ?? false,
    );

    // 6. Checksum
    const checksum = sha256(JSON.stringify(pkg.questions));

    return {
      ...pkg,
      sessionId,
      attemptId: attempt.id,
      checksum,
      encryptedKey: '', // enkripsi key dilakukan di layer transport/crypto
      expiresAt: session.endTime.toISOString(),
    };
  }
}
