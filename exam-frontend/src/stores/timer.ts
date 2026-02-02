// src/stores/timer.ts
import { atom } from 'nanostores';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  pausedAt: number | null;
}

const initialState: TimerState = {
  timeRemaining: 0,
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedAt: null,
};

export const $timerStore = atom<TimerState>(initialState);

export function setTimeRemaining(seconds: number): void {
  $timerStore.set({
    ...$timerStore.get(),
    timeRemaining: seconds,
  });
}

export function startTimer(): void {
  $timerStore.set({
    ...$timerStore.get(),
    isRunning: true,
    isPaused: false,
    startTime: Date.now(),
  });
}

export function pauseTimer(): void {
  $timerStore.set({
    ...$timerStore.get(),
    isPaused: true,
    pausedAt: Date.now(),
  });
}

export function resumeTimer(): void {
  $timerStore.set({
    ...$timerStore.get(),
    isPaused: false,
    pausedAt: null,
  });
}

export function stopTimer(): void {
  $timerStore.set(initialState);
}

export function decrementTime(): void {
  const state = $timerStore.get();
  if (state.timeRemaining > 0) {
    $timerStore.set({
      ...state,
      timeRemaining: state.timeRemaining - 1,
    });
  }
}