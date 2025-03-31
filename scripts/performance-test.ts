/**
 * Advanced Performance and Stress Testing for TOV Property Management Platform
 * This script provides comprehensive testing for system performance under heavy load
 */
import { db } from "../server/db";
import { storage } from "../server/storage";
import autocannon from "autocannon";
import fs from "fs";
import path from "path";

// Endpoints to test with corresponding payloads
const endpoints = [
  { 
    url: "/api/properties",
    method: "GET"
  },
  { 
    url: "/api/maintenance/requests",
    method: "GET" 
  },
  {
    url: "/api/auth/login",
    method: "POST",
    body: JSON.stringify({
      username: "demo-landlord",
      password: "password123"
    }),
    headers: {
      "Content-Type": "application/json"
    }
  },
  // Test property search with filters
  {
    url: "/api/properties/search?minPrice=1000&maxPrice=5000&bedrooms=2&location=Gaborone",
    method: "GET"
  }
];

// Define test configurations
const testConfigurations = [
  { connections: 10, duration: 10, title: "Light Load" },
  { connections: 50, duration: 15, title: "Medium Load" },
  { connections: 100, duration: 20, title: "Heavy Load" },
  { connections: 200, duration: 30, title: "Peak Load" }
];

// Prepare result directory
const resultDir = path.join(__dirname, "../performance-results");
if (!fs.existsSync(resultDir)) {
  fs.mkdirSync(resultDir);
}

// Run tests sequentially for each endpoint and configuration
async function runTests() {
  console.log("Starting TOV Platform Performance Testing Suite");
  
  for (const endpoint of endpoints) {
    console.log(`\nTesting endpoint: ${endpoint.method} ${endpoint.url}`);
    
    for (const config of testConfigurations) {
      console.log(`\n${config.title} Test (${config.connections} connections for ${config.duration}s)`);
      
      const testConfig = {
        url: `http://localhost:5000${endpoint.url}`,
        method: endpoint.method,
        body: endpoint.body,
        headers: endpoint.headers || {},
        connections: config.connections,
        duration: config.duration,
        title: `${endpoint.method}-${endpoint.url.replace(/\//g, "-").replace(/\?/g, "-")}-${config.title}`
      };
      
      const results = await autocannon(testConfig);
      
      // Log summary results
      console.log(`  Requests: ${results.requests.total}`);
      console.log(`  Throughput: ${results.throughput.average.toFixed(2)} bytes/sec`);
      console.log(`  Latency (avg): ${results.latency.average.toFixed(2)} ms`);
      console.log(`  Latency (max): ${results.latency.max} ms`);
      console.log(`  Status codes: ${JSON.stringify(results.statusCodeStats)}`);
      
      // Save detailed results to file
      const resultFile = path.join(resultDir, `${testConfig.title}.json`);
      fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
      console.log(`  Detailed results saved to: ${resultFile}`);
    }
  }
  
  console.log("\nPerformance testing completed!");
}

// Database connection optimization test
async function testDatabasePerformance() {
  console.log("\nTesting database query performance...");
  
  // Test property query performance
  const propertyQueryStart = Date.now();
  const properties = await db.query.properties.findMany({
    limit: 1000,
  });
  const propertyQueryDuration = Date.now() - propertyQueryStart;
  console.log(`Fetched ${properties.length} properties in ${propertyQueryDuration}ms`);
  
  // Test complex join query performance
  const joinQueryStart = Date.now();
  const leases = await db.query.leases.findMany({
    with: {
      property: true,
      tenant: true,
    },
    limit: 500,
  });
  const joinQueryDuration = Date.now() - joinQueryStart;
  console.log(`Fetched ${leases.length} leases with joins in ${joinQueryDuration}ms`);
  
  // Test aggregation performance
  const aggregationStart = Date.now();
  const paymentStats = await db.execute(
    `SELECT property_id, SUM(amount) as total, AVG(amount) as average 
     FROM payments 
     GROUP BY property_id 
     ORDER BY total DESC 
     LIMIT 20`
  );
  const aggregationDuration = Date.now() - aggregationStart;
  console.log(`Executed aggregation query in ${aggregationDuration}ms`);
}

// Main execution
(async () => {
  try {
    await runTests();
    await testDatabasePerformance();
  } catch (error) {
    console.error("Error during performance testing:", error);
  } finally {
    process.exit(0);
  }
})();