'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPatch } from '@/lib/api/client';
import { parseErrorMessage } from '@/lib/utils/error';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: string;
  name: string;
  code: string;
  subdomain: string;
  isActive: boolean;
  createdAt: string;
}

export default function SchoolsPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTenants(await apiGet<Tenant[]>('tenants'));
    } catch (e) {
      toastError(parseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = async (t: Tenant) => {
    try {
      await apiPatch(`tenants/${t.id}`, { isActive: !t.isActive });
      success(`${t.name} ${t.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
      void load();
    } catch (e) {
      toastError(parseErrorMessage(e));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Sekolah</h1>
        <Button size="sm" onClick={() => router.push('/superadmin/schools/create')}>
          + Tambah Sekolah
        </Button>
      </div>

      <Table
        data={tenants}
        keyExtractor={(t) => t.id}
        loading={loading}
        emptyText="Belum ada sekolah"
        zebra
        columns={[
          {
            key: 'name',
            header: 'Sekolah',
            render: (t) => (
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="font-mono text-xs text-base-content/50">{t.subdomain}.exam.app</p>
              </div>
            ),
          },
          {
            key: 'code',
            header: 'Kode',
            className: 'w-20',
            render: (t) => <code className="text-xs">{t.code}</code>,
          },
          {
            key: 'status',
            header: 'Status',
            className: 'w-24',
            render: (t) => (
              <Badge variant={t.isActive ? 'success' : 'error'} size="sm">
                {t.isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: '',
            className: 'w-40',
            render: (t) => (
              <div className="flex justify-end gap-1">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => router.push(`/superadmin/schools/${t.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant={t.isActive ? 'error' : 'success'}
                  outline
                  onClick={() => void toggleActive(t)}
                >
                  {t.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
