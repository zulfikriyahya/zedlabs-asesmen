'use client';
import { useEffect, useRef } from 'react';
import { useTimerStore, selectFormattedTime, selectIsWarning } from '@/stores/timer.store';

interface UseTimerParams {
  durationSeconds: number;
  startedAt: number; // Date.now() dari attempt.startedAt
  onExpire?: () => void;
}

export function useTimer({ durationSeconds, startedAt, onExpire }: UseTimerParams) {
  const store = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    store.start(durationSeconds, elapsed);

    intervalRef.current = setInterval(() => {
      const { isRunning, isExpired } = useTimerStore.getState();
      if (!isRunning || isExpired) {
        clearInterval(intervalRef.current!);
        return;
      }
      useTimerStore.getState().tick();
      if (useTimerStore.getState().isExpired) onExpireRef.current?.();
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSeconds, startedAt]);

  return {
    remainingSeconds: store.remainingSeconds,
    formatted: selectFormattedTime(store),
    isWarning: selectIsWarning(store),
    isExpired: store.isExpired,
  };
}
