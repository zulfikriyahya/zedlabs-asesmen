// src/lib/exam/autoSave.ts
export class AutoSaveManager {
  private attemptId: number;
  private intervalId: number | null = null;
  private isPaused: boolean = false;
  private onSaveCallback: (() => Promise<void>) | null = null;

  constructor(attemptId: number) {
    this.attemptId = attemptId;
  }

  start(intervalMs: number, onSave: () => Promise<void>): void {
    this.onSaveCallback = onSave;
    this.isPaused = false;

    this.intervalId = window.setInterval(async () => {
      if (!this.isPaused && this.onSaveCallback) {
        try {
          await this.onSaveCallback();
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, intervalMs);
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

  async saveNow(): Promise<void> {
    if (this.onSaveCallback) {
      await this.onSaveCallback();
    }
  }
}