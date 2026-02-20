'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createQuestionSchema, type CreateQuestionInput } from '@/schemas/question.schema';
import { questionsApi } from '@/lib/api/questions.api';
import { analyticsApi } from '@/lib/api/analytics.api';
import { parseErrorMessage } from '@/lib/utils/error';
import { QuestionEditor } from '@/components/questions/QuestionEditor';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/hooks/use-toast';

export default function CreateSoalPage() {
  const router = useRouter();
  const { success } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Array<{ value: string; label: string }>>([]);

  const methods = useForm<CreateQuestionInput>({
    resolver: zodResolver(createQuestionSchema),
    defaultValues: {
      type: 'MULTIPLE_CHOICE',
      points: 1,
      difficulty: 1,
      tagIds: [],
      content: { text: '', images: [] },
      options: [
        { key: 'a', text: '' },
        { key: 'b', text: '' },
        { key: 'c', text: '' },
        { key: 'd', text: '' },
      ],
      correctAnswer: '',
    },
  });

  useEffect(() => {
    // Load subjects dari analytics/dashboard atau endpoint tersendiri
    fetch('/api/auth/me')
      .then(
        () => questionsApi.listTags(), // placeholder — ganti dengan subjectsApi.list()
      )
      .catch(() => {});

    // Sementara hardcode — ganti dengan subjectsApi.list()
    setSubjects([{ value: '', label: 'Pilih mata pelajaran...' }]);
  }, []);

  const onSubmit = async (data: CreateQuestionInput) => {
    setServerError(null);
    try {
      await questionsApi.create(data);
      success('Soal berhasil dibuat!');
      router.push('/guru/soal');
    } catch (e) {
      setServerError(parseErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>
          ←
        </Button>
        <h1 className="text-2xl font-bold">Buat Soal Baru</h1>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <div className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body">
              <QuestionEditor subjects={subjects} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" loading={methods.formState.isSubmitting}>
              Simpan Soal
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
