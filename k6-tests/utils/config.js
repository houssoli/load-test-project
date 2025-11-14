// K6 Test Configuration Utilities
// Shared configuration and helper functions for K6 tests

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Common test stages configurations
export const TEST_STAGES = {
  smoke: [
    { duration: '30s', target: 1 },  // 1 user for 30 seconds
  ],
  
  load: [
    { duration: '1m', target: 20 },   // Ramp-up to 20 users over 1 minute
    { duration: '3m', target: 20 },   // Stay at 20 users for 3 minutes
    { duration: '1m', target: 0 },    // Ramp-down to 0 users over 1 minute
  ],
  
  stress: [
    { duration: '2m', target: 50 },   // Ramp-up to 50 users
    { duration: '2m', target: 100 },  // Ramp-up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp-down to 0 users
  ],
  
  spike: [
    { duration: '10s', target: 10 },  // Normal load
    { duration: '30s', target: 200 }, // Sudden spike
    { duration: '10s', target: 10 },  // Recovery
    { duration: '10s', target: 0 },   // Cool-down
  ],
};

// Common performance thresholds
export const THRESHOLDS = {
  default: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // Response times
    http_req_failed: ['rate<0.01'],                   // < 1% errors
    errors: ['rate<0.05'],                            // < 5% custom errors
  },
  
  strict: {
    http_req_duration: ['p(95)<300', 'p(99)<500'],
    http_req_failed: ['rate<0.005'],
    errors: ['rate<0.01'],
  },
  
  relaxed: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.1'],
  },
};

// Helper function to generate random user data
export function generateUserData(vu, iteration) {
  return {
    name: `User_${vu}_${iteration}`,
    email: `user_${vu}_${iteration}_${Date.now()}@test.com`,
    age: Math.floor(Math.random() * 50) + 18,
    status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
  };
}

// Helper function to generate random product data
export function generateProductData(vu, iteration) {
  const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Home', 'Sports'];
  
  return {
    name: `Product_${vu}_${iteration}`,
    description: `Test product created by VU ${vu} iteration ${iteration}`,
    price: parseFloat((Math.random() * 1000).toFixed(2)),
    quantity: Math.floor(Math.random() * 100),
    category: categories[Math.floor(Math.random() * categories.length)],
    status: 'available',
  };
}

// Helper function to add random sleep between actions
export function randomSleep(min = 0.5, max = 2) {
  const sleep = Math.random() * (max - min) + min;
  return sleep;
}

// HTTP request headers
export const HEADERS = {
  json: {
    'Content-Type': 'application/json',
  },
};

// API endpoints
export const ENDPOINTS = {
  health: `${BASE_URL}/health`,
  
  mongo: {
    test: `${BASE_URL}/api/mongo/test`,
    users: `${BASE_URL}/api/mongo/users`,
    search: `${BASE_URL}/api/mongo/users/search`,
    stats: `${BASE_URL}/api/mongo/users/stats`,
  },
  
  postgres: {
    test: `${BASE_URL}/api/postgres/test`,
    products: `${BASE_URL}/api/postgres/products`,
    search: `${BASE_URL}/api/postgres/products/search`,
    priceRange: `${BASE_URL}/api/postgres/products/price-range`,
    stats: `${BASE_URL}/api/postgres/products/stats`,
  },
};
