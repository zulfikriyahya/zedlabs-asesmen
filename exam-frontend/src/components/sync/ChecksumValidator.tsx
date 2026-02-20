'use client';
import { useState } from 'react';
import { validatePackageHash } from '@/lib/crypto/checksum';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

interface ChecksumValidatorProps {
  encryptedData: string;
  expectedHash: string;
}

export function ChecksumValidator({ encryptedData, expectedHash }: ChecksumValidatorProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'mismatch'>('idle');

  const check = async () => {
    setStatus('checking');
    try {
      await validatePackageHash(encryptedData, expectedHash);
      setStatus('ok');
    } catch {
      setStatus('mismatch');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button size="xs" variant="ghost" onClick={check} loading={status === 'checking'}>
          Verifikasi Integritas
        </Button>
        {status === 'ok' && <span className="text-xs text-success">✓ Integritas OK</span>}
        {status === 'mismatch' && <span className="text-xs text-error">✕ Hash tidak cocok</span>}
      </div>
      {status === 'mismatch' && (
        <Alert variant="error" title="Integritas Gagal">
          Paket soal mungkin korup. Silakan download ulang.
        </Alert>
      )}
    </div>
  );
}
