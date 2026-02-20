'use client';
import { useEffect, useState } from 'react';
import { sessionsApi } from '@/lib/api/sessions.api';
import { parseErrorMessage } from '@/lib/utils/error';
import type { ExamSession, SessionStudent } from '@/types/exam';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/hooks/use-toast';

export default function PesertaPage() {
  const { success, error: toastError } = useToast();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [selectedSid, setSelectedSid] = useState('');
  const [students, setStudents] = useState<SessionStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    sessionsApi
      .list({ limit: 100 })
      .then((res) => setSessions(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSid) {
      setStudents([]);
      return;
    }
    setLoading(true);
    sessionsApi
      .getStudents(selectedSid)
      .then(setStudents)
      .catch((e) => toastError(parseErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [selectedSid]);

  const handleRemove = async (userId: string) => {
    if (!selectedSid) return;
    setRemoving(userId);
    try {
      await sessionsApi.removeStudent(selectedSid, userId);
      success('Peserta berhasil dihapus');
      setStudents((prev) => prev.filter((s) => s.userId !== userId));
    } catch (e) {
      toastError(parseErrorMessage(e));
    } finally {
      setRemoving(null);
    }
  };

  const sessionOptions = sessions.map((s) => ({ value: s.id, label: `${s.title} (${s.status})` }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Peserta Ujian</h1>
      </div>

      <div className="max-w-sm">
        <Select
          label="Pilih Sesi"
          options={sessionOptions}
          placeholder="Pilih sesi..."
          value={selectedSid}
          onChange={(e) => setSelectedSid(e.target.value)}
        />
      </div>

      {selectedSid && (
        <Table
          data={students}
          keyExtractor={(s) => s.userId}
          loading={loading}
          emptyText="Belum ada peserta di sesi ini"
          columns={[
            {
              key: 'user',
              header: 'Peserta',
              render: (s) => (
                <div>
                  <p className="text-sm font-medium">{s.username ?? '—'}</p>
                  <p className="text-xs text-base-content/50">{s.email}</p>
                </div>
              ),
            },
            {
              key: 'token',
              header: 'Token Code',
              className: 'w-32',
              render: (s) => (
                <code className="rounded bg-base-200 px-2 py-0.5 text-xs">{s.tokenCode}</code>
              ),
            },
            {
              key: 'expires',
              header: 'Expires',
              className: 'w-40',
              render: (s) =>
                s.expiresAt ? (
                  <span className="text-xs">{new Date(s.expiresAt).toLocaleString('id-ID')}</span>
                ) : (
                  <Badge variant="neutral" size="xs">
                    Tidak ada batas
                  </Badge>
                ),
            },
            {
              key: 'actions',
              header: '',
              className: 'w-24',
              render: (s) => (
                <Button
                  size="xs"
                  variant="ghost"
                  loading={removing === s.userId}
                  onClick={() => void handleRemove(s.userId)}
                  className="text-error"
                >
                  Hapus
                </Button>
              ),
            },
          ]}
        />
      )}

      {!selectedSid && (
        <div className="flex flex-col items-center py-12 text-center text-base-content/40">
          <span className="mb-2 text-4xl">👥</span>
          <p>Pilih sesi untuk melihat daftar peserta</p>
        </div>
      )}
    </div>
  );
}
