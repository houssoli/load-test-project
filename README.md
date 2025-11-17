# K6 Load Testing Project

A complete **TypeScript Node.js backend** with MongoDB and PostgreSQL integration, designed for comprehensive load testing using Grafana K6.

> 🎉 **NEW**: This project is now fully migrated to TypeScript! See [TYPESCRIPT_GUIDE.md](./TYPESCRIPT_GUIDE.md) for details.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        K6 Load Tests                        │
│  (Virtual Users generating HTTP requests)                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Backend                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Middlewares│  │   Routes    │  │ Controllers │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │  Services   │  │   Models    │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────┬──────────────────────┬────────────────────────┘
              │                      │
              ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐
    │    MongoDB      │    │   PostgreSQL    │
    │   (Mongoose)    │    │   (Sequelize)   │
    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- **Node.js** >= 18.x
- **TypeScript** >= 5.x (installed as dev dependency)
- **MongoDB** >= 5.0
- **PostgreSQL** >= 13
- **K6** >= 0.45
- **Docker** & **Docker Compose** (optional, recommended)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Create project directory
mkdir k6-load-test && cd k6-load-test

# Initialize backend
mkdir -p backend && cd backend
npm init -y
npm install express mongoose pg sequelize dotenv helmet cors compression express-rate-limit
npm install --save-dev nodemon

# Install K6
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### 2. Database Setup

#### Option A: Using Docker Compose (Recommended) 🐳

**Start all services (MongoDB, PostgreSQL, and Backend):**
```bash
# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild backend after code changes
docker-compose up -d --build backend

# Start only databases (run backend locally)
docker-compose up -d mongodb postgres
```

#### Option B: Manual Database Setup

**MongoDB:**
```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**PostgreSQL:**
```bash
# Start PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# Or using Docker
docker run -d -p 5432:5432 --name postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=loadtest_db \
  postgres:16-alpine

# Create database
psql -U postgres
CREATE DATABASE loadtest_db;
```

### 3. Configure Environment

```bash
# Copy environment template (only needed for local development)
cp backend/.env.example backend/.env

# Edit .env with your database credentials
nano backend/.env
```

**Note:** When using docker-compose, environment variables are configured in `docker-compose.yml`.

### 4. Run the Application

#### With Docker Compose:
```bash
# All services (recommended)
docker-compose up -d

# Access at http://localhost:3000
```

#### Without Docker (Local Development):
```bash
# Navigate to backend directory
cd backend

# Start in development mode (with auto-reload)
npm run dev

# Or in production mode
npm start
```

The server will start on `http://localhost:3000`

### 5. Verify Installation

```bash
# Check health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","timestamp":"2024-...","uptime":...}
```

## 🧪 Running Load Tests

### Quick Smoke Test

Run a quick smoke test to verify everything is working:

```bash
# Simple smoke test (1 VU, 30 seconds)
k6 run --vus 1 --duration 30s backend/tests/k6-smoke-test.js

# Expected results:
# ✓ All checks passing (100%)
# ✓ Response times p(95) < 500ms
# ✓ Error rate < 1%
```

**What the smoke test validates:**
- Health endpoint responds correctly
- MongoDB API is accessible and working
- PostgreSQL API is accessible and working
- Basic CRUD operations function properly

### Comprehensive Test Scenarios

```bash
cd k6-tests

# Make script executable
chmod +x run-tests.sh

# Run smoke test (quick validation)
./run-tests.sh smoke

# Run MongoDB tests
./run-tests.sh mongo

# Run PostgreSQL tests
./run-tests.sh postgres

# Run combined tests
./run-tests.sh combined

# Run stress test
./run-tests.sh stress

# Run all tests
./run-tests.sh all
```

### Manual K6 Commands

```bash
# Simple test
k6 run --vus 10 --duration 30s scenarios/mongo-load-test.js

# With custom environment
BASE_URL=http://staging.example.com k6 run scenarios/combined-load-test.js

# Export results
k6 run --out json=results.json scenarios/combined-load-test.js

# Cloud execution
k6 cloud scenarios/combined-load-test.js
```

## 📊 API Endpoints

### Health Check
```
GET /health
```

### MongoDB Endpoints (Users)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mongo/test` | Test endpoint |
| POST | `/api/mongo/users` | Create user |
| GET | `/api/mongo/users` | Get all users (paginated) |
| GET | `/api/mongo/users/:id` | Get user by ID |
| PUT | `/api/mongo/users/:id` | Update user |
| DELETE | `/api/mongo/users/:id` | Delete user |
| GET | `/api/mongo/users/search?q=query` | Search users |
| GET | `/api/mongo/users/stats` | Get user statistics |

### PostgreSQL Endpoints (Products)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/postgres/test` | Test endpoint |
| POST | `/api/postgres/products` | Create product |
| GET | `/api/postgres/products` | Get all products (paginated) |
| GET | `/api/postgres/products/:id` | Get product by ID |
| PUT | `/api/postgres/products/:id` | Update product |
| DELETE | `/api/postgres/products/:id` | Delete product |
| GET | `/api/postgres/products/search?q=query` | Search products |
| GET | `/api/postgres/products/price-range?min=0&max=100` | Filter by price |
| GET | `/api/postgres/products/stats` | Get product statistics |

## 📈 K6 Test Scenarios

### 1. Smoke Test
- **Duration:** 30 seconds
- **VUs:** 1
- **Purpose:** Validate basic functionality

### 2. Load Test
- **Stages:**
  - Ramp-up: 0→20 users (1 min)
  - Sustain: 20 users (3 min)
  - Ramp-down: 20→0 users (1 min)
- **Purpose:** Test normal load conditions

### 3. Stress Test
- **Stages:**
  - Ramp-up: 0→50→100 users (4 min)
  - Sustain: 100 users (3 min)
  - Ramp-down: 100→0 users (2 min)
- **Purpose:** Find breaking points

### 4. Spike Test
- **Stages:**
  - Normal: 10 users (10s)
  - Spike: 200 users (30s)
  - Recovery: 10 users (10s)
  - Cool-down: 0 users (10s)
- **Purpose:** Test sudden traffic increases

## 🎯 Performance Thresholds

Default thresholds configured in tests:

```javascript
thresholds: {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],  // Response times
  http_req_failed: ['rate<0.01'],                   // < 1% errors
  errors: ['rate<0.05'],                            // < 5% custom errors
}
```

## � Docker Setup

This project includes a complete Docker Compose configuration for easy deployment and testing.

### Services Included

- **MongoDB**: NoSQL database (port 27017)
- **PostgreSQL**: Relational database (port 5432)
- **Backend**: Node.js API server (port 3000)

### Quick Commands

```bash
# Start all services
docker-compose up -d

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend

# Check service status
docker-compose ps

# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build backend

# Restart a specific service
docker-compose restart backend

# Start only databases (useful for local backend development)
docker-compose up -d mongodb postgres
```

### Development Workflow Options

**Option 1: Full Docker Stack (Recommended for testing)**
```bash
docker-compose up -d
# All services running in containers
```

**Option 2: Hybrid (Useful for backend development)**
```bash
docker-compose up -d mongodb postgres  # Databases in Docker
cd backend && npm run dev              # Backend runs locally with hot-reload
```

## �📦 Project Structure

```
load-test-project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js           # DB connections
│   │   │   └── environment.js        # Environment config
│   │   ├── controllers/
│   │   │   ├── mongoController.js    # MongoDB logic
│   │   │   └── postgresController.js # PostgreSQL logic
│   │   ├── middlewares/
│   │   │   ├── errorHandler.js       # Error handling
│   │   │   └── logger.js             # Request logging
│   │   ├── models/
│   │   │   ├── mongo/
│   │   │   │   └── User.js           # User schema
│   │   │   └── postgres/
│   │   │       └── Product.js        # Product model
│   │   ├── routes/
│   │   │   ├── mongoRoutes.js        # MongoDB routes
│   │   │   └── postgresRoutes.js     # PostgreSQL routes
│   │   ├── services/
│   │   │   ├── mongoService.js       # MongoDB operations
│   │   │   └── postgresService.js    # PostgreSQL operations
│   │   └── app.js                    # Express setup
│   ├── tests/
│   │   └── k6-smoke-test.js          # Quick smoke test
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Environment template
│   ├── .dockerignore                 # Docker build exclusions
│   ├── Dockerfile                    # Backend container image
│   ├── package.json                  # Dependencies
│   └── server.js                     # Entry point
├── k6-tests/
│   ├── scenarios/
│   │   ├── mongo-load-test.js        # MongoDB tests
│   │   ├── postgres-load-test.js     # PostgreSQL tests
│   │   └── combined-load-test.js     # Combined tests
│   ├── utils/
│   │   └── config.js                 # Shared K6 test config
│   ├── results/                      # Test results (gitignored)
│   └── run-tests.sh                  # Test runner script
├── docker-compose.yml                # Multi-service orchestration
├── .gitignore                        # Git exclusions
└── README.md
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/loadtest_db` |
| `PG_HOST` | PostgreSQL host | `localhost` |
| `PG_PORT` | PostgreSQL port | `5432` |
| `PG_DATABASE` | PostgreSQL database name | `loadtest_db` |
| `PG_USER` | PostgreSQL username | `postgres` |
| `PG_PASSWORD` | PostgreSQL password | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### K6 Options

Configure in test files or via CLI:

```javascript
export const options = {
  vus: 10,                    // Virtual users
  duration: '30s',            // Test duration
  iterations: 100,            // Total iterations
  rps: 50,                    // Requests per second
  thresholds: { /* ... */ },  // Performance thresholds
};
```

## 📊 Monitoring & Metrics

### Built-in Metrics

K6 tracks these metrics automatically:
- `http_req_duration` - Request duration
- `http_req_failed` - Failed request rate
- `http_reqs` - Total requests
- `vus` - Virtual users
- `iterations` - Completed iterations

### Custom Metrics

Additional metrics in tests:
- `mongo_response_time` - MongoDB response times
- `postgres_response_time` - PostgreSQL response times
- `mongo_requests` - MongoDB request count
- `postgres_requests` - PostgreSQL request count
- `errors` - Custom error rate

### Export to Grafana

```bash
# Export to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 your-test.js

# Export to JSON
k6 run --out json=results.json your-test.js

# Export to CSV
k6 run --out csv=results.csv your-test.js
```

## 🐛 Troubleshooting

### Common Issues

**1. Cannot connect to MongoDB**
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check connection string in .env
```

**2. PostgreSQL connection refused**
```bash
# Check PostgreSQL status
pg_isready

# Verify credentials and database exists
psql -U postgres -l
```

**3. K6 command not found**
```bash
# Verify installation
k6 version

# Reinstall if needed
brew reinstall k6  # macOS
```

**4. Port already in use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

### Debug Mode

Enable detailed logging:

```bash
# Backend
NODE_ENV=development npm run dev

# K6
k6 run --http-debug scenarios/your-test.js
```

## 🔐 Security Considerations

- Rate limiting enabled (configurable)
- Helmet.js for security headers
- Input validation on all endpoints
- Error handling prevents info leakage
- CORS configured
- Environment variables for secrets

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Load Tests

on: [push, pull_request]

jobs:
  load-test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
      
      postgres:
        image: postgres:latest
        env:
          POSTGRES_DB: loadtest_db
          POSTGRES_PASSWORD: testpass
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Start backend
        run: |
          cd backend
          npm start &
          sleep 5
      
      - name: Install K6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6
      
      - name: Run load tests
        run: |
          cd k6-tests
          k6 run scenarios/combined-load-test.js
```

## 📚 Additional Resources

- [K6 Documentation](https://k6.io/docs/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/test-types/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - feel free to use this project for learning and production use.

## 💡 Tips for Best Results

1. **Start Small:** Begin with smoke tests before running heavy load tests
2. **Monitor Resources:** Watch CPU, memory, and database connections during tests
3. **Baseline First:** Establish baseline performance before optimization
4. **Incremental Load:** Gradually increase load to find breaking points
5. **Test Realistic Scenarios:** Mix read/write operations like real users
6. **Clean Data:** Reset test data between runs for consistency
7. **Network Latency:** Consider network conditions in your thresholds
8. **Database Indexes:** Ensure proper indexes on frequently queried fields

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review K6 documentation
- Open an issue on GitHub

---

**Happy Load Testing! 🚀**
