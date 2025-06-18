#!/usr/bin/env node

/**
 * Basic load testing script for Anthrasite.io
 * Tests key endpoints with concurrent requests
 */

const https = require('https');
const http = require('http');

const HOST = process.env.LOAD_TEST_HOST || 'localhost';
const PORT = process.env.LOAD_TEST_PORT || '3000';
const PROTOCOL = process.env.LOAD_TEST_PROTOCOL || 'http';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || '10');
const REQUESTS_PER_USER = parseInt(process.env.REQUESTS_PER_USER || '10');

const httpModule = PROTOCOL === 'https' ? https : http;

// Test scenarios
const scenarios = [
  {
    name: 'Homepage Load',
    method: 'GET',
    path: '/',
    expectedStatus: 200
  }
];

// Results tracking
const results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: []
};

// Make a single request
async function makeRequest(scenario) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const options = {
      hostname: HOST,
      port: PORT,
      path: scenario.path,
      method: scenario.method,
      headers: {
        'User-Agent': 'LoadTest/1.0'
      }
    };

    const req = httpModule.request(options, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      results.totalRequests++;
      results.responseTimes.push(responseTime);
      
      if (res.statusCode === scenario.expectedStatus) {
        results.successfulRequests++;
      } else {
        results.failedRequests++;
        results.errors.push({
          scenario: scenario.name,
          status: res.statusCode,
          expected: scenario.expectedStatus
        });
      }
      
      // Consume response data
      res.on('data', () => {});
      res.on('end', () => resolve());
    });

    req.on('error', (error) => {
      results.totalRequests++;
      results.failedRequests++;
      results.errors.push({
        scenario: scenario.name,
        error: error.message
      });
      resolve();
    });

    req.end();
  });
}

// Run test for a single user
async function runUserTest() {
  for (let i = 0; i < REQUESTS_PER_USER; i++) {
    for (const scenario of scenarios) {
      await makeRequest(scenario);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Main test runner
async function runLoadTest() {
  console.log(`🚀 Starting load test...`);
  console.log(`   Host: ${PROTOCOL}://${HOST}:${PORT}`);
  console.log(`   Concurrent users: ${CONCURRENT_USERS}`);
  console.log(`   Requests per user: ${REQUESTS_PER_USER}`);
  console.log(`   Total requests: ${CONCURRENT_USERS * REQUESTS_PER_USER * scenarios.length}\n`);

  const startTime = Date.now();

  // Run concurrent users
  const userPromises = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    userPromises.push(runUserTest());
  }

  await Promise.all(userPromises);

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Calculate statistics
  const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
  const maxResponseTime = Math.max(...results.responseTimes);
  const minResponseTime = Math.min(...results.responseTimes);
  const successRate = (results.successfulRequests / results.totalRequests * 100).toFixed(2);

  // Print results
  console.log(`\n📊 Load Test Results:`);
  console.log(`   Total time: ${totalTime}ms`);
  console.log(`   Total requests: ${results.totalRequests}`);
  console.log(`   Successful: ${results.successfulRequests} (${successRate}%)`);
  console.log(`   Failed: ${results.failedRequests}`);
  console.log(`\n⏱️  Response Times:`);
  console.log(`   Average: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`   Min: ${minResponseTime}ms`);
  console.log(`   Max: ${maxResponseTime}ms`);
  console.log(`   Requests/sec: ${(results.totalRequests / (totalTime / 1000)).toFixed(2)}`);

  if (results.errors.length > 0) {
    console.log(`\n❌ Errors:`);
    const errorSummary = {};
    results.errors.forEach(error => {
      const key = error.error || `Status ${error.status}`;
      errorSummary[key] = (errorSummary[key] || 0) + 1;
    });
    Object.entries(errorSummary).forEach(([error, count]) => {
      console.log(`   ${error}: ${count}`);
    });
  }

  // Exit with error if success rate is below threshold
  if (parseFloat(successRate) < 95) {
    console.log(`\n❌ Load test failed: Success rate ${successRate}% is below 95% threshold`);
    process.exit(1);
  } else {
    console.log(`\n✅ Load test passed!`);
  }
}

// Run the test
runLoadTest().catch(error => {
  console.error('Load test error:', error);
  process.exit(1);
});