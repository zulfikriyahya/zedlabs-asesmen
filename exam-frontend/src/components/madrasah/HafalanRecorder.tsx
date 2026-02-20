'use client'
import { useState, useEffect, useRef } from 'react'
import { useMediaRecorder } from '@/hooks/use-media-recorder'
import { saveMediaBlob } from '@/lib/db/queries'
import { uploadInChunks } from '@/lib/media/chunked-upload'
import { useToast } from '@/hooks/use-toast'
import { parseErrorMessage } from '@/lib/utils/error'
import { formatDuration } from '@/lib/exam/timer'
import { clsx } from 'clsx'
import type { ID } from '@/types/common'

interface HafalanSection {
  id: string
  label: string          // misal: "Surah Al-Fatihah"
  arabicText?: string    // teks referensi jika ada
  maxDurationSec?: number
}

interface HafalanRecorderProps {
  questionId: ID
  attemptId: ID
  sessionId: ID
  sections?: HafalanSection[]   // jika ada beberapa bagian hafalan
  maxDurationSec?: number
  onUploaded?: (objectKey: string, sectionId?: string) => void
  disabled?: boolean
}

export function HafalanRecorder({
  questionId,
  attemptId,
  sessionId,
  sections,
  maxDurationSec = 180,
  onUploaded,
  disabled,
}: HafalanRecorderProps) {
  const { success, error: toastError } = useToast()
  const [elapsed, setElapsed] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [recordings, setRecordings] = useState<Record<string, { blob: Blob; url: string; uploaded: boolean }>>({})
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>(sections?.[0]?.id)
  const activeSection = sections?.find(s => s.id === activeSectionId)
  const effectiveMax = activeSection?.maxDurationSec ?? maxDurationSec

  const { isRecording, error, start, stop } = useMediaRecorder({
    mimeType: 'audio/webm;codecs=opus',
    maxDurationMs: effectiveMax * 1000,
    onStop: async (result) => {
      const url = URL.createObjectURL(result.blob)
      const key = activeSectionId ?? 'default'
      setRecordings(prev => ({ ...prev, [key]: { blob: result.blob, url, uploaded: false } }))

      await saveMediaBlob({
        questionId, attemptId, sessionId,
        mimeType: result.mimeType,
        blob: result.blob,
        duration: result.duration,
        size: result.size,
        recordedAt: Date.now(),
        uploaded: false,
      })

      if (navigator.onLine) {
        await handleUpload(result.blob, key)
      }
    },
  })

  useEffect(() => {
    if (!isRecording) { setElapsed(0); return }
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [isRecording])

  const handleUpload = async (blob: Blob, sectionKey: string) => {
    setUploading(true)
    setUploadPct(0)
    try {
      const objectKey = await uploadInChunks(blob, {
        questionId: `${questionId}_${sectionKey}`,
        attemptId,
        onProgress: setUploadPct,
      })
      setRecordings(prev => ({
        ...prev,
        [sectionKey]: { ...prev[sectionKey]!, uploaded: true },
      }))
      success('Rekaman hafalan berhasil diunggah')
      onUploaded?.(objectKey, sectionKey)
    } catch (e) {
      toastError(parseErrorMessage(e))
    } finally {
      setUploading(false)
    }
  }

  const pct = Math.round((elapsed / effectiveMax) * 100)
  const isWarning = elapsed >= effectiveMax * 0.8

  return (
    <div className="space-y-4 rounded-box border border-base-300 bg-base-100 p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎙</span>
        <h3 className="font-semibold text-sm">Rekaman Hafalan</h3>
      </div>

      {/* Section tabs jika ada beberapa bagian */}
      {sections && sections.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {sections.map(s => {
            const rec = recordings[s.id]
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSectionId(s.id)}
                disabled={isRecording}
                className={clsx(
                  'btn btn-xs gap-1',
                  activeSectionId === s.id ? 'btn-primary' : 'btn-ghost border border-base-300',
                )}
              >
                {rec?.uploaded ? '✓' : rec ? '⏸' : '○'}
                {s.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Teks referensi Arabic jika ada */}
      {activeSection?.arabicText && (
        <div className="rounded-box bg-base-200 p-3">
          <p className="text-xs text-base-content/50 mb-1">Teks Referensi:</p>
          <p
            className="arabic-text text-right leading-loose"
            dir="rtl"
            style={{ fontFamily: "'Amiri', serif", fontSize: '1.1rem' }}
          >
            {activeSection.arabicText}
          </p>
        </div>
      )}

      {/* Recorder UI */}
      <div className={clsx(
        'flex items-center gap-4 rounded-box p-3',
        isRecording ? 'bg-error/5 border border-error/30' : 'bg-base-200',
      )}>
        <div className={clsx(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl',
          isRecording ? 'bg-error/20 animate-pulse' : 'bg-base-300',
        )}>
          {isRecording ? '🔴' : '🎙'}
        </div>

        <div className="flex-1 min-w-0">
          {isRecording ? (
            <>
              <p className={clsx('text-sm font-medium', isWarning && 'text-warning')}>
                Merekam... {formatDuration(elapsed)} / {formatDuration(effectiveMax)}
              </p>
              <progress
                className={clsx('progress w-full h-2 mt-1', isWarning ? 'progress-warning' : 'progress-error')}
                value={elapsed}
                max={effectiveMax}
              />
            </>
          ) : uploading ? (
            <>
              <p className="text-sm text-primary font-medium">Mengunggah... {uploadPct}%</p>
              <progress className="progress progress-primary w-full h-2 mt-1" value={uploadPct} max={100} />
            </>
          ) : recordings[activeSectionId ?? 'default']?.uploaded ? (
            <p className="text-sm font-medium text-success">✓ Hafalan berhasil direkam & diunggah</p>
          ) : recordings[activeSectionId ?? 'default'] ? (
            <p className="text-sm text-warning font-medium">Rekaman tersimpan lokal, belum diunggah</p>
          ) : (
            <p className="text-sm text-base-content/60">
              {activeSection ? `Rekam hafalan: ${activeSection.label}` : 'Rekam hafalan Anda'}
              · Maks {formatDuration(effectiveMax)}
            </p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {isRecording ? (
            <button onClick={stop} className="btn btn-error btn-sm">■ Stop</button>
          ) : (
            <button
              onClick={() => void start()}
              disabled={disabled || uploading}
              className="btn btn-primary btn-sm"
            >
              🎙 Rekam
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-error">⚠ {error}</p>}

      {/* Playback per section */}
      {Object.entries(recordings).map(([key, rec]) => (
        <div key={key} className="rounded-box border border-base-300 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-base-content/60">
              {sections?.find(s => s.id === key)?.label ?? 'Rekaman'}{' '}
              {rec.uploaded && <span className="text-success">✓ Terunggah</span>}
            </p>
            {!rec.uploaded && navigator.onLine && !uploading && (
              <button
                className="btn btn-xs btn-outline btn-primary"
                onClick={() => void handleUpload(rec.blob, key)}
              >
                🔄 Upload
              </button>
            )}
          </div>
          <audio src={rec.url} controls className="w-full h-8" />
        </div>
      ))}

      {/* Progress summary jika banyak sections */}
      {sections && sections.length > 1 && (
        <div className="text-xs text-base-content/50 text-right">
          {Object.values(recordings).filter(r => r.uploaded).length} / {sections.length} bagian selesai
        </div>
      )}
    </div>
  )
}
