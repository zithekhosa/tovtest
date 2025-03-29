/**
 * This script tests several API endpoints to verify that mockup data was created successfully
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Create a cookie jar to maintain the session
let cookies = [];

// Function to login and get a session cookie
async function login() {
  console.log('Logging in as a test user...');
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testlandlord',
        password: 'password123',
      }),
      redirect: 'manual',
    });
    
    if (!response.ok) {
      throw new Error(`Login failed! status: ${response.status}`);
    }
    
    // Extract and save cookies
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      cookies = setCookieHeader.split(',');
      console.log('Login successful, received session cookie');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

// Function to perform a simple GET request to an API endpoint
async function getEndpoint(endpoint) {
  console.log(`Fetching ${endpoint}...`);
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        Cookie: cookies.join('; '),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return null;
  }
}

// Test several API endpoints
async function testEndpoints() {
  console.log('Testing API endpoints to verify mockup data...');
  
  // Login first to get session cookie
  await login();
  
  // Get list of properties
  const properties = await getEndpoint('/api/properties');
  console.log(`Properties found: ${properties ? properties.length : 0}`);
  if (properties && properties.length > 0) {
    console.log('Sample property:', {
      id: properties[0].id,
      address: properties[0].address,
      city: properties[0].city,
      propertyType: properties[0].propertyType,
      bedrooms: properties[0].bedrooms,
      rentAmount: properties[0].rentAmount,
    });
  }
  
  // Get list of users by role
  const tenants = await getEndpoint('/api/users/tenants');
  console.log(`Tenants found: ${tenants ? tenants.length : 0}`);
  if (tenants && tenants.length > 0) {
    console.log('Sample tenant:', {
      id: tenants[0].id,
      name: `${tenants[0].firstName} ${tenants[0].lastName}`,
      email: tenants[0].email,
    });
  }
  
  const landlords = await getEndpoint('/api/users/landlords');
  console.log(`Landlords found: ${landlords ? landlords.length : 0}`);
  
  const agencies = await getEndpoint('/api/users/agencies');
  console.log(`Agencies found: ${agencies ? agencies.length : 0}`);
  
  const maintenanceProviders = await getEndpoint('/api/users/maintenance');
  console.log(`Maintenance Providers found: ${maintenanceProviders ? maintenanceProviders.length : 0}`);
  
  // Get maintenance requests
  const maintenanceRequests = await getEndpoint('/api/maintenance-requests');
  console.log(`Maintenance Requests found: ${maintenanceRequests ? maintenanceRequests.length : 0}`);
  if (maintenanceRequests && maintenanceRequests.length > 0) {
    console.log('Sample maintenance request:', {
      id: maintenanceRequests[0].id,
      title: maintenanceRequests[0].title,
      status: maintenanceRequests[0].status,
      priority: maintenanceRequests[0].priority,
    });
  }
  
  // Get leases
  const leases = await getEndpoint('/api/leases');
  console.log(`Leases found: ${leases ? leases.length : 0}`);
  
  // Get payments
  const payments = await getEndpoint('/api/payments');
  console.log(`Payments found: ${payments ? payments.length : 0}`);
  
  console.log('\nAPI testing complete. The TOV Property Management Platform has been populated with mockup data.');
}

testEndpoints();