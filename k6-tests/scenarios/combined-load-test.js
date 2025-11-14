import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const mongoResponseTime = new Trend('mongo_response_time');
const postgresResponseTime = new Trend('postgres_response_time');
const mongoRequests = new Counter('mongo_requests');
const postgresRequests = new Counter('postgres_requests');

// Test scenarios configuration
export const options = {
  scenarios: {
    // Smoke test - verify everything works
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke' },
    },
    // Load test - normal traffic
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },   // Ramp-up
        { duration: '3m', target: 20 },   // Steady state
        { duration: '1m', target: 0 },    // Ramp-down
      ],
      startTime: '30s',
      tags: { test_type: 'load' },
    },
    // Stress test - push limits
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp-up to 50
        { duration: '2m', target: 100 },  // Ramp-up to 100
        { duration: '3m', target: 100 },  // Hold at 100
        { duration: '2m', target: 0 },    // Ramp-down
      ],
      startTime: '6m',
      tags: { test_type: 'stress' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'], 
    http_req_failed: ['rate<0.02'],                  
    errors: ['rate<0.05'],
    'mongo_response_time': ['p(95)<600'],
    'postgres_response_time': ['p(95)<600'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // MongoDB tests
  group('MongoDB Operations', function () {
    // Test endpoint
    const mongoTestRes = http.get(`${BASE_URL}/api/mongo/test`);
    mongoRequests.add(1);
    mongoResponseTime.add(mongoTestRes.timings.duration);
    
    const testCheck = check(mongoTestRes, {
      'mongo test successful': (r) => r.status === 200,
    });
    errorRate.add(!testCheck);

    sleep(1);

    // Create user
    const userData = {
      name: `User_${__VU}_${__ITER}`,
      email: `user_${__VU}_${__ITER}_${Date.now()}@test.com`,
      age: Math.floor(Math.random() * 50) + 18,
      status: 'active',
    };

    const createUserRes = http.post(
      `${BASE_URL}/api/mongo/users`,
      JSON.stringify(userData),
      { headers: { 'Content-Type': 'application/json' } }
    );
    mongoRequests.add(1);
    mongoResponseTime.add(createUserRes.timings.duration);

    const createCheck = check(createUserRes, {
      'user created': (r) => r.status === 201,
    });
    errorRate.add(!createCheck);

    sleep(1);

    // Get users list
    const getUsersRes = http.get(`${BASE_URL}/api/mongo/users?page=1&limit=10`);
    mongoRequests.add(1);
    mongoResponseTime.add(getUsersRes.timings.duration);

    check(getUsersRes, {
      'users list retrieved': (r) => r.status === 200,
    });
  });

  sleep(2);

  // PostgreSQL tests
  group('PostgreSQL Operations', function () {
    // Test endpoint
    const pgTestRes = http.get(`${BASE_URL}/api/postgres/test`);
    postgresRequests.add(1);
    postgresResponseTime.add(pgTestRes.timings.duration);

    const testCheck = check(pgTestRes, {
      'postgres test successful': (r) => r.status === 200,
    });
    errorRate.add(!testCheck);

    sleep(1);

    // Create product
    const productData = {
      name: `Product_${__VU}_${__ITER}`,
      description: `Test product`,
      price: (Math.random() * 1000).toFixed(2),
      quantity: Math.floor(Math.random() * 100),
      category: ['Electronics', 'Clothing', 'Food'][Math.floor(Math.random() * 3)],
      status: 'available',
    };

    const createProductRes = http.post(
      `${BASE_URL}/api/postgres/products`,
      JSON.stringify(productData),
      { headers: { 'Content-Type': 'application/json' } }
    );
    postgresRequests.add(1);
    postgresResponseTime.add(createProductRes.timings.duration);

    const createCheck = check(createProductRes, {
      'product created': (r) => r.status === 201,
    });
    errorRate.add(!createCheck);

    sleep(1);

    // Get products list
    const getProductsRes = http.get(`${BASE_URL}/api/postgres/products?page=1&limit=10`);
    postgresRequests.add(1);
    postgresResponseTime.add(getProductsRes.timings.duration);

    check(getProductsRes, {
      'products list retrieved': (r) => r.status === 200,
    });

    sleep(1);

    // Search products
    const searchRes = http.get(`${BASE_URL}/api/postgres/products/search?q=Product`);
    postgresRequests.add(1);
    postgresResponseTime.add(searchRes.timings.duration);

    check(searchRes, {
      'search successful': (r) => r.status === 200,
    });
  });

  sleep(2);

  // Mixed operations
  group('Mixed Operations', function () {
    const batch = http.batch([
      ['GET', `${BASE_URL}/api/mongo/users?page=1&limit=5`],
      ['GET', `${BASE_URL}/api/postgres/products?page=1&limit=5`],
      ['GET', `${BASE_URL}/health`],
    ]);

    check(batch, {
      'all requests successful': (responses) => 
        responses.every(r => r.status === 200),
    });
  });

  sleep(3);
}

export function handleSummary(data) {
  const summary = {
    'combined-summary.json': JSON.stringify(data, null, 2),
  };

  console.log('\n========== Load Test Summary ==========');
  console.log(`Total Requests: ${data.metrics.http_reqs.values.count}`);
  console.log(`MongoDB Requests: ${data.metrics.mongo_requests.values.count}`);
  console.log(`PostgreSQL Requests: ${data.metrics.postgres_requests.values.count}`);
  console.log(`Failed Requests: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%`);
  console.log(`Average Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms`);
  console.log(`P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms`);
  console.log(`P99 Response Time: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms`);
  console.log(`Average MongoDB Response: ${data.metrics.mongo_response_time.values.avg.toFixed(2)}ms`);
  console.log(`Average PostgreSQL Response: ${data.metrics.postgres_response_time.values.avg.toFixed(2)}ms`);
  console.log('======================================\n');

  return summary;
}
