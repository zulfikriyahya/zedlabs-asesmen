'use client'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { sessionsApi } from '@/lib/api/sessions.api'
import { apiPost } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamSession } from '@/types/exam'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'

export default function ImportPesertaPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [selectedSid, setSelectedSid] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ imported: number; failed: number } | null>(null)

  useEffect(() => {
    sessionsApi.list({ limit: 100 }).then(res => setSessions(res.data)).catch(() => {})
  }, [])

  const handleImport = async () => {
    if (!file || !selectedSid) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('sessionId', selectedSid)
      const res = await apiPost<{ imported: number; failed: number }>('sessions/import-students', fd)
      setResult(res)
      success(`${res.imported} peserta berhasil diimport`)
    } catch (e) { toastError(parseErrorMessage(e)) }
    finally { setUploading(false) }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Import Peserta</h1>
      </div>

      <Card bordered>
        <div className="space-y-4">
          <Select
            label="Pilih Sesi"
            options={sessions.map(s => ({ value: s.id, label: s.title }))}
            placeholder="Pilih sesi tujuan..."
            value={selectedSid}
            onChange={e => setSelectedSid(e.target.value)}
          />

          <div
            className="flex cursor-pointer flex-col items-center rounded-box border-2 border-dashed border-base-300 p-6 hover:border-primary/50 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {file
              ? <p className="text-sm font-medium">📄 {file.name}</p>
              : <><span className="text-3xl mb-1">📋</span><p className="text-sm text-base-content/60">Pilih file Excel/CSV daftar peserta</p></>
            }
          </div>
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null) }} />

          {result && (
            <Alert variant={result.failed > 0 ? 'warning' : 'success'}>
              {result.imported} peserta berhasil · {result.failed} gagal
            </Alert>
          )}

          <Alert variant="info" title="Format kolom">
            username (atau email) — satu baris satu peserta
          </Alert>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => router.back()}>Batal</Button>
            <Button className="flex-1" disabled={!file || !selectedSid} loading={uploading} onClick={handleImport}>
              Import Peserta
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
