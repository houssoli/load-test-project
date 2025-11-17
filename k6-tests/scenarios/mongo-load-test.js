import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
// Optimized for single container: Rate limit 5000 req/min (~83 req/sec)
// With sleep(1), 10 VUs = ~10 req/sec, 15 VUs = ~15 req/sec
export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp-up to 5 users
    { duration: '1m', target: 10 },   // Ramp-up to 10 users
    { duration: '2m', target: 15 },   // Ramp-up to 15 users (max)
    { duration: '30s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.02'],                  // Error rate < 2% (relaxed for rate limits)
    errors: ['rate<0.05'],                           // Custom error rate < 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // Test 2: MongoDB test endpoint
  const testRes = http.get(`${BASE_URL}/api/mongo/test`);
  const testCheck = check(testRes, {
    'mongo test status is 200': (r) => r.status === 200,
    'mongo test has success field': (r) => JSON.parse(r.body).success === true,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(!testCheck);

  sleep(1);

  // Test 3: Get all users
  const usersRes = http.get(`${BASE_URL}/api/mongo/users?page=1&limit=10`);
  const usersCheck = check(usersRes, {
    'get users status is 200': (r) => r.status === 200,
    'users response has data': (r) => {
      const body = JSON.parse(r.body);
      return body.success && Array.isArray(body.data);
    },
  });
  errorRate.add(!usersCheck);

  sleep(1);

  // Test 4: Create a new user
  const userData = {
    name: `User_${__VU}_${__ITER}`,
    email: `user_${__VU}_${__ITER}_${Date.now()}@test.com`,
    age: Math.floor(Math.random() * 50) + 18,
    status: 'active',
  };

  const createRes = http.post(
    `${BASE_URL}/api/mongo/users`,
    JSON.stringify(userData),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const createCheck = check(createRes, {
    'create user status is 201': (r) => r.status === 201,
    'created user has id': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data._id;
    },
  });
  errorRate.add(!createCheck);

  // Get created user ID
  let userId;
  if (createRes.status === 201) {
    const createBody = JSON.parse(createRes.body);
    userId = createBody.data._id;

    sleep(1);

    // Test 5: Get user by ID
    const getUserRes = http.get(`${BASE_URL}/api/mongo/users/${userId}`);
    const getUserCheck = check(getUserRes, {
      'get user by id status is 200': (r) => r.status === 200,
      'returned user matches created user': (r) => {
        const body = JSON.parse(r.body);
        return body.success && body.data.email === userData.email;
      },
    });
    errorRate.add(!getUserCheck);

    sleep(1);

    // Test 6: Update user
    const updateData = {
      age: Math.floor(Math.random() * 50) + 18,
      status: 'inactive',
    };

    const updateRes = http.put(
      `${BASE_URL}/api/mongo/users/${userId}`,
      JSON.stringify(updateData),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const updateCheck = check(updateRes, {
      'update user status is 200': (r) => r.status === 200,
    });
    errorRate.add(!updateCheck);
  }

  sleep(1);

  // Test 7: Search users
  const searchRes = http.get(`${BASE_URL}/api/mongo/users/search?q=User`);
  const searchCheck = check(searchRes, {
    'search users status is 200': (r) => r.status === 200,
    'search returns array': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.data);
    },
  });
  errorRate.add(!searchCheck);

  sleep(2);
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  return `
     ✓ checks.........................: ${(data.metrics.checks.values.passes / data.metrics.checks.values.count * 100).toFixed(2)}% 
     ✓ http_req_duration..............: avg=${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
     ✓ http_req_failed................: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
     ✓ http_reqs......................: ${data.metrics.http_reqs.values.count}
  `;
}
