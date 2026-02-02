// src/stores/offline.ts
import { atom } from 'nanostores';
import type { DownloadedExam } from '@/types/exam';

interface OfflineState {
  downloadedExams: DownloadedExam[];
  isDownloading: boolean;
  currentDownload: number | null;
  downloadProgress: number;
}

const initialState: OfflineState = {
  downloadedExams: [],
  isDownloading: false,
  currentDownload: null,
  downloadProgress: 0,
};

export const $offlineStore = atom<OfflineState>(initialState);

export function setDownloadedExams(exams: DownloadedExam[]): void {
  $offlineStore.set({
    ...$offlineStore.get(),
    downloadedExams: exams,
  });
}

export function addDownloadedExam(exam: DownloadedExam): void {
  const state = $offlineStore.get();
  $offlineStore.set({
    ...state,
    downloadedExams: [...state.downloadedExams, exam],
  });
}

export function setDownloading(isDownloading: boolean, examId?: number): void {
  $offlineStore.set({
    ...$offlineStore.get(),
    isDownloading,
    currentDownload: isDownloading ? examId || null : null,
    downloadProgress: isDownloading ? 0 : 100,
  });
}

export function setDownloadProgress(progress: number): void {
  $offlineStore.set({
    ...$offlineStore.get(),
    downloadProgress: progress,
  });
}

export function clearOfflineData(): void {
  $offlineStore.set(initialState);
}