// ── interfaces/exam-package.interface.ts ─────────────────
export interface DownloadablePackage {
  packageId: string;
  sessionId: string;
  attemptId: string;
  title: string;
  settings: Record<string, unknown>;
  questions: DownloadableQuestion[];
  encryptedKey: string; // AES-GCM key terenkripsi dengan public key sesi
  checksum: string;
  expiresAt: string;
}

export interface DownloadableQuestion {
  id: string;
  type: string;
  content: Record<string, unknown>;
  options?: Record<string, unknown>;
  points: number;
  order: number;
  correctAnswer: string; // terenkripsi
}
