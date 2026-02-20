'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sessionsApi } from '@/lib/api/sessions.api';
import { parseErrorMessage } from '@/lib/utils/error';
import { createSessionSchema, type CreateSessionInput } from '@/schemas/exam.schema';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';

export default function EditSesiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { success } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
  });

  useEffect(() => {
    sessionsApi
      .getById(id)
      .then((s) =>
        reset({
          title: s.title,
          examPackageId: s.examPackageId,
          roomId: s.roomId ?? undefined,
          startTime: s.startTime.slice(0, 16),
          endTime: s.endTime.slice(0, 16),
        }),
      )
      .catch((e) => setLoadError(parseErrorMessage(e)));
  }, [id, reset]);

  const onSubmit = async (data: CreateSessionInput) => {
    setServerError(null);
    try {
      await sessionsApi.update(id, data);
      success('Sesi berhasil diperbarui!');
      router.push('/operator/sesi');
    } catch (e) {
      setServerError(parseErrorMessage(e));
    }
  };

  if (loadError) return <Alert variant="error">{loadError}</Alert>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>
          ←
        </Button>
        <h1 className="text-2xl font-bold">Edit Sesi</h1>
      </div>
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Judul Sesi" error={errors.title?.message} {...register('title')} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Waktu Mulai"
              type="datetime-local"
              error={errors.startTime?.message}
              {...register('startTime')}
            />
            <Input
              label="Waktu Selesai"
              type="datetime-local"
              error={errors.endTime?.message}
              {...register('endTime')}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" loading={isSubmitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
