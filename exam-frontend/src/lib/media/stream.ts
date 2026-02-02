// Helper untuk mendapatkan media stream
export async function getMediaStream(audio: boolean = true, video: boolean = false): Promise<MediaStream> {
  try {
    const constraints: MediaStreamConstraints = {
      audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
      video: video ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false
    };
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('Error accessing media devices.', error);
    throw error;
  }
}

export function stopMediaStream(stream: MediaStream) {
  stream.getTracks().forEach(track => track.stop());
}