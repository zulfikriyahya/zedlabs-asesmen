'use client'
import { useState, useCallback } from 'react'
import { clsx } from 'clsx'

// Kategori tajwid dengan warna standar internasional
const TAJWID_RULES = [
  { id: 'ghunnah', label: 'Ghunnah', color: '#10b981', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', desc: 'Dengung 2 harakat' },
  { id: 'idgham_bighunnah', label: "Idgham Bighunnah", color: '#3b82f6', bgColor: 'bg-blue-100', textColor: 'text-blue-800', desc: 'Memasukkan dengan dengung' },
  { id: 'idgham_bilaghunnah', label: "Idgham Bilaghunnah", color: '#6366f1', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', desc: 'Memasukkan tanpa dengung' },
  { id: 'ikhfa', label: 'Ikhfa', color: '#f59e0b', bgColor: 'bg-amber-100', textColor: 'text-amber-800', desc: 'Samar 10-15 harakat' },
  { id: 'izhar', label: 'Izhar', color: '#ef4444', bgColor: 'bg-red-100', textColor: 'text-red-800', desc: 'Jelas tanpa dengung' },
  { id: 'iqlab', label: 'Iqlab', color: '#8b5cf6', bgColor: 'bg-violet-100', textColor: 'text-violet-800', desc: 'Menukar ke mim' },
  { id: 'mad_thobii', label: "Mad Thabi'i", color: '#06b6d4', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', desc: 'Panjang 2 harakat' },
  { id: 'mad_wajib', label: 'Mad Wajib', color: '#f97316', bgColor: 'bg-orange-100', textColor: 'text-orange-800', desc: 'Panjang 4-5 harakat' },
  { id: 'qalqalah', label: 'Qalqalah', color: '#ec4899', bgColor: 'bg-pink-100', textColor: 'text-pink-800', desc: 'Memantul' },
] as const

type RuleId = typeof TAJWID_RULES[number]['id']

interface MarkedWord {
  word: string
  ruleId: RuleId | null
  index: number
}

interface TajwidMarkerProps {
  text: string       // teks Arab yang akan ditandai
  readOnly?: boolean // mode tampilan saja (tidak bisa ditandai)
  initialMarks?: Record<number, RuleId>  // tanda awal (untuk edit)
  onMarksChange?: (marks: Record<number, RuleId>) => void
  showLegend?: boolean
}

export function TajwidMarker({
  text,
  readOnly = false,
  initialMarks = {},
  onMarksChange,
  showLegend = true,
}: TajwidMarkerProps) {
  const [activeRule, setActiveRule] = useState<RuleId | null>(null)
  const [marks, setMarks] = useState<Record<number, RuleId>>(initialMarks)

  // Split teks menjadi kata-kata (spasi sebagai pemisah, rtl)
  const words: MarkedWord[] = text.split(/\s+/).map((word, i) => ({
    word,
    ruleId: marks[i] ?? null,
    index: i,
  }))

  const handleWordClick = useCallback((idx: number) => {
    if (readOnly || !activeRule) return

    setMarks(prev => {
      const next = { ...prev }
      // Toggle: klik ulang rule yang sama = hapus tanda
      if (next[idx] === activeRule) {
        delete next[idx]
      } else {
        next[idx] = activeRule
      }
      onMarksChange?.(next)
      return next
    })
  }, [readOnly, activeRule, onMarksChange])

  const clearAll = () => {
    setMarks({})
    onMarksChange?.({})
  }

  const getRuleConfig = (ruleId: RuleId | null) =>
    TAJWID_RULES.find(r => r.id === ruleId)

  const markedCount = Object.keys(marks).length

  return (
    <div className="space-y-4">
      {/* Tool palette */}
      {!readOnly && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-base-content/60">Pilih hukum tajwid, lalu klik kata:</p>
            <div className="flex items-center gap-2">
              {markedCount > 0 && (
                <span className="badge badge-primary badge-xs">{markedCount} ditandai</span>
              )}
              {markedCount > 0 && (
                <button type="button" onClick={clearAll} className="btn btn-xs btn-ghost text-error">
                  Hapus Semua
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TAJWID_RULES.map(rule => (
              <button
                key={rule.id}
                type="button"
                onClick={() => setActiveRule(r => r === rule.id ? null : rule.id)}
                title={rule.desc}
                className={clsx(
                  'btn btn-xs gap-1 border-2 transition-all',
                  activeRule === rule.id
                    ? 'border-current shadow-sm scale-105'
                    : 'border-transparent',
                  rule.bgColor,
                  rule.textColor,
                )}
              >
                {rule.label}
              </button>
            ))}
          </div>
          {activeRule && (
            <p className="text-xs text-base-content/50">
              Mode: <span className="font-medium">{getRuleConfig(activeRule)?.label}</span>
              {' '}— {getRuleConfig(activeRule)?.desc}
              <button type="button" onClick={() => setActiveRule(null)} className="ml-2 text-error">× Batal</button>
            </p>
          )}
        </div>
      )}

      {/* Arabic text with markers */}
      <div
        className="rounded-box border border-base-300 bg-base-50 p-4 text-right leading-loose"
        dir="rtl"
        style={{ fontFamily: "'Scheherazade New', 'Amiri', serif", fontSize: '1.3rem', lineHeight: 3 }}
      >
        {words.map((w, i) => {
          const rule = getRuleConfig(w.ruleId)
          return (
            <span key={i}>
              <span
                onClick={() => handleWordClick(w.index)}
                title={rule?.label}
                className={clsx(
                  'inline-block rounded px-1 mx-0.5 transition-all',
                  !readOnly && activeRule && !w.ruleId && 'cursor-pointer hover:bg-base-200',
                  !readOnly && activeRule && w.ruleId && 'cursor-pointer',
                  rule && `${rule.bgColor} ${rule.textColor}`,
                  !readOnly && w.ruleId && 'ring-1 ring-current',
                )}
                style={rule ? { borderBottom: `2px solid ${rule.color}` } : {}}
              >
                {w.word}
              </span>
              {' '}
            </span>
          )
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {TAJWID_RULES.map(rule => {
            const count = Object.values(marks).filter(v => v === rule.id).length
            return (
              <div key={rule.id} className={clsx('flex items-center gap-2 rounded-box px-2 py-1.5 text-xs', rule.bgColor, rule.textColor)}>
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: rule.color }}
                />
                <span className="flex-1 font-medium truncate">{rule.label}</span>
                {count > 0 && (
                  <span className="font-bold opacity-70">{count}</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {!readOnly && markedCount > 0 && (
        <div className="rounded-box bg-base-200 p-3 text-xs space-y-1">
          <p className="font-medium">Ringkasan Penandaan:</p>
          {TAJWID_RULES.filter(r => Object.values(marks).includes(r.id)).map(rule => {
            const count = Object.values(marks).filter(v => v === rule.id).length
            return (
              <div key={rule.id} className="flex items-center justify-between">
                <span className={clsx(rule.textColor, 'font-medium')}>{rule.label}</span>
                <span>{count} kata</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
