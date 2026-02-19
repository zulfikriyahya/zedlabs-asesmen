// ── interfaces/correct-answer.interface.ts ───────────────
export interface CorrectAnswer {
  type: 'single' | 'multiple' | 'boolean' | 'matching' | 'text';
  value: string | string[] | boolean | Record<string, string>;
  caseSensitive?: boolean;
  similarityThreshold?: number; // untuk essay
}
