'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiPost } from '@/lib/api/client';
import { parseErrorMessage } from '@/lib/utils/error';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface SchoolForm {
  name: string;
  code: string;
  subdomain: string;
}

export default function CreateSchoolPage() {
  const router = useRouter();
  const { success } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SchoolForm>();

  const onSubmit = async (data: SchoolForm) => {
    setServerError(null);
    try {
      await apiPost('tenants', data);
      success('Sekolah berhasil ditambahkan!');
      router.push('/superadmin/schools');
    } catch (e) {
      setServerError(parseErrorMessage(e));
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>
          ←
        </Button>
        <h1 className="text-2xl font-bold">Tambah Sekolah</h1>
      </div>
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Sekolah"
            placeholder="SMKN 1 Jakarta"
            error={errors.name?.message}
            {...register('name', { required: 'Wajib diisi' })}
          />
          <Input
            label="Kode"
            placeholder="smkn1jkt"
            error={errors.code?.message}
            {...register('code', {
              required: 'Wajib diisi',
              pattern: { value: /^[a-z0-9]+$/, message: 'Huruf kecil dan angka saja' },
            })}
          />
          <Input
            label="Subdomain"
            placeholder="smkn1"
            error={errors.subdomain?.message}
            {...register('subdomain', {
              required: 'Wajib diisi',
              pattern: {
                value: /^[a-z0-9-]+$/,
                message: 'Huruf kecil, angka, dan tanda hubung saja',
              },
            })}
          />
          <Alert variant="info" className="text-xs">
            Subdomain akan menjadi: <code>{'{subdomain}'}.exam.app</code>
          </Alert>
          <div className="flex gap-2">
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
