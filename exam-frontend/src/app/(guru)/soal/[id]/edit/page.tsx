'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createQuestionSchema, type CreateQuestionInput } from '@/schemas/question.schema'
import { questionsApi } from '@/lib/api/questions.api'
import { parseErrorMessage } from '@/lib/utils/error'
import { QuestionEditor } from '@/components/questions/QuestionEditor'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/hooks/use-toast'

export default function EditSoalPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [subjects] = useState<Array<{ value: string; label: string }>>([])

  const methods = useForm<CreateQuestionInput>({ resolver: zodResolver(createQuestionSchema) })

  useEffect(() => {
    questionsApi.getById(id)
      .then(q => {
        methods.reset({
          subjectId: q.subjectId,
          type: q.type,
          content: q.content,
          options: q.options as any,
          correctAnswer: undefined, // correctAnswer terenkripsi — tidak diisi ulang
          points: q.points,
          difficulty: q.difficulty,
          tagIds: q.tags?.map(t => t.id) ?? [],
        })
      })
      .catch(e => setLoadError(parseErrorMessage(e)))
  }, [id, methods])

  const onSubmit = async (data: CreateQuestionInput) => {
    setServerError(null)
    try {
      await questionsApi.update(id, data)
      success('Soal berhasil diperbarui!')
      router.push('/guru/soal')
    } catch (e) {
      setServerError(parseErrorMessage(e))
    }
  }

  if (loadError) return <Alert variant="error">{loadError}</Alert>
  if (!methods.formState.defaultValues && !loadError) return <Loading fullscreen />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <h1 className="text-2xl font-bold">Edit Soal</h1>
      </div>

      <Alert variant="info">
        Kunci jawaban yang sudah dienkripsi tidak ditampilkan. Kosongkan jika tidak ingin mengubah jawaban.
      </Alert>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body">
              <QuestionEditor subjects={subjects} />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" loading={methods.formState.isSubmitting}>Simpan Perubahan</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
