'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { questionsApi } from '@/lib/api/questions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/hooks/use-toast'

interface ImportResult {
  imported: number
  failed: number
  errors?: string[]
}

export default function ImportSoalPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleImport = async () => {
    if (!file) return
    setUploading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await questionsApi.importBulk(fd)
      setResult(res)
      if (res.imported > 0) success(`${res.imported} soal berhasil diimport`)
    } catch (e) {
      toastError(parseErrorMessage(e))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Import Soal</h1>
      </div>

      <Card bordered>
        <div className="space-y-4">
          <div
            className="flex cursor-pointer flex-col items-center rounded-box border-2 border-dashed border-base-300 p-8 hover:border-primary/50 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {file ? (
              <div className="text-center">
                <p className="text-2xl mb-1">📄</p>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-base-content/50 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-4xl mb-2">📋</p>
                <p className="text-sm font-medium">Klik untuk pilih file</p>
                <p className="text-xs text-base-content/50 mt-1">Excel (.xlsx, .xls) atau CSV</p>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={e => { setFile(e.target.files?.[0] ?? null); setResult(null) }}
          />

          {result && (
            <Alert variant={result.failed > 0 ? 'warning' : 'success'}>
              <p>{result.imported} soal berhasil · {result.failed} gagal</p>
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-1 text-xs list-disc list-inside space-y-0.5">
                  {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  {result.errors.length > 5 && <li>...dan {result.errors.length - 5} lainnya</li>}
                </ul>
              )}
            </Alert>
          )}

          <Alert variant="info" title="Format kolom yang diperlukan">
            <ul className="text-xs mt-1 list-disc list-inside space-y-0.5">
              <li>type: MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER | ESSAY | MATCHING | COMPLEX_MULTIPLE_CHOICE</li>
              <li>content: teks pertanyaan</li>
              <li>options: a|b|c|d (dipisah pipe, untuk PG)</li>
              <li>correctAnswer: kunci jawaban</li>
              <li>points: nilai soal (default: 1)</li>
              <li>difficulty: 1-5 (default: 1)</li>
            </ul>
          </Alert>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => router.back()}>
              Batal
            </Button>
            <Button
              className="flex-1"
              disabled={!file}
              loading={uploading}
              onClick={handleImport}
            >
              Import Soal
            </Button>
          </div>
        </div>
      </Card>

      <Card compact>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Template import</p>
          <a
            href="/templates/import-soal.xlsx"
            download
            className="btn btn-xs btn-ghost border border-base-300"
          >
            ⬇ Download template
          </a>
        </div>
      </Card>
    </div>
  )
}
