# K6 Load Testing Setup - Complete Implementation

## Project Structure

```
/load-test-project
├── /backend
│   ├── /src
│   │   ├── /config
│   │   │   ├── database.js
│   │   │   └── environment.js
│   │   ├── /controllers
│   │   │   ├── mongoController.js
│   │   │   └── postgresController.js
│   │   ├── /middlewares
│   │   │   ├── errorHandler.js
│   │   │   └── logger.js
│   │   ├── /models
│   │   │   ├── mongo
│   │   │   │   └── User.js
│   │   │   └── postgres
│   │   │       └── Product.js
│   │   ├── /routes
│   │   │   ├── mongoRoutes.js
│   │   │   └── postgresRoutes.js
│   │   ├── /services
│   │   │   ├── mongoService.js
│   │   │   └── postgresService.js
│   │   └── app.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── /k6-tests
│   ├── /scenarios
│   │   ├── mongo-load-test.js
│   │   ├── postgres-load-test.js
│   │   └── combined-load-test.js
│   ├── /utils
│   │   └── config.js
│   └── run-tests.sh
└── README.md
```

## Installation Steps

### 1. Backend Setup

```bash
# Create project structure
mkdir -p load-test-project/backend/src/{config,controllers,middlewares,models/mongo,models/postgres,routes,services}
mkdir -p load-test-project/k6-tests/{scenarios,utils}
cd load-test-project/backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose pg sequelize dotenv helmet cors compression express-rate-limit
npm install --save-dev nodemon
```

### 2. K6 Installation

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```bash
choco install k6
```

## Backend Implementation Files

I'll provide all the necessary files in separate artifacts for easy implementation.

## Environment Variables

Create `.env` file in `/backend`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/loadtest_db
MONGODB_TEST_URI=mongodb://localhost:27017/loadtest_db_test

# PostgreSQL Configuration
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=loadtest_db
PG_USER=your_username
PG_PASSWORD=your_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Running the Solution

### Start Backend
```bash
cd backend
npm run dev
```

### Run K6 Tests

```bash
# Simple smoke test
k6 run --vus 10 --duration 30s k6-tests/scenarios/mongo-load-test.js

# Load test with custom configuration
k6 run k6-tests/scenarios/combined-load-test.js

# Stress test
k6 run --vus 100 --duration 5m k6-tests/scenarios/postgres-load-test.js

# Output results to file
k6 run --out json=results.json k6-tests/scenarios/combined-load-test.js
```

## Key Features

### Backend
- ✅ Modular architecture with separation of concerns
- ✅ MongoDB and PostgreSQL integration
- ✅ Error handling middleware
- ✅ Request logging
- ✅ Rate limiting
- ✅ Health check endpoints
- ✅ CRUD operations for both databases

### K6 Tests
- ✅ Configurable virtual users and duration
- ✅ Multiple test scenarios (smoke, load, stress, spike)
- ✅ Custom checks and thresholds
- ✅ Response time monitoring
- ✅ Error rate tracking
- ✅ Modular test structure

## Next Steps

1. Set up your MongoDB and PostgreSQL databases
2. Update `.env` with your database credentials
3. Seed initial data if needed
4. Start the backend server
5. Run k6 tests to establish baseline performance
6. Adjust thresholds based on your requirements
7. Integrate into CI/CD pipeline

## Monitoring & Metrics

K6 provides built-in metrics:
- `http_req_duration`: Request duration
- `http_req_failed`: Failed requests rate
- `http_reqs`: Total requests per second
- `vus`: Virtual users
- `iterations`: Completed iterations

Export to Grafana for visualization:
```bash
k6 run --out influxdb=http://localhost:8086/k6 your-test.js
```
