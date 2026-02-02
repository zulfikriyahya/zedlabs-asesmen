// src/stores/exam.ts
import { atom, computed } from 'nanostores';
import type { Exam, ExamAttempt, ExamState } from '@/types/exam';
import type { Question } from '@/types/question';

interface CurrentExamState {
  exam: Exam | null;
  attempt: ExamAttempt | null;
  questions: Question[];
  currentQuestionIndex: number;
  flags: number[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CurrentExamState = {
  exam: null,
  attempt: null,
  questions: [],
  currentQuestionIndex: 0,
  flags: [],
  isLoading: false,
  error: null,
};

export const $examStore = atom<CurrentExamState>(initialState);

// Computed values
export const $currentQuestion = computed($examStore, (state) => {
  if (state.questions.length === 0) return null;
  return state.questions[state.currentQuestionIndex] || null;
});

export const $totalQuestions = computed($examStore, (state) => {
  return state.questions.length;
});

export const $hasNext = computed($examStore, (state) => {
  return state.currentQuestionIndex < state.questions.length - 1;
});

export const $hasPrevious = computed($examStore, (state) => {
  return state.currentQuestionIndex > 0;
});

// Actions
export function setExam(exam: Exam): void {
  $examStore.set({
    ...$examStore.get(),
    exam,
  });
}

export function setAttempt(attempt: ExamAttempt): void {
  $examStore.set({
    ...$examStore.get(),
    attempt,
  });
}

export function setQuestions(questions: Question[]): void {
  $examStore.set({
    ...$examStore.get(),
    questions,
  });
}

export function setCurrentQuestionIndex(index: number): void {
  const state = $examStore.get();
  if (index >= 0 && index < state.questions.length) {
    $examStore.set({
      ...state,
      currentQuestionIndex: index,
    });
  }
}

export function nextQuestion(): void {
  const state = $examStore.get();
  if (state.currentQuestionIndex < state.questions.length - 1) {
    setCurrentQuestionIndex(state.currentQuestionIndex + 1);
  }
}

export function previousQuestion(): void {
  const state = $examStore.get();
  if (state.currentQuestionIndex > 0) {
    setCurrentQuestionIndex(state.currentQuestionIndex - 1);
  }
}

export function goToQuestion(index: number): void {
  setCurrentQuestionIndex(index);
}

export function toggleFlag(questionId: number): void {
  const state = $examStore.get();
  const flags = [...state.flags];
  const index = flags.indexOf(questionId);
  
  if (index > -1) {
    flags.splice(index, 1);
  } else {
    flags.push(questionId);
  }
  
  $examStore.set({
    ...state,
    flags,
  });
}

export function isFlagged(questionId: number): boolean {
  return $examStore.get().flags.includes(questionId);
}

export function setLoading(isLoading: boolean): void {
  $examStore.set({
    ...$examStore.get(),
    isLoading,
  });
}

export function setError(error: string | null): void {
  $examStore.set({
    ...$examStore.get(),
    error,
  });
}

export function resetExam(): void {
  $examStore.set(initialState);
}