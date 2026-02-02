// src/stores/toast.ts
import { atom } from 'nanostores';
import type { ToastMessage } from '@/types/common';

interface ToastState {
  messages: ToastMessage[];
}

const initialState: ToastState = {
  messages: [],
};

export const $toastStore = atom<ToastState>(initialState);

export function showToast(
  type: ToastMessage['type'],
  message: string,
  duration: number = 3000
): void {
  const id = Date.now().toString();
  const toast: ToastMessage = { id, type, message, duration };
  
  const state = $toastStore.get();
  $toastStore.set({
    messages: [...state.messages, toast],
  });
  
  setTimeout(() => {
    removeToast(id);
  }, duration);
}

export function removeToast(id: string): void {
  const state = $toastStore.get();
  $toastStore.set({
    messages: state.messages.filter(m => m.id !== id),
  });
}

export function clearToasts(): void {
  $toastStore.set(initialState);
}