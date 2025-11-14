import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Health check
  let res = http.get(`${BASE_URL}/health`);
  check(res, { 'health check OK': (r) => r.status === 200 });
  
  // MongoDB test
  res = http.get(`${BASE_URL}/api/mongo/test`);
  check(res, { 'mongo test OK': (r) => r.status === 200 });
  
  // PostgreSQL test
  res = http.get(`${BASE_URL}/api/postgres/test`);
  check(res, { 'postgres test OK': (r) => r.status === 200 });
  
  sleep(1);
}
