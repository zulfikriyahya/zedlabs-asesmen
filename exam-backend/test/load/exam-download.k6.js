// ════════════════════════════════════════════════════════════════════════════
// test/load/exam-download.k6.js
// Load test: simulasi banyak siswa download paket soal bersamaan
//
// Jalankan:
//   SESSION_ID=xxx TOKEN_CODES=CODE1,CODE2 BASE_TOKEN=xxx \
//   k6 run test/load/exam-download.k6.js
// ════════════════════════════════════════════════════════════════════════════
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const downloadErrors = new Counter('download_errors');
const downloadSuccess = new Rate('download_success_rate');
const downloadDuration = new Trend('download_duration_ms');

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp up: 20 siswa
    { duration: '1m', target: 50 }, // steady: 50 siswa concurrent
    { duration: '30s', target: 100 }, // spike: 100 siswa
    { duration: '30s', target: 0 }, // ramp down
  ],
  thresholds: {
    download_success_rate: ['rate>0.95'], // 95% harus berhasil
    download_duration_ms: ['p(95)<3000'], // 95th percentile < 3 detik
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';
const SESSION_ID = __ENV.SESSION_ID || 'test-session-id';
const BASE_TOKEN = __ENV.BASE_TOKEN || 'test-jwt-token';

// Simulasi token code berbeda per VU (virtual user)
function getTokenCode() {
  const codes = (__ENV.TOKEN_CODES || 'CODE1,CODE2,CODE3').split(',');
  return codes[(__VU - 1) % codes.length];
}

export default function () {
  const start = Date.now();

  const res = http.post(
    `${BASE_URL}/student/download`,
    JSON.stringify({
      sessionId: SESSION_ID,
      tokenCode: getTokenCode(),
      deviceFingerprint: `fp-vu-${__VU}`,
      idempotencyKey: `dl-${__VU}-${__ITER}`,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BASE_TOKEN}`,
        'x-device-fingerprint': `fp-vu-${__VU}`,
      },
    },
  );

  const duration = Date.now() - start;
  downloadDuration.add(duration);

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'has packageId': (r) => JSON.parse(r.body)?.data?.packageId !== undefined,
    'has checksum': (r) => JSON.parse(r.body)?.data?.checksum !== undefined,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  downloadSuccess.add(ok);
  if (!ok) downloadErrors.add(1);

  sleep(Math.random() * 2 + 1); // jeda 1-3 detik antar request
}

export function handleSummary(data) {
  return {
    'test/load/results/exam-download-summary.json': JSON.stringify(data, null, 2),
  };
}
