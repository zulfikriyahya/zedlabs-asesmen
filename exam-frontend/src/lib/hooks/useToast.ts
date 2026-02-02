import { showToast, removeToast, clearToasts } from '@/stores/toast';

export function useToast() {
  return {
    success: (message: string, duration?: number) => showToast('success', message, duration),
    error: (message: string, duration?: number) => showToast('error', message, duration),
    info: (message: string, duration?: number) => showToast('info', message, duration),
    warning: (message: string, duration?: number) => showToast('warning', message, duration),
    remove: removeToast,
    clear: clearToasts,
  };
}