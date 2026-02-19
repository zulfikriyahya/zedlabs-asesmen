// ── interfaces/exam-package-settings.interface.ts ────────
export interface ExamPackageSettings {
  duration: number; // menit
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResult: boolean;
  maxAttempts: number;
  passingScore?: number;
}
