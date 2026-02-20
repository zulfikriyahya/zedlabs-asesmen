'use client';
import { useParams, useRouter } from 'next/navigation';
import { LiveMonitor } from '@/components/monitoring/LiveMonitor';
import { Button } from '@/components/ui/Button';

export default function SesiMonitoringPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" onClick={() => router.back()}>
          ←
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Live Monitoring</h1>
          <p className="font-mono text-sm text-base-content/60">Session: {sessionId}</p>
        </div>
      </div>
      <LiveMonitor sessionId={sessionId} />
    </div>
  );
}
