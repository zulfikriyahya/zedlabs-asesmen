'use client';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function DeviceLockWarning() {
  const router = useRouter();
  return (
    <div className="mt-4 space-y-4">
      <Alert variant="error" title="Perangkat Dikunci">
        Perangkat ini telah dikunci oleh administrator. Silakan hubungi pengawas atau operator untuk
        membuka kunci perangkat Anda.
      </Alert>
      <div className="space-y-2 rounded-box bg-base-200 p-4 text-sm">
        <p className="font-medium">Langkah yang bisa dilakukan:</p>
        <ol className="list-inside list-decimal space-y-1 text-base-content/70">
          <li>Hubungi operator atau pengawas ujian</li>
          <li>Berikan informasi username Anda</li>
          <li>Tunggu konfirmasi unlock dari admin</li>
          <li>Coba login kembali</li>
        </ol>
      </div>
      <Button variant="ghost" className="w-full" onClick={() => router.refresh()}>
        Coba Login Lagi
      </Button>
    </div>
  );
}
