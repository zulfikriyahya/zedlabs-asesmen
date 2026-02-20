interface DownloadProgressProps {
  step: 'idle' | 'downloading' | 'decrypting' | 'ready'
  progress?: number // 0–100, opsional
}

const STEP_LABELS: Record<DownloadProgressProps['step'], string> = {
  idle: 'Siap mengunduh',
  downloading: 'Mengunduh paket soal...',
  decrypting: 'Mendekripsi soal...',
  ready: 'Siap!',
}

export function DownloadProgress({ step, progress }: DownloadProgressProps) {
  const steps: Array<DownloadProgressProps['step']> = ['downloading', 'decrypting', 'ready']
  const currentIdx = steps.indexOf(step)

  return (
    <div className="space-y-3">
      <ul className="steps steps-vertical text-sm">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`step ${i < currentIdx ? 'step-success' : i === currentIdx ? 'step-primary' : ''}`}
          >
            {STEP_LABELS[s]}
          </li>
        ))}
      </ul>
      {progress !== undefined && (
        <progress className="progress progress-primary w-full" value={progress} max={100} />
      )}
    </div>
  )
}
