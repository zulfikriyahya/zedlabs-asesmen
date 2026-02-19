// ── test/load/concurrent-submission.k6.js ────────────────────────────────────
/*
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,
  duration: '60s',
};

export default function () {
  const res = http.post('http://localhost:3000/api/student/submit', JSON.stringify({
    attemptId: __ENV.ATTEMPT_ID,
    idempotencyKey: `${__VU}-${__ITER}`,
  }), { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${__ENV.TOKEN}` } });

  check(res, { 'status 200 or 409': (r) => r.status === 200 || r.status === 409 });
  sleep(0.5);
}
*/
export const k6ConcurrentSubmission = '// see comment above';
