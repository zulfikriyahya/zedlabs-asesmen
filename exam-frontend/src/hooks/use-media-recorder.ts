'use client';
import { useState, useRef, useCallback } from 'react';
import type { RecordingResult } from '@/types/media';

interface UseMediaRecorderOptions {
  mimeType?: string;
  maxDurationMs?: number;
  onStop?: (result: RecordingResult) => void;
}

export function useMediaRecorder(opts: UseMediaRecorderOptions = {}) {
  const {
    mimeType = 'audio/webm;codecs=opus',
    maxDurationMs = Number(process.env.NEXT_PUBLIC_MAX_RECORDING_DURATION ?? 300) * 1000,
    onStop,
  } = opts;

  const [isRecording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onStopRef = useRef(onStop);
  onStopRef.current = onStop;

  const stop = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    recorderRef.current?.stop();
  }, []);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        onStopRef.current?.({ blob, mimeType, duration, size: blob.size });
        setRecording(false);
      };

      recorder.start(1000);
      recorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setRecording(true);

      timeoutRef.current = setTimeout(() => stop(), maxDurationMs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengakses mikrofon');
    }
  }, [mimeType, maxDurationMs, stop]);

  return { isRecording, error, start, stop };
}
