// Test script for rating API endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';
let authCookie = '';

async function login(username, password) {
  console.log(`Logging in as ${username}...`);
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password
    })
  });
  
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${response.statusText}`);
  }
  
  // Extract cookie for future requests
  authCookie = response.headers.get('set-cookie');
  console.log("Login successful!");
  return response.json();
}

async function getCurrentUser() {
  console.log("Getting current user...");
  const response = await fetch(`${API_BASE}/user`, {
    headers: {
      'Cookie': authCookie
    }
  });
  
  if (!response.ok) {
    throw new Error(`Get user failed: ${response.status} ${response.statusText}`);
  }
  
  const user = await response.json();
  console.log(`Current user: ${user.username} (ID: ${user.id}, Role: ${user.role})`);
  return user;
}

async function createLandlordRating(landlordId, propertyId, rating) {
  console.log(`Creating landlord rating for landlord ${landlordId}, property ${propertyId}...`);
  const response = await fetch(`${API_BASE}/landlord-ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookie
    },
    body: JSON.stringify({
      landlordId,
      propertyId,
      tenantId: null, // This will be overwritten by the server with the authenticated user's ID
      rating: rating.rating,
      review: rating.review,
      communicationRating: rating.communicationRating,
      maintenanceRating: rating.maintenanceRating,
      valueRating: rating.valueRating
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Create rating failed: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`);
  }
  
  const result = await response.json();
  console.log(`Rating created with ID: ${result.id}`);
  return result;
}

async function getLandlordRatingsByLandlord(landlordId) {
  console.log(`Getting ratings for landlord ${landlordId}...`);
  const response = await fetch(`${API_BASE}/landlord-ratings/landlord/${landlordId}`, {
    headers: {
      'Cookie': authCookie
    }
  });
  
  if (!response.ok) {
    throw new Error(`Get ratings failed: ${response.status} ${response.statusText}`);
  }
  
  const ratings = await response.json();
  console.log(`Retrieved ${ratings.length} ratings for landlord ${landlordId}`);
  return ratings;
}

async function updateLandlordRating(ratingId, updates) {
  console.log(`Updating rating ${ratingId}...`);
  const response = await fetch(`${API_BASE}/landlord-ratings/${ratingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookie
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    throw new Error(`Update rating failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log(`Rating ${ratingId} updated successfully`);
  return result;
}

async function deleteLandlordRating(ratingId) {
  console.log(`Deleting rating ${ratingId}...`);
  const response = await fetch(`${API_BASE}/landlord-ratings/${ratingId}`, {
    method: 'DELETE',
    headers: {
      'Cookie': authCookie
    }
  });
  
  if (!response.ok) {
    throw new Error(`Delete rating failed: ${response.status} ${response.statusText}`);
  }
  
  console.log(`Rating ${ratingId} deleted successfully`);
  return true;
}

// Tenant rating functions
async function createTenantRating(tenantId, propertyId, rating) {
  console.log(`Creating tenant rating for tenant ${tenantId}, property ${propertyId}...`);
  const response = await fetch(`${API_BASE}/tenant-ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookie
    },
    body: JSON.stringify({
      tenantId,
      propertyId,
      landlordId: null, // This will be overwritten by the server with the authenticated user's ID
      rating: rating.rating,
      review: rating.review,
      communicationRating: rating.communicationRating,
      paymentRating: rating.paymentRating,
      propertyRespectRating: rating.propertyRespectRating
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Create tenant rating failed: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`);
  }
  
  const result = await response.json();
  console.log(`Tenant rating created with ID: ${result.id}`);
  return result;
}

async function getTenantRatingsByTenant(tenantId) {
  console.log(`Getting ratings for tenant ${tenantId}...`);
  const response = await fetch(`${API_BASE}/tenant-ratings/tenant/${tenantId}`, {
    headers: {
      'Cookie': authCookie
    }
  });
  
  if (!response.ok) {
    throw new Error(`Get tenant ratings failed: ${response.status} ${response.statusText}`);
  }
  
  const ratings = await response.json();
  console.log(`Retrieved ${ratings.length} ratings for tenant ${tenantId}`);
  return ratings;
}

async function updateTenantRating(ratingId, updates) {
  console.log(`Updating tenant rating ${ratingId}...`);
  const response = await fetch(`${API_BASE}/tenant-ratings/${ratingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': authCookie
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    throw new Error(`Update tenant rating failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  console.log(`Tenant rating ${ratingId} updated successfully`);
  return result;
}

async function deleteTenantRating(ratingId) {
  console.log(`Deleting tenant rating ${ratingId}...`);
  const response = await fetch(`${API_BASE}/tenant-ratings/${ratingId}`, {
    method: 'DELETE',
    headers: {
      'Cookie': authCookie
    }
  });
  
  if (!response.ok) {
    throw new Error(`Delete tenant rating failed: ${response.status} ${response.statusText}`);
  }
  
  console.log(`Tenant rating ${ratingId} deleted successfully`);
  return true;
}

async function runLandlordRatingTests() {
  try {
    // Login and get user info
    await login('demo-tenant', 'password123');
    const user = await getCurrentUser();
    
    // Find a landlord and property to rate
    const landlordId = 1; // Using landlord with ID 1 for testing
    const propertyId = 1; // Using property with ID 1 for testing
    
    // Create a rating
    const newRating = await createLandlordRating(landlordId, propertyId, {
      rating: 4,
      review: "Great landlord, very responsive",
      communicationRating: 5,
      maintenanceRating: 4,
      valueRating: 3
    });
    
    // Get all ratings for the landlord
    const landlordRatings = await getLandlordRatingsByLandlord(landlordId);
    console.log("Landlord ratings:", JSON.stringify(landlordRatings, null, 2));
    
    // Update the rating
    const updatedRating = await updateLandlordRating(newRating.id, {
      rating: 5,
      review: "Even better than I initially thought!",
      valueRating: 4
    });
    console.log("Updated rating:", JSON.stringify(updatedRating, null, 2));
    
    // Delete the rating
    await deleteLandlordRating(newRating.id);
    
    // Verify it's gone
    const ratingsAfterDelete = await getLandlordRatingsByLandlord(landlordId);
    console.log(`Landlord has ${ratingsAfterDelete.length} ratings after deletion`);
    
    console.log("All landlord rating tests completed successfully!");
  } catch (error) {
    console.error("Landlord rating tests failed:", error.message);
  }
}

async function runTenantRatingTests() {
  try {
    // Login and get user info (as a landlord)
    await login('demo-landlord', 'password123');
    const user = await getCurrentUser();
    
    // Find a tenant and property to rate
    const tenantId = 2; // Using tenant with ID 2 for testing
    const propertyId = 1; // Using property with ID 1 for testing
    
    // Create a rating
    const newRating = await createTenantRating(tenantId, propertyId, {
      rating: 4,
      review: "Good tenant, always pays on time",
      communicationRating: 4,
      paymentRating: 5,
      propertyRespectRating: 3
    });
    
    // Get all ratings for the tenant
    const tenantRatings = await getTenantRatingsByTenant(tenantId);
    console.log("Tenant ratings:", JSON.stringify(tenantRatings, null, 2));
    
    // Update the rating
    const updatedRating = await updateTenantRating(newRating.id, {
      rating: 5,
      review: "Even better tenant than I initially thought!",
      propertyRespectRating: 4
    });
    console.log("Updated tenant rating:", JSON.stringify(updatedRating, null, 2));
    
    // Delete the rating
    await deleteTenantRating(newRating.id);
    
    // Verify it's gone
    const ratingsAfterDelete = await getTenantRatingsByTenant(tenantId);
    console.log(`Tenant has ${ratingsAfterDelete.length} ratings after deletion`);
    
    console.log("All tenant rating tests completed successfully!");
  } catch (error) {
    console.error("Tenant rating tests failed:", error.message);
  }
}

// Run the tests
async function runAllTests() {
  await runLandlordRatingTests();
  await runTenantRatingTests();
  console.log("All tests have completed.");
}

runAllTests();