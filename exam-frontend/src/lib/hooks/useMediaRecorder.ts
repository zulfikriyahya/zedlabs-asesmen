import { useState, useCallback, useRef } from 'react'; // Jika menggunakan React/Preact
// Atau versi Vanilla JS class untuk penggunaan langsung di Astro script

export class MediaRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  
  public onStop: ((blob: Blob, duration: number) => void) | null = null;
  public onDataAvailable: ((data: Blob) => void) | null = null;
  private startTime: number = 0;

  async start(type: 'audio' | 'video'): Promise<MediaStream> {
    try {
      const constraints = type === 'audio' 
        ? { audio: true } 
        : { audio: true, video: { facingMode: 'user', width: 1280, height: 720 } };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const mimeType = type === 'audio' 
        ? 'audio/webm;codecs=opus' 
        : 'video/webm;codecs=vp9';

      // Fallback mime types checking could go here

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.chunks = [];
      
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
          this.onDataAvailable?.(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        const duration = (Date.now() - this.startTime) / 1000;
        this.onStop?.(blob, duration);
        this.cleanup();
      };

      this.mediaRecorder.start(1000); // Collect chunks every second
      this.startTime = Date.now();
      
      return this.stream;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}