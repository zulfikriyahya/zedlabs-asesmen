// ── factories/exam-package.factory.ts ────────────────────
export const examPackageFactory = (
  overrides: Partial<{ tenantId: string; title: string }> = {},
) => ({
  tenantId: overrides.tenantId ?? 'test-tenant-id',
  title: overrides.title ?? `Paket Ujian ${Date.now()}`,
  settings: {
    duration: 90,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResult: true,
    maxAttempts: 1,
  },
  status: 'DRAFT',
});
