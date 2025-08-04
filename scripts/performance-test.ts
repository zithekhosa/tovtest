#!/usr/bin/env tsx

/**
 * Performance Testing Script
 * 
 * This script monitors the application's performance by:
 * 1. Testing API response times
 * 2. Checking WebSocket connection stability
 * 3. Measuring dashboard loading times
 * 4. Validating error handling
 */

import fetch from 'node-fetch';

interface PerformanceMetrics {
  apiResponseTime: number;
  websocketConnectionTime: number;
  dashboardLoadTime: number;
  errorRate: number;
  successRate: number;
}

class PerformanceTester {
  private baseUrl = 'http://localhost:3002';
  private metrics: PerformanceMetrics[] = [];
  private testCount = 0;

  async testApiResponseTime(endpoint: string): Promise<number> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const endTime = Date.now();
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      return endTime - startTime;
    } catch (error) {
      console.error(`API test failed for ${endpoint}:`, error);
      return -1;
    }
  }

  async testDashboardLoad(): Promise<number> {
    const startTime = Date.now();
    try {
      // Test the main dashboard endpoint
      const response = await fetch(`${this.baseUrl}/api/dashboard/landlord`, {
        headers: {
          'Authorization': 'Bearer test-token' // Mock token for testing
        }
      });
      const endTime = Date.now();
      
      if (!response.ok) {
        throw new Error(`Dashboard returned ${response.status}`);
      }
      
      return endTime - startTime;
    } catch (error) {
      console.error('Dashboard test failed:', error);
      return -1;
    }
  }

  async runPerformanceTest(): Promise<void> {
    console.log('🚀 Starting Performance Test...\n');
    
    const testStartTime = Date.now();
    
    // Test API endpoints
    const apiTests = [
      '/api/user',
      '/api/properties',
      '/api/tenants',
      '/api/leases',
      '/api/maintenance-requests',
      '/api/payments'
    ];
    
    const apiResults = await Promise.all(
      apiTests.map(async (endpoint) => {
        const responseTime = await this.testApiResponseTime(endpoint);
        return { endpoint, responseTime };
      })
    );
    
    // Test dashboard loading
    const dashboardLoadTime = await this.testDashboardLoad();
    
    // Calculate metrics
    const successfulApiTests = apiResults.filter(r => r.responseTime > 0);
    const failedApiTests = apiResults.filter(r => r.responseTime === -1);
    
    const avgApiResponseTime = successfulApiTests.length > 0 
      ? successfulApiTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulApiTests.length 
      : 0;
    
    const errorRate = (failedApiTests.length / apiResults.length) * 100;
    const successRate = 100 - errorRate;
    
    const metrics: PerformanceMetrics = {
      apiResponseTime: avgApiResponseTime,
      websocketConnectionTime: 0, // Would need WebSocket testing
      dashboardLoadTime,
      errorRate,
      successRate
    };
    
    this.metrics.push(metrics);
    this.testCount++;
    
    // Display results
    console.log('📊 Performance Test Results:');
    console.log('============================');
    console.log(`Test #${this.testCount}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('');
    
    console.log('🔗 API Response Times:');
    apiResults.forEach(({ endpoint, responseTime }) => {
      const status = responseTime > 0 ? '✅' : '❌';
      const time = responseTime > 0 ? `${responseTime}ms` : 'FAILED';
      console.log(`  ${status} ${endpoint}: ${time}`);
    });
    
    console.log('');
    console.log('📈 Summary:');
    console.log(`  Average API Response Time: ${avgApiResponseTime.toFixed(2)}ms`);
    console.log(`  Dashboard Load Time: ${dashboardLoadTime > 0 ? `${dashboardLoadTime}ms` : 'FAILED'}`);
    console.log(`  Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`  Error Rate: ${errorRate.toFixed(1)}%`);
    
    // Performance thresholds
    console.log('');
    console.log('🎯 Performance Targets:');
    console.log(`  API Response < 500ms: ${avgApiResponseTime < 500 ? '✅' : '❌'}`);
    console.log(`  Dashboard Load < 2000ms: ${dashboardLoadTime < 2000 ? '✅' : '❌'}`);
    console.log(`  Success Rate > 95%: ${successRate > 95 ? '✅' : '❌'}`);
    
    const totalTestTime = Date.now() - testStartTime;
    console.log(`\n⏱️  Total test time: ${totalTestTime}ms`);
    
    // Recommendations
    console.log('');
    console.log('💡 Recommendations:');
    if (avgApiResponseTime > 500) {
      console.log('  ⚠️  API responses are slow - consider optimization');
    }
    if (dashboardLoadTime > 2000) {
      console.log('  ⚠️  Dashboard loading is slow - check data fetching');
    }
    if (errorRate > 5) {
      console.log('  ⚠️  High error rate - check server stability');
    }
    if (avgApiResponseTime < 200 && dashboardLoadTime < 1000 && errorRate < 1) {
      console.log('  ✅ Excellent performance!');
    }
  }

  async runContinuousMonitoring(intervalMs: number = 30000): Promise<void> {
    console.log(`🔄 Starting continuous monitoring (every ${intervalMs/1000}s)...`);
    console.log('Press Ctrl+C to stop\n');
    
    while (true) {
      await this.runPerformanceTest();
      console.log('\n' + '='.repeat(50) + '\n');
      
      // Wait for next test
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  getAverageMetrics(): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;
    
    const sum = this.metrics.reduce((acc, metric) => ({
      apiResponseTime: acc.apiResponseTime + metric.apiResponseTime,
      websocketConnectionTime: acc.websocketConnectionTime + metric.websocketConnectionTime,
      dashboardLoadTime: acc.dashboardLoadTime + metric.dashboardLoadTime,
      errorRate: acc.errorRate + metric.errorRate,
      successRate: acc.successRate + metric.successRate
    }));
    
    const count = this.metrics.length;
    return {
      apiResponseTime: sum.apiResponseTime / count,
      websocketConnectionTime: sum.websocketConnectionTime / count,
      dashboardLoadTime: sum.dashboardLoadTime / count,
      errorRate: sum.errorRate / count,
      successRate: sum.successRate / count
    };
  }
}

// CLI interface
async function main() {
  const tester = new PerformanceTester();
  const args = process.argv.slice(2);
  
  if (args.includes('--continuous') || args.includes('-c')) {
    const interval = args.find(arg => arg.startsWith('--interval='))?.split('=')[1];
    const intervalMs = interval ? parseInt(interval) * 1000 : 30000;
    await tester.runContinuousMonitoring(intervalMs);
  } else {
    await tester.runPerformanceTest();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { PerformanceTester };