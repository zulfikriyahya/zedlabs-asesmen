import { create } from 'zustand';
import type { DecryptedExamPackage, ExamAttempt } from '@/types/exam';
import type { ExamQuestion } from '@/types/question';

interface ExamState {
  // Data paket — hanya di memori setelah dekripsi
  activePackage: DecryptedExamPackage | null;
  activeAttempt: ExamAttempt | null;
  currentQuestionIndex: number;
  questionOrder: string[]; // array questionId setelah shuffle

  // Status UI
  isStarted: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;

  // Actions
  setPackage: (pkg: DecryptedExamPackage, attempt: ExamAttempt) => void;
  setQuestionOrder: (ids: string[]) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setSubmitting: (v: boolean) => void;
  markSubmitted: () => void;
  clearExam: () => void;
}

export const useExamStore = create<ExamState>((set, get) => ({
  activePackage: null,
  activeAttempt: null,
  currentQuestionIndex: 0,
  questionOrder: [],
  isStarted: false,
  isSubmitting: false,
  isSubmitted: false,

  setPackage: (pkg, attempt) =>
    set({
      activePackage: pkg,
      activeAttempt: attempt,
      currentQuestionIndex: 0,
      isStarted: true,
      isSubmitted: false,
      // Default order sebelum shuffle
      questionOrder: pkg.questions.map((q) => q.id),
    }),

  setQuestionOrder: (ids) => set({ questionOrder: ids }),

  goToQuestion: (index) => {
    const max = get().activePackage?.questions.length ?? 0;
    if (index >= 0 && index < max) set({ currentQuestionIndex: index });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, activePackage } = get();
    const max = activePackage?.questions.length ?? 0;
    if (currentQuestionIndex < max - 1) set({ currentQuestionIndex: currentQuestionIndex + 1 });
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) set({ currentQuestionIndex: currentQuestionIndex - 1 });
  },

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  markSubmitted: () => set({ isSubmitting: false, isSubmitted: true }),

  clearExam: () =>
    set({
      activePackage: null,
      activeAttempt: null,
      currentQuestionIndex: 0,
      questionOrder: [],
      isStarted: false,
      isSubmitting: false,
      isSubmitted: false,
    }),
}));

// Selector helpers
export const selectCurrentQuestion = (s: ExamState): ExamQuestion | null => {
  if (!s.activePackage) return null;
  const id = s.questionOrder[s.currentQuestionIndex];
  return s.activePackage.questions.find((q) => q.id === id) ?? null;
};

export const selectTotalQuestions = (s: ExamState): number =>
  s.activePackage?.questions.length ?? 0;
