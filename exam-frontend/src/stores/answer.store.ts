import { create } from 'zustand';
import type { AnswerValue } from '@/types/answer';
import type { ID } from '@/types/common';

// State in-memory (Zustand) — sumber kebenaran untuk UI
// Persistensi ke IndexedDB dilakukan via useAutoSave / lib/exam/auto-save.ts
interface AnswerState {
  // Map questionId → answer value
  answers: Record<ID, AnswerValue>;
  // Map questionId → array objectKey (MinIO) untuk media
  mediaUrls: Record<ID, string[]>;
  // Map questionId → apakah sudah tersync ke server
  synced: Record<ID, boolean>;
  // Timestamp terakhir save per questionId
  lastSavedAt: Record<ID, number>;

  setAnswer: (questionId: ID, value: AnswerValue) => void;
  setMediaUrls: (questionId: ID, urls: string[]) => void;
  addMediaUrl: (questionId: ID, url: string) => void;
  markSynced: (questionId: ID) => void;
  markAllUnsynced: () => void;
  getAnswer: (questionId: ID) => AnswerValue | undefined;
  hasAnswer: (questionId: ID) => boolean;
  clearAnswers: () => void;
  // Inisialisasi dari IndexedDB saat resume
  hydrateFromLocal: (
    answers: Array<{ questionId: ID; answer: AnswerValue; mediaUrls: string[] }>,
  ) => void;
}

export const useAnswerStore = create<AnswerState>((set, get) => ({
  answers: {},
  mediaUrls: {},
  synced: {},
  lastSavedAt: {},

  setAnswer: (questionId, value) =>
    set((s) => ({
      answers: { ...s.answers, [questionId]: value },
      synced: { ...s.synced, [questionId]: false },
      lastSavedAt: { ...s.lastSavedAt, [questionId]: Date.now() },
    })),

  setMediaUrls: (questionId, urls) =>
    set((s) => ({ mediaUrls: { ...s.mediaUrls, [questionId]: urls } })),

  addMediaUrl: (questionId, url) =>
    set((s) => ({
      mediaUrls: {
        ...s.mediaUrls,
        [questionId]: [...(s.mediaUrls[questionId] ?? []), url],
      },
    })),

  markSynced: (questionId) => set((s) => ({ synced: { ...s.synced, [questionId]: true } })),

  markAllUnsynced: () =>
    set((s) => ({
      synced: Object.fromEntries(Object.keys(s.answers).map((k) => [k, false])),
    })),

  getAnswer: (questionId) => get().answers[questionId],

  hasAnswer: (questionId) => get().answers[questionId] !== undefined,

  clearAnswers: () => set({ answers: {}, mediaUrls: {}, synced: {}, lastSavedAt: {} }),

  hydrateFromLocal: (items) =>
    set(() => ({
      answers: Object.fromEntries(items.map((i) => [i.questionId, i.answer])),
      mediaUrls: Object.fromEntries(items.map((i) => [i.questionId, i.mediaUrls])),
      synced: Object.fromEntries(items.map((i) => [i.questionId, true])),
      lastSavedAt: Object.fromEntries(items.map((i) => [i.questionId, Date.now()])),
    })),
}));

// Selector: jumlah soal yang sudah dijawab
export const selectAnsweredCount = (s: AnswerState): number => Object.keys(s.answers).length;

// Selector: daftar questionId yang belum tersync
export const selectUnsyncedIds = (s: AnswerState): ID[] =>
  Object.entries(s.synced)
    .filter(([, v]) => !v)
    .map(([k]) => k);
