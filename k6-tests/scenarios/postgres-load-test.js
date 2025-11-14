import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp-up to 10 users
    { duration: '1m', target: 20 },   // Ramp-up to 20 users
    { duration: '2m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'],                  // Error rate < 1%
    errors: ['rate<0.05'],                           // Custom error rate < 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: PostgreSQL test endpoint
  const testRes = http.get(`${BASE_URL}/api/postgres/test`);
  const testCheck = check(testRes, {
    'postgres test status is 200': (r) => r.status === 200,
    'postgres test has success field': (r) => JSON.parse(r.body).success === true,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(!testCheck);

  sleep(1);

  // Test 2: Get all products
  const productsRes = http.get(`${BASE_URL}/api/postgres/products?page=1&limit=10`);
  const productsCheck = check(productsRes, {
    'get products status is 200': (r) => r.status === 200,
    'products response has data': (r) => {
      const body = JSON.parse(r.body);
      return body.success && Array.isArray(body.data);
    },
  });
  errorRate.add(!productsCheck);

  sleep(1);

  // Test 3: Create a new product
  const productData = {
    name: `Product_${__VU}_${__ITER}`,
    description: `Test product created by VU ${__VU} iteration ${__ITER}`,
    price: (Math.random() * 1000).toFixed(2),
    quantity: Math.floor(Math.random() * 100),
    category: ['Electronics', 'Clothing', 'Food', 'Books'][Math.floor(Math.random() * 4)],
    status: 'available',
  };

  const createRes = http.post(
    `${BASE_URL}/api/postgres/products`,
    JSON.stringify(productData),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const createCheck = check(createRes, {
    'create product status is 201': (r) => r.status === 201,
    'created product has id': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data.id;
    },
  });
  errorRate.add(!createCheck);

  // Get created product ID
  let productId;
  if (createRes.status === 201) {
    const createBody = JSON.parse(createRes.body);
    productId = createBody.data.id;

    sleep(1);

    // Test 4: Get product by ID
    const getProductRes = http.get(`${BASE_URL}/api/postgres/products/${productId}`);
    const getProductCheck = check(getProductRes, {
      'get product by id status is 200': (r) => r.status === 200,
      'returned product matches created product': (r) => {
        const body = JSON.parse(r.body);
        return body.success && body.data.name === productData.name;
      },
    });
    errorRate.add(!getProductCheck);

    sleep(1);

    // Test 5: Update product
    const updateData = {
      price: (Math.random() * 1000).toFixed(2),
      quantity: Math.floor(Math.random() * 100),
    };

    const updateRes = http.put(
      `${BASE_URL}/api/postgres/products/${productId}`,
      JSON.stringify(updateData),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const updateCheck = check(updateRes, {
      'update product status is 200': (r) => r.status === 200,
    });
    errorRate.add(!updateCheck);
  }

  sleep(1);

  // Test 6: Search products
  const searchRes = http.get(`${BASE_URL}/api/postgres/products/search?q=Product`);
  const searchCheck = check(searchRes, {
    'search products status is 200': (r) => r.status === 200,
    'search returns array': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.data);
    },
  });
  errorRate.add(!searchCheck);

  sleep(1);

  // Test 7: Get products by price range
  const priceRangeRes = http.get(`${BASE_URL}/api/postgres/products/price-range?min=0&max=500`);
  const priceRangeCheck = check(priceRangeRes, {
    'price range query status is 200': (r) => r.status === 200,
    'price range returns array': (r) => {
      const body = JSON.parse(r.body);
      return Array.isArray(body.data);
    },
  });
  errorRate.add(!priceRangeCheck);

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
