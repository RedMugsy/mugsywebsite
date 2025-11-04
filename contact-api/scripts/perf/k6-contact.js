import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
  scenarios: {
    contact_burst: { executor: 'ramping-vus', startVUs: 0, stages: [
      { duration: '10s', target: 20 },
      { duration: '20s', target: 50 },
      { duration: '20s', target: 0 },
    ]},
  },
};

const API_BASE = __ENV.API_BASE || 'http://localhost:8787';

export default function () {
  const body = JSON.stringify({
    name: 'Test User',
    email: `test+${Math.random().toString(36).slice(2)}@example.com`,
    purpose: 'Support',
    subject: 'Load test',
    message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(3),
  });
  const res = http.post(`${API_BASE}/api/contact`, body, { headers: { 'Content-Type': 'application/json' } });
  check(res, { 'status 200/400/429': (r) => [200,400,429].includes(r.status) });
  sleep(1);
}

