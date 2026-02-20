'use client';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Pengaturan Sistem</h1>
      <Alert variant="info">
        Pengaturan sistem dikelola melalui environment variables di server. Hubungi administrator
        teknis untuk mengubah konfigurasi.
      </Alert>
      <Card bordered>
        <div className="space-y-3 text-sm">
          {[
            ['Versi Aplikasi', 'v1.0.0'],
            ['Mode', process.env.NODE_ENV ?? 'production'],
            ['Enkripsi', 'AES-256-GCM'],
            ['Auth', 'JWT (15m) + Refresh (7d)'],
            ['Rate Limit', 'STRICT: 5/60s · MODERATE: 30/60s'],
          ].map(([key, val]) => (
            <div
              key={key}
              className="flex justify-between border-b border-base-200 pb-2 last:border-0"
            >
              <span className="text-base-content/60">{key}</span>
              <code className="rounded bg-base-200 px-2 py-0.5 text-xs">{val}</code>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
