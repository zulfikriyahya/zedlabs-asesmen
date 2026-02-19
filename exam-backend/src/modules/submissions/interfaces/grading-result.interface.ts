// ── interfaces/grading-result.interface.ts ───────────────
export interface GradingResult {
  questionId: string;
  score: number;
  maxScore: number;
  isCorrect: boolean;
  feedback?: string;
  requiresManual: boolean;
}
