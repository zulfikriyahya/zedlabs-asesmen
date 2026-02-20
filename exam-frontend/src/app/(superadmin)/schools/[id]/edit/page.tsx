'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { apiGet, apiPatch } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/use-toast'

interface Tenant {
  id: string; name: string; code: string; subdomain: string; isActive: boolean
}
interface SchoolEditForm { name: string; code: string; subdomain: string }

export default function EditSchoolPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { success } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tenant, setTenant] = useState<Tenant | null>(null)

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty } } =
    useForm<SchoolEditForm>()

  const subdomain = watch('subdomain')

  useEffect(() => {
    apiGet<Tenant>(`tenants/${id}`)
      .then(t => {
        setTenant(t)
        reset({ name: t.name, code: t.code, subdomain: t.subdomain })
      })
      .catch(e => setLoadError(parseErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (data: SchoolEditForm) => {
    setServerError(null)
    try {
      await apiPatch(`tenants/${id}`, data)
      success('Data sekolah berhasil diperbarui!')
      router.push('/superadmin/schools')
    } catch (e) { setServerError(parseErrorMessage(e)) }
  }

  if (loading) return <Loading fullscreen text="Memuat data sekolah..." />
  if (loadError) return (
    <div className="mx-auto max-w-md pt-8">
      <Alert variant="error">{loadError}</Alert>
      <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Kembali</Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>←</Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Sekolah</h1>
          {tenant && (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-base-content/60 font-mono">{tenant.subdomain}.exam.app</p>
              <Badge variant={tenant.isActive ? 'success' : 'error'} size="xs">
                {tenant.isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Alert variant="warning" title="Perhatian">
        Mengubah subdomain akan mempengaruhi URL akses semua pengguna di sekolah ini.
        Pastikan sudah memberitahu administrator sekolah sebelum mengubah.
      </Alert>

      <Card bordered>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Sekolah"
            placeholder="SMKN 1 Jakarta"
            error={errors.name?.message}
            {...register('name', { required: 'Nama sekolah wajib diisi' })}
          />
          <Input
            label="Kode"
            placeholder="smkn1jkt"
            error={errors.code?.message}
            hint="Huruf kecil dan angka saja, tidak bisa diubah setelah digunakan"
            {...register('code', {
              required: 'Kode wajib diisi',
              pattern: { value: /^[a-z0-9]+$/, message: 'Huruf kecil dan angka saja' },
            })}
          />
          <div>
            <Input
              label="Subdomain"
              placeholder="smkn1"
              error={errors.subdomain?.message}
              {...register('subdomain', {
                required: 'Subdomain wajib diisi',
                pattern: {
                  value: /^[a-z0-9-]+$/,
                  message: 'Huruf kecil, angka, dan tanda hubung saja',
                },
              })}
            />
            {subdomain && (
              <p className="text-xs text-base-content/50 mt-1 ml-1">
                Preview URL: <code className="bg-base-200 px-1 rounded">{subdomain}.exam.app</code>
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" className="flex-1" loading={isSubmitting} disabled={!isDirty}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
