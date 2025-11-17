#!/bin/bash

# K6 Load Testing Runner Script
# This script provides easy commands to run different test scenarios

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
OUTPUT_DIR="./results"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}    K6 Load Testing Runner${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed${NC}"
    echo "Please install k6 from: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Check if backend is running
echo -e "${YELLOW}Checking backend availability...${NC}"
if ! curl -s "${BASE_URL}/health" > /dev/null; then
    echo -e "${RED}Error: Backend is not running at ${BASE_URL}${NC}"
    echo "Please start the backend server first"
    exit 1
fi
echo -e "${GREEN}✓ Backend is running${NC}"
echo ""

# Function to run tests
run_test() {
    local test_name=$1
    local test_file=$2
    local description=$3
    
    echo -e "${YELLOW}Running ${test_name}...${NC}"
    echo "Description: ${description}"
    echo ""
    
    k6 run \
        --out json="${OUTPUT_DIR}/${test_name}-$(date +%Y%m%d-%H%M%S).json" \
        --summary-export="${OUTPUT_DIR}/${test_name}-summary-$(date +%Y%m%d-%H%M%S).json" \
        "${test_file}"
    
    echo ""
    echo -e "${GREEN}✓ ${test_name} completed${NC}"
    echo "Results saved to ${OUTPUT_DIR}/"
    echo ""
}

# Parse command line arguments
case "${1:-help}" in
    smoke)
        echo "Running smoke test (quick validation)..."
        k6 run --vus 1 --duration 30s \
            --out json="${OUTPUT_DIR}/smoke-$(date +%Y%m%d-%H%M%S).json" \
            scenarios/combined-load-test.js
        ;;
    
    mongo)
        run_test "mongo-load-test" \
                 "scenarios/mongo-load-test.js" \
                 "MongoDB endpoint load testing"
        ;;
    
    postgres)
        run_test "postgres-load-test" \
                 "scenarios/postgres-load-test.js" \
                 "PostgreSQL endpoint load testing"
        ;;
    
    combined)
        run_test "combined-load-test" \
                 "scenarios/combined-load-test.js" \
                 "Combined MongoDB and PostgreSQL load testing"
        ;;
    
    stress)
        echo -e "${YELLOW}Running stress test (high load)...${NC}"
        echo "This will push your system to its limits"
        k6 run --vus 100 --duration 5m \
            --out json="${OUTPUT_DIR}/stress-$(date +%Y%m%d-%H%M%S).json" \
            scenarios/combined-load-test.js
        ;;
    
    spike)
        echo -e "${YELLOW}Running spike test (sudden traffic increase)...${NC}"
        k6 run \
            --stage 10s:10 \
            --stage 30s:200 \
            --stage 10s:10 \
            --stage 10s:0 \
            --out json="${OUTPUT_DIR}/spike-$(date +%Y%m%d-%H%M%S).json" \
            scenarios/combined-load-test.js
        ;;
    
    all)
        echo -e "${YELLOW}Running all test scenarios...${NC}"
        echo ""
        
        run_test "mongo-load-test" "scenarios/mongo-load-test.js" "MongoDB tests"
        sleep 5
        
        run_test "postgres-load-test" "scenarios/postgres-load-test.js" "PostgreSQL tests"
        sleep 5
        
        run_test "combined-load-test" "scenarios/combined-load-test.js" "Combined tests"
        
        echo -e "${GREEN}All tests completed!${NC}"
        ;;
    
    clean)
        echo "Cleaning up old test results..."
        rm -rf "${OUTPUT_DIR}"/*
        echo -e "${GREEN}✓ Cleanup completed${NC}"
        ;;
    
    help|*)
        echo "Usage: ./run-tests.sh [command]"
        echo ""
        echo "Commands:"
        echo "  smoke       - Quick smoke test (1 VU, 30s)"
        echo "  mongo       - MongoDB load test"
        echo "  postgres    - PostgreSQL load test"
        echo "  combined    - Combined load test (default)"
        echo "  stress      - Stress test (100 VUs, 5m)"
        echo "  spike       - Spike test (sudden traffic)"
        echo "  all         - Run all test scenarios"
        echo "  clean       - Clean up old results"
        echo "  help        - Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  BASE_URL    - Backend URL (default: http://localhost:3000)"
        echo ""
        echo "Examples:"
        echo "  ./run-tests.sh smoke"
        echo "  BASE_URL=http://staging.example.com ./run-tests.sh combined"
        ;;
esac
