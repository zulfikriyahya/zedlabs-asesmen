// Helper class untuk mengontrol media playback
export class MediaController {
  private element: HTMLMediaElement;

  constructor(element: HTMLMediaElement) {
    this.element = element;
  }

  play() {
    return this.element.play();
  }

  pause() {
    this.element.pause();
  }

  setSpeed(rate: number) {
    this.element.playbackRate = rate;
  }

  seek(time: number) {
    this.element.currentTime = time;
  }
}