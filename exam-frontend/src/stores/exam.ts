// src/stores/exam.ts
import { atom, map } from 'nanostores';
import type { Question } from '@/types/question';

// State untuk status UI Ujian
export const $examUI = map({
  isLoading: true,
  isSubmitting: false,
  currentQuestionIndex: 0,
  totalQuestions: 0,
  timeRemaining: 0, // dalam detik
  isSidebarOpen: false,
});

// State untuk status jawaban (untuk navigasi visual)
// Key: questionId, Value: { answered: boolean, flagged: boolean }
export const $questionStatus = map<Record<number, { answered: boolean; flagged: boolean }>>({});

// Actions
export function setExamLoading(loading: boolean) {
  $examUI.setKey('isLoading', loading);
}

export function setCurrentIndex(index: number) {
  $examUI.setKey('currentQuestionIndex', index);
}

export function updateTime(seconds: number) {
  $examUI.setKey('timeRemaining', seconds);
}

export function toggleSidebar() {
  const current = $examUI.get().isSidebarOpen;
  $examUI.setKey('isSidebarOpen', !current);
}

export function updateQuestionStatus(id: number, status: Partial<{ answered: boolean; flagged: boolean }>) {
  const current = $questionStatus.get();
  const existing = current[id] || { answered: false, flagged: false };
  
  $questionStatus.set({
    ...current,
    [id]: { ...existing, ...status }
  });
}

export function initQuestionStatuses(questions: Question[]) {
  const statusMap: Record<number, { answered: boolean; flagged: boolean }> = {};
  questions.forEach(q => {
    statusMap[q.id] = { answered: false, flagged: false };
  });
  $questionStatus.set(statusMap);
}