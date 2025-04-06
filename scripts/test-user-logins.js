/**
 * This script tests login functionality for all demo user accounts
 * Run with: node scripts/test-user-logins.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const DEMO_ACCOUNTS = [
  { username: 'demo-landlord', password: 'password123', role: 'landlord' },
  { username: 'demo-tenant', password: 'password123', role: 'tenant' },
  { username: 'demo-agency', password: 'password123', role: 'agency' },
  { username: 'demo-maintenance', password: 'password123', role: 'maintenance' }
];

async function testLogin(username, password) {
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const user = await response.json();
      return {
        success: true,
        user
      };
    } else {
      return {
        success: false,
        status: response.status,
        error: await response.text()
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function verifyUserProfile(cookies) {
  try {
    const response = await fetch(`${BASE_URL}/api/user`, {
      headers: {
        'Cookie': cookies
      }
    });

    if (response.ok) {
      return {
        success: true,
        user: await response.json()
      };
    } else {
      return {
        success: false,
        status: response.status,
        error: await response.text()
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('\n=== Testing Login Functionality for All User Roles ===\n');
  
  let allPassed = true;
  
  for (const account of DEMO_ACCOUNTS) {
    process.stdout.write(`Testing ${account.role} login (${account.username})... `);
    
    const result = await testLogin(account.username, account.password);
    
    if (result.success) {
      console.log('✅ SUCCESS');
      console.log(`  User ID: ${result.user.id}`);
      console.log(`  Name: ${result.user.firstName} ${result.user.lastName}`);
      console.log(`  Role: ${result.user.role}`);
    } else {
      console.log('❌ FAILED');
      console.log(`  Error: ${result.error || `HTTP ${result.status}`}`);
      allPassed = false;
    }
    
    console.log();
  }
  
  if (allPassed) {
    console.log('✅ All user logins working correctly\n');
  } else {
    console.log('❌ Some user logins failed\n');
  }
}

runAllTests().catch(error => {
  console.error('Test failed with error:', error);
});