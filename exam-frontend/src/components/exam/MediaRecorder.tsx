'use client'
import { useState, useEffect } from 'react'
import { useMediaRecorder } from '@/hooks/use-media-recorder'
import { saveMediaBlob } from '@/lib/db/queries'
import { uploadInChunks } from '@/lib/media/chunked-upload'
import { useToast } from '@/hooks/use-toast'
import { parseErrorMessage } from '@/lib/utils/error'
import { formatDuration } from '@/lib/exam/timer'
import { clsx } from 'clsx'
import type { ID } from '@/types/common'
import type { RecordingResult } from '@/types/media'

interface ExamMediaRecorderProps {
  questionId: ID
  attemptId: ID
  sessionId: ID
  mode?: 'audio' | 'video'
  onUploaded?: (objectKey: string) => void
  disabled?: boolean
}

export function ExamMediaRecorder({
  questionId, attemptId, sessionId, mode = 'audio', onUploaded, disabled,
}: ExamMediaRecorderProps) {
  const { success, error: toastError } = useToast()
  const [elapsed, setElapsed] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [savedBlob, setSavedBlob] = useState<Blob | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  const MAX_SEC = Number(process.env.NEXT_PUBLIC_MAX_RECORDING_DURATION ?? 300)

  const { isRecording, error, start, stop } = useMediaRecorder({
    mimeType: mode === 'audio' ? 'audio/webm;codecs=opus' : 'video/webm;codecs=vp9,opus',
    maxDurationMs: MAX_SEC * 1000,
    onStop: async (result: RecordingResult) => {
      setSavedBlob(result.blob)
      setBlobUrl(URL.createObjectURL(result.blob))
      // Simpan ke IndexedDB dulu (offline-first)
      await saveMediaBlob({
        questionId, attemptId, sessionId,
        mimeType: result.mimeType,
        blob: result.blob,
        duration: result.duration,
        size: result.size,
        recordedAt: Date.now(),
        uploaded: false,
      })
      // Langsung coba upload jika online
      if (navigator.onLine) void handleUpload(result.blob)
    },
  })

  // Timer
  useEffect(() => {
    if (!isRecording) { setElapsed(0); return }
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [isRecording])

  const handleUpload = async (blob: Blob) => {
    setUploading(true)
    setUploadPct(0)
    try {
      const key = await uploadInChunks(blob, {
        questionId, attemptId,
        onProgress: setUploadPct,
      })
      success('Rekaman berhasil diunggah')
      onUploaded?.(key)
    } catch (e) {
      toastError(`Upload gagal: ${parseErrorMessage(e)}. Akan dicoba ulang saat online.`)
    } finally {
      setUploading(false)
    }
  }

  const pct = Math.round((elapsed / MAX_SEC) * 100)
  const isWarning = elapsed >= MAX_SEC * 0.8

  return (
    <div className="space-y-3">
      {error && (
        <div className="alert alert-error text-sm">
          <span>⚠ {error}</span>
        </div>
      )}

      {/* Recording UI */}
      <div className="flex items-center gap-4 rounded-box border border-base-300 bg-base-200 p-4">
        {/* Status dot */}
        <div className={clsx(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl',
          isRecording ? 'bg-error/10' : 'bg-base-300',
        )}>
          {isRecording
            ? <span className="animate-pulse">🔴</span>
            : mode === 'audio' ? '🎙' : '🎥'}
        </div>

        <div className="flex-1 min-w-0">
          {isRecording ? (
            <>
              <p className={clsx('text-sm font-medium', isWarning && 'text-warning')}>
                Merekam... {formatDuration(elapsed)} / {formatDuration(MAX_SEC)}
              </p>
              <progress
                className={clsx('progress w-full mt-1', isWarning ? 'progress-warning' : 'progress-error')}
                value={elapsed}
                max={MAX_SEC}
              />
            </>
          ) : uploading ? (
            <>
              <p className="text-sm font-medium text-primary">Mengunggah rekaman... {uploadPct}%</p>
              <progress className="progress progress-primary w-full mt-1" value={uploadPct} max={100} />
            </>
          ) : savedBlob ? (
            <p className="text-sm text-success font-medium">✓ Rekaman tersimpan</p>
          ) : (
            <p className="text-sm text-base-content/60">
              {mode === 'audio' ? 'Rekam jawaban audio' : 'Rekam jawaban video'} · Maks {formatDuration(MAX_SEC)}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 shrink-0">
          {isRecording ? (
            <button onClick={stop} className="btn btn-error btn-sm gap-1">
              <span>■</span> Stop
            </button>
          ) : (
            <button
              onClick={() => void start()}
              disabled={disabled || uploading}
              className="btn btn-primary btn-sm gap-1"
            >
              {mode === 'audio' ? '🎙' : '🎥'} Rekam
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      {blobUrl && !isRecording && (
        <div className="rounded-box border border-base-300 bg-base-100 p-3">
          <p className="text-xs text-base-content/50 mb-2">Preview rekaman:</p>
          {mode === 'audio'
            ? <audio src={blobUrl} controls className="w-full h-10" />
            : <video src={blobUrl} controls className="w-full max-h-48 rounded" />
          }
          {!uploading && navigator.onLine && (
            <button
              className="btn btn-xs btn-outline btn-primary mt-2"
              onClick={() => savedBlob && void handleUpload(savedBlob)}
            >
              🔄 Upload Ulang
            </button>
          )}
        </div>
      )}
    </div>
  )
}
