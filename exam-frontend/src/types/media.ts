// src/types/media.ts
export type MediaRecorderType = 'audio' | 'video';
export type MediaRecorderState = 'inactive' | 'recording' | 'paused';

export interface MediaRecorderOptions {
  type: MediaRecorderType;
  maxDuration: number; // in seconds
  maxSize?: number; // in bytes
  mimeType?: string;
}

export interface RecordedMedia {
  blob: Blob;
  duration: number;
  type: MediaRecorderType;
  size: number;
  mimeType: string;
}

export interface MediaPlayerOptions {
  url: string;
  type: 'audio' | 'video';
  repeatable?: boolean;
  maxPlays?: number;
}

export interface MediaPlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playCount: number;
  maxPlays?: number;
}