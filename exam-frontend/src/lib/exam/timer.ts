// src/lib/exam/timer.ts
export class TimerController {
  private durationSeconds: number;
  private endTime: number;
  private intervalId: number | null = null;
  private onTick: (remaining: number) => void;
  private onComplete: () => void;
  private isPaused: boolean = false;
  private pausedTimeRemaining: number = 0;

  constructor(
    durationSeconds: number, 
    onTick: (remaining: number) => void,
    onComplete: () => void
  ) {
    this.durationSeconds = durationSeconds;
    this.onTick = onTick;
    this.onComplete = onComplete;
    // Set initial end time
    this.endTime = Date.now() + (durationSeconds * 1000);
  }

  start() {
    if (this.intervalId) return;

    // Jika resume dari pause, hitung ulang endTime
    if (this.isPaused) {
      this.endTime = Date.now() + (this.pausedTimeRemaining * 1000);
      this.isPaused = false;
    }

    const tick = () => {
      const now = Date.now();
      const remainingMs = this.endTime - now;
      const remainingSec = Math.ceil(remainingMs / 1000);

      if (remainingSec <= 0) {
        this.stop();
        this.onTick(0);
        this.onComplete();
      } else {
        this.onTick(remainingSec);
      }
    };

    // Run immediately
    tick();
    
    // Check every second
    this.intervalId = window.setInterval(tick, 1000);
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    const now = Date.now();
    const remainingMs = Math.max(0, this.endTime - now);
    this.pausedTimeRemaining = remainingMs / 1000;
    this.isPaused = true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Sinkronisasi waktu jika server mendeteksi drift
  sync(serverRemainingSeconds: number) {
    this.endTime = Date.now() + (serverRemainingSeconds * 1000);
  }
}