// Utility untuk timer ujian
export class ExamTimer {
  private remainingSeconds: number;
  private intervalId: number | null = null;
  private onTick: (seconds: number) => void;
  private onTimeUp: () => void;

  constructor(initialSeconds: number, onTick: (s: number) => void, onTimeUp: () => void) {
    this.remainingSeconds = initialSeconds;
    this.onTick = onTick;
    this.onTimeUp = onTimeUp;
  }

  start() {
    if (this.intervalId) return;
    
    this.intervalId = window.setInterval(() => {
      this.remainingSeconds--;
      this.onTick(this.remainingSeconds);

      if (this.remainingSeconds <= 0) {
        this.stop();
        this.onTimeUp();
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  sync(serverSeconds: number) {
    // Logic untuk sinkronisasi waktu jika ada selisih besar
    if (Math.abs(this.remainingSeconds - serverSeconds) > 5) {
      this.remainingSeconds = serverSeconds;
    }
  }
}