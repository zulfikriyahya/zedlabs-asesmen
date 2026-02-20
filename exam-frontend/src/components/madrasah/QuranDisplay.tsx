'use client'
import { useState } from 'react'
import { clsx } from 'clsx'

interface Ayah {
  number: number    // nomor ayat dalam surah
  text: string      // teks Arab
  translation?: string
}

interface QuranDisplayProps {
  surahName: string
  surahNumber?: number
  ayahs: Ayah[]
  showTranslation?: boolean
  showBismillah?: boolean  // tampilkan basmalah di awal
  highlightAyahs?: number[]  // nomor ayat yang di-highlight (untuk soal)
  mode?: 'read' | 'question'  // 'question' = ada interaksi
  onAyahClick?: (ayah: Ayah) => void
  className?: string
}

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'

export function QuranDisplay({
  surahName,
  surahNumber,
  ayahs,
  showTranslation = false,
  showBismillah = true,
  highlightAyahs = [],
  mode = 'read',
  onAyahClick,
  className,
}: QuranDisplayProps) {
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null)
  const [showTrans, setShowTrans] = useState(showTranslation)

  const handleAyahClick = (ayah: Ayah) => {
    if (mode !== 'question') return
    setSelectedAyah(n => n === ayah.number ? null : ayah.number)
    onAyahClick?.(ayah)
  }

  return (
    <div className={clsx('rounded-box border border-base-300 bg-base-100', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-base-200 px-4 py-3">
        <div>
          <h3 className="font-semibold text-sm">{surahName}</h3>
          {surahNumber && <p className="text-xs text-base-content/50">QS. {surahNumber}</p>}
        </div>
        <div className="flex items-center gap-2">
          {ayahs.some(a => a.translation) && (
            <button
              type="button"
              onClick={() => setShowTrans(v => !v)}
              className={clsx('btn btn-xs', showTrans ? 'btn-primary' : 'btn-ghost border border-base-300')}
            >
              {showTrans ? '🇮🇩 Terjemah' : 'Terjemah'}
            </button>
          )}
          <span className="text-xs text-base-content/40">{ayahs.length} ayat</span>
        </div>
      </div>

      {/* Bismillah */}
      {showBismillah && surahNumber !== 1 && surahNumber !== 9 && (
        <div className="px-4 py-4 border-b border-base-200">
          <p
            className="text-center quran-text"
            dir="rtl"
            style={{ fontFamily: "'Scheherazade New', 'Amiri', serif", fontSize: '1.4rem', lineHeight: 2.8 }}
          >
            {BISMILLAH}
          </p>
        </div>
      )}

      {/* Ayahs */}
      <div className="divide-y divide-base-200">
        {ayahs.map(ayah => {
          const isHighlighted = highlightAyahs.includes(ayah.number)
          const isSelected = selectedAyah === ayah.number

          return (
            <div
              key={ayah.number}
              onClick={() => handleAyahClick(ayah)}
              className={clsx(
                'px-4 py-4 transition-colors',
                mode === 'question' && 'cursor-pointer hover:bg-base-200',
                isHighlighted && 'bg-warning/10 border-l-4 border-warning',
                isSelected && 'bg-primary/5 border-l-4 border-primary',
              )}
            >
              {/* Arabic text */}
              <p
                className="text-right leading-loose"
                dir="rtl"
                style={{
                  fontFamily: "'Scheherazade New', 'Amiri', serif",
                  fontSize: '1.35rem',
                  lineHeight: 2.5,
                }}
              >
                {ayah.text}
                {/* Nomor ayat dalam lingkaran */}
                <span
                  className="inline-flex items-center justify-center mr-2 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold"
                  style={{ fontFamily: 'system-ui', fontSize: '0.65rem' }}
                >
                  {ayah.number}
                </span>
              </p>

              {/* Terjemahan */}
              {showTrans && ayah.translation && (
                <p className="mt-2 text-sm text-base-content/70 leading-relaxed border-t border-base-200 pt-2">
                  <span className="text-xs font-medium text-base-content/40 mr-1">({ayah.number})</span>
                  {ayah.translation}
                </p>
              )}

              {/* Highlight indicator */}
              {isHighlighted && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="badge badge-warning badge-xs">Ayat Kunci</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer untuk mode question */}
      {mode === 'question' && (
        <div className="border-t border-base-200 px-4 py-2 text-xs text-base-content/40 text-center">
          Klik ayat untuk memilih
        </div>
      )}
    </div>
  )
}
