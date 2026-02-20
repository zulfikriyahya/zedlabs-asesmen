'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { startExam } from '@/lib/exam/controller'
import { useExamStore } from '@/stores/exam.store'
import { parseErrorMessage } from '@/lib/utils/error'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

const schema = z.object({
  tokenCode: z.string().min(4, 'Kode token wajib diisi'),
})
type Form = z.infer<typeof schema>

export default function DownloadPage() {
  const router = useRouter()
  const { setPackage } = useExamStore()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'idle' | 'downloading' | 'decrypting'>('idle')

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ tokenCode }: Form) => {
    setError(null)
    try {
      setStep('downloading')
      const { decryptedPackage, attemptId } = await startExam(tokenCode)
      setStep('decrypting')

      // Simpan ke exam store
      setPackage(decryptedPackage, {
        id: attemptId,
        sessionId: decryptedPackage.sessionId,
        userId: '',
        idempotencyKey: '',
        deviceFingerprint: null,
        startedAt: new Date().toISOString(),
        submittedAt: null,
        status: 'IN_PROGRESS',
        packageHash: decryptedPackage.packageHash,
        totalScore: null,
        maxScore: null,
        gradingStatus: 'PENDING',
        gradingCompletedAt: null,
      })

      router.replace(`/siswa/ujian/${decryptedPackage.sessionId}`)
    } catch (e) {
      setError(parseErrorMessage(e))
      setStep('idle')
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Mulai Ujian</h1>
        <p className="mt-1 text-sm text-base-content/60">Masukkan kode token yang diberikan pengawas</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          {step !== 'idle' && (
            <Alert variant="info">
              <div className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                {step === 'downloading' ? 'Mengunduh paket soal...' : 'Mendekripsi soal...'}
              </div>
            </Alert>
          )}

          <Input
            label="Kode Token"
            placeholder="Contoh: ABC123"
            error={errors.tokenCode?.message}
            disabled={step !== 'idle'}
            className="text-center text-lg tracking-widest font-mono uppercase"
            {...register('tokenCode', { setValueAs: v => String(v).toUpperCase() })}
          />

          <Button type="submit" wide className="w-full" loading={step !== 'idle'}>
            Download & Mulai
          </Button>
        </form>
      </Card>

      <Alert variant="warning">
        Pastikan browser Anda mendukung Web Crypto API dan tersedia minimal 2 GB ruang penyimpanan.
      </Alert>
    </div>
  )
}
