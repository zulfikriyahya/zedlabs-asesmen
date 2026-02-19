// ── bullmq.config.ts ─────────────────────────────────────
export const bullmqConfig = registerAs('bullmq', () => ({
  concurrency: parseInt(process.env.BULLMQ_CONCURRENCY ?? '10', 10),
}));
