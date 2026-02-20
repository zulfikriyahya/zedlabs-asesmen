/**
 * Orchestrator untuk alur ujian siswa:
 * download → dekripsi → inisialisasi store → submit
 */

import { decryptExamPackage } from './package-decoder';
import { applyRandomization } from './randomizer';
import { saveAnswerToLocal } from './auto-save';
import { saveExamPackage } from '@/lib/db/queries';
import { submissionsApi } from '@/lib/api/submissions.api';
import { keyManager } from '@/lib/crypto/key-manager';
import { generateDeviceFingerprint } from '@/lib/crypto/checksum';
import type { DecryptedExamPackage } from '@/types/exam';
import type { ID } from '@/types/common';
import { v4 as uuidv4 } from 'uuid';

export interface StartExamResult {
  decryptedPackage: DecryptedExamPackage;
  attemptId: ID;
}

export async function startExam(tokenCode: string): Promise<StartExamResult> {
  const fingerprint = await generateDeviceFingerprint();

  // 1. Download paket + upsert attempt (idempoten)
  const { attempt, encryptedPackage, sessionKey } = await submissionsApi.startAttempt({
    tokenCode,
    idempotencyKey: uuidv4(),
    deviceFingerprint: fingerprint,
  });

  // 2. Simpan encrypted ke IndexedDB (untuk recovery offline)
  await saveExamPackage({
    sessionId: attempt.sessionId,
    attemptId: attempt.id,
    packageHash: encryptedPackage.packageHash,
    encryptedData: encryptedPackage.encryptedData,
    iv: encryptedPackage.iv,
    expiresAt: new Date(encryptedPackage.expiresAt).getTime(),
    storedAt: Date.now(),
  });

  // 3. Dekripsi di memori (key tidak pernah masuk IndexedDB)
  const decrypted = await decryptExamPackage(encryptedPackage, sessionKey);

  // 4. Terapkan pengacakan
  const shuffled = applyRandomization(decrypted.questions, decrypted.settings);

  return { decryptedPackage: { ...decrypted, questions: shuffled }, attemptId: attempt.id };
}

export async function submitExam(attemptId: ID): Promise<void> {
  await submissionsApi.submitExam({
    attemptId,
    idempotencyKey: uuidv4(),
  });
}
