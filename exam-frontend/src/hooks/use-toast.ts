'use client';
import { useCallback } from 'react';
import { useUiStore } from '@/stores/ui.store';
import type { ToastVariant } from '@/stores/ui.store';

const DEFAULT_DURATION = 4000;

export function useToast() {
  const { addToast, removeToast } = useUiStore();

  const toast = useCallback(
    (msg: string, variant: ToastVariant = 'info', duration = DEFAULT_DURATION) => {
      const id = addToast({ message: msg, variant, duration });
      if (duration > 0) setTimeout(() => removeToast(id), duration);
      return id;
    },
    [addToast, removeToast],
  );

  return {
    toast,
    success: (msg: string) => toast(msg, 'success'),
    error: (msg: string) => toast(msg, 'error'),
    warning: (msg: string) => toast(msg, 'warning'),
    info: (msg: string) => toast(msg, 'info'),
  };
}
