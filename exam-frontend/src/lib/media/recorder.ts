// Wrapper for MediaRecorder API to handle browser inconsistencies
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  
  async start(): Promise<MediaStream> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.chunks = [];
    
    this.mediaRecorder.ondataavailable = (e) => {
      this.chunks.push(e.data);
    };
    
    this.mediaRecorder.start();
    return stream;
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject('Recorder not initialized');
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        resolve(blob);
      };
      
      this.mediaRecorder.stop();
    });
  }
}