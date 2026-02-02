// src/lib/exam/timer.ts
export class TimerController {
  private timeRemaining: number;
  private intervalId: number | null = null;
  private onTickCallback: ((timeRemaining: number) => void) | null = null;
  private isPaused: boolean = false;

  constructor(durationSeconds: number) {
    this.timeRemaining = durationSeconds;
  }

  start(onTick: (timeRemaining: number) => void): void {
    this.onTickCallback = onTick;
    this.isPaused = false;

    this.intervalId = window.setInterval(() => {
      if (!this.isPaused && this.timeRemaining > 0) {
        this.timeRemaining--;
        this.onTickCallback?.(this.timeRemaining);
      }

      if (this.timeRemaining <= 0) {
        this.stop();
      }
    }, 1000);

    this.onTickCallback(this.timeRemaining);
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getTimeRemaining(): number {
    return this.timeRemaining;
  }

  setTimeRemaining(seconds: number): void {
    this.timeRemaining = seconds;
  }

  addTime(seconds: number): void {
    this.timeRemaining += seconds;
  }

  subtractTime(seconds: number): void {
    this.timeRemaining = Math.max(0, this.timeRemaining - seconds);
  }
}