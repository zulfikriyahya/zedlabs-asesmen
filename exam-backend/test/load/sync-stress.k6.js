// ════════════════════════════════════════════════════════════════════════════
// test/load/sync-stress.k6.js
// Load test: simulasi banyak siswa push sync items bersamaan (offline recovery)
//
// Jalankan:
//   ATTEMPT_IDS=id1,id2 BASE_TOKEN=xxx k6 run test/load/sync-stress.k6.js
// ════════════════════════════════════════════════════════════════════════════
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const syncErrors = new Counter('sync_errors');
const syncSuccess = new Rate('sync_success_rate');
const syncDuration = new Trend('sync_duration_ms');

export const options = {
  scenarios: {
    // Skenario 1: steady load — pengiriman sync jawaban normal
    steady_sync: {
      executor: 'constant-vus',
      vus: 30,
      duration: '2m',
      gracefulStop: '10s',
    },
    // Skenario 2: burst — simulasi banyak siswa reconnect setelah offline serentak
    burst_reconnect: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 80 }, // burst
        { duration: '30s', target: 10 }, // settle
      ],
      startTime: '1m30s', // mulai setelah steady_sync berjalan 1.5 menit
    },
  },
  thresholds: {
    sync_success_rate: ['rate>0.97'],
    sync_duration_ms: ['p(95)<2000'],
    http_req_failed: ['rate<0.03'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';
const BASE_TOKEN = __ENV.BASE_TOKEN || 'test-jwt-token';

function getAttemptId() {
  const ids = (__ENV.ATTEMPT_IDS || 'attempt-1,attempt-2').split(',');
  return ids[(__VU - 1) % ids.length];
}

export default function () {
  const attemptId = getAttemptId();
  const idemKey = `sync-${__VU}-${__ITER}-${Date.now()}`;
  const start = Date.now();

  // Simulasi submit jawaban via sync endpoint (offline path)
  const res = http.post(
    `${BASE_URL}/sync`,
    JSON.stringify({
      attemptId,
      idempotencyKey: idemKey,
      type: 'SUBMIT_ANSWER',
      payload: {
        attemptId,
        questionId: `q-${Math.ceil(Math.random() * 10)}`,
        idempotencyKey: idemKey,
        answer: ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)],
      },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BASE_TOKEN}`,
      },
    },
  );

  const duration = Date.now() - start;
  syncDuration.add(duration);

  const ok = check(res, {
    'status 200 atau 201': (r) => r.status === 200 || r.status === 201,
    'has syncItem id': (r) => JSON.parse(r.body)?.data?.id !== undefined,
    'response < 3s': (r) => r.timings.duration < 3000,
  });

  syncSuccess.add(ok);
  if (!ok) syncErrors.add(1);

  // Cek status sync sesekali (1 dari 5 iterasi)
  if (__ITER % 5 === 0) {
    const statusRes = http.get(`${BASE_URL}/sync/${attemptId}/status`, {
      headers: { Authorization: `Bearer ${BASE_TOKEN}` },
    });
    check(statusRes, { 'status check 200': (r) => r.status === 200 });
  }

  sleep(Math.random() * 1.5 + 0.5); // jeda 0.5-2 detik
}

export function handleSummary(data) {
  return {
    'test/load/results/sync-stress-summary.json': JSON.stringify(data, null, 2),
  };
}
