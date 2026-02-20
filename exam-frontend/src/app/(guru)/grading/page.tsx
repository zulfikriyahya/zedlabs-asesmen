'use client'
import { useEffect, useState, useCallback } from 'react'
import { gradingApi } from '@/lib/api/grading.api'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ManualGradingItem } from '@/types/answer'
import { ManualGradingCard } from '@/components/grading/ManualGradingCard'
import { GradingRubric } from '@/components/grading/GradingRubric'
import { Loading } from '@/components/ui/Loading'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Metadata } from 'next'

export default function GradingPage() {
  const [items, setItems] = useState<ManualGradingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const LIMIT = 10

  const load = useCallback(async (reset = false) => {
    setLoading(true)
    try {
      const res = await gradingApi.listPending({
        status: 'MANUAL_REQUIRED',
        page: reset ? 1 : page,
        limit: LIMIT,
      })
      if (reset) {
        setItems(res.data)
        setPage(1)
      } else {
        setItems(prev => [...prev, ...res.data])
      }
      setHasMore(res.data.length === LIMIT)
    } catch (e) {
      setError(parseErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { void load(true) }, [])

  const handleGraded = (answerId: string) => {
    setItems(prev => prev.filter(i => i.answerId !== answerId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Penilaian Manual</h1>
          <p className="text-sm text-base-content/60">Soal esai yang memerlukan penilaian manual</p>
        </div>
        {items.length > 0 && (
          <Badge variant="warning">{items.length} menunggu penilaian</Badge>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && items.length === 0 ? (
        <Loading text="Memuat daftar penilaian..." />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">✅</span>
          <p className="font-medium">Semua jawaban sudah dinilai!</p>
          <p className="text-sm text-base-content/60 mt-1">Tidak ada jawaban yang menunggu penilaian manual.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Main — grading cards */}
          <div className="space-y-4">
            {items.map(item => (
              <ManualGradingCard
                key={item.answerId}
                item={item}
                onGraded={() => handleGraded(item.answerId)}
              />
            ))}
            {hasMore && !loading && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => { setPage(p => p + 1); void load() }}
              >
                Muat Lebih Banyak
              </Button>
            )}
            {loading && items.length > 0 && <Loading size="sm" />}
          </div>

          {/* Sidebar — rubrik */}
          <div className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              <GradingRubric maxScore={10} />
              <div className="rounded-box bg-base-200 p-3 text-xs text-base-content/60 space-y-1">
                <p className="font-medium">Tips Penilaian Esai</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Fokus pada esensi jawaban</li>
                  <li>Perhatikan kesesuaian konsep</li>
                  <li>Gunakan slider untuk nilai presisi</li>
                  <li>Berikan feedback konstruktif</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
