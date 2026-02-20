'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sessionsApi, type CreateSessionPayload } from '@/lib/api/sessions.api';
import { examPackagesApi } from '@/lib/api/exam-packages.api';
import { parseErrorMessage } from '@/lib/utils/error';
import { createSessionSchema, type CreateSessionInput } from '@/schemas/exam.schema';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';

export default function CreateSesiPage() {
  const router = useRouter();
  const { success } = useToast();
  const [packages, setPackages] = useState<Array<{ value: string; label: string }>>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
  });

  useEffect(() => {
    examPackagesApi
      .list({ limit: 100 })
      .then((res) =>
        setPackages(
          res.data
            .filter((p) => p.status === 'PUBLISHED')
            .map((p) => ({ value: p.id, label: p.title })),
        ),
      )
      .catch(() => {});
  }, []);

  const onSubmit = async (data: CreateSessionInput) => {
    setServerError(null);
    try {
      await sessionsApi.create(data as CreateSessionPayload);
      success('Sesi berhasil dibuat!');
      router.push('/operator/sesi');
    } catch (e) {
      setServerError(parseErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>
          ←
        </Button>
        <h1 className="text-2xl font-bold">Buat Sesi Ujian</h1>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Judul Sesi"
            placeholder="Contoh: UAS Matematika Kelas X"
            error={errors.title?.message}
            {...register('title')}
          />

          <Select
            label="Paket Ujian"
            options={packages}
            placeholder="Pilih paket..."
            error={errors.examPackageId?.message}
            {...register('examPackageId')}
          />

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
              Buat Sesi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
