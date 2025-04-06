/**
 * Security check script
 * This script performs basic security checks on the TOV Property Management Platform
 * Run with: node scripts/security-check.js
 */

import fetch from 'node-fetch';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:5000';

// List of protected routes to verify
const PROTECTED_ROUTES = [
  { method: 'GET', path: '/api/user', name: 'Current User' },
  { method: 'GET', path: '/api/properties/landlord', name: 'Landlord Properties' },
  { method: 'GET', path: '/api/leases/tenant', name: 'Tenant Leases' },
  { method: 'GET', path: '/api/properties/agency', name: 'Agency Properties' },
  { method: 'GET', path: '/api/maintenance/assigned', name: 'Maintenance Assigned Jobs' },
  { method: 'POST', path: '/api/update-theme', name: 'Theme Settings' },
  { method: 'GET', path: '/api/messages/conversation/1', name: 'User Messages' },
];

async function testRouteProtection(method, path) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, { method });
    
    if (response.status === 401) {
      return {
        success: true,
        message: 'Route correctly returns 401 when not authenticated'
      };
    } else {
      return {
        success: false,
        status: response.status,
        message: `Route returns ${response.status} instead of 401 when not authenticated`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testLoginEndpoint() {
  try {
    // Test with invalid credentials
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'non-existent-user',
        password: 'wrong-password'
      })
    });
    
    if (response.status === 401) {
      return {
        success: true,
        message: 'Login endpoint correctly rejects invalid credentials'
      };
    } else {
      return {
        success: false,
        status: response.status,
        message: `Login endpoint returns ${response.status} instead of 401 for invalid credentials`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runSecurityChecks() {
  console.log(chalk.blue('\n=== TOV Property Management Security Check ===\n'));
  
  // Check login security
  process.stdout.write('Testing login security... ');
  const loginResult = await testLoginEndpoint();
  if (loginResult.success) {
    console.log(chalk.green('✓ PASS'));
  } else {
    console.log(chalk.red('✗ FAIL'));
    console.log(chalk.red(`  ${loginResult.message || loginResult.error}`));
  }
  
  // Check route protection
  console.log(chalk.yellow('\nTesting protected routes:'));
  let allRoutesPassing = true;
  
  for (const route of PROTECTED_ROUTES) {
    process.stdout.write(`  ${route.method} ${route.path} (${route.name})... `);
    
    const result = await testRouteProtection(route.method, route.path);
    
    if (result.success) {
      console.log(chalk.green('✓ PROTECTED'));
    } else {
      console.log(chalk.red('✗ VULNERABLE'));
      console.log(chalk.red(`    ${result.message || result.error}`));
      allRoutesPassing = false;
    }
  }
  
  // Summary
  console.log(chalk.blue('\n=== Security Check Summary ==='));
  
  if (loginResult.success && allRoutesPassing) {
    console.log(chalk.green('\n✓ All security checks passed'));
    console.log(chalk.green('✓ Authentication system working correctly'));
    console.log(chalk.green('✓ All sensitive routes properly protected'));
  } else {
    console.log(chalk.red('\n✗ Security vulnerabilities detected!'));
    console.log(chalk.red('✗ Please fix the issues above before deploying'));
  }
}

runSecurityChecks().catch(error => {
  console.error('Security check failed with error:', error);
});