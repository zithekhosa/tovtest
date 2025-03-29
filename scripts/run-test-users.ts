/**
 * This script creates test users for the TOV Property Management Platform.
 */

import { storage } from '../server/storage';
import { UserRole } from '../shared/schema';
import { hashPassword } from '../server/utils';

async function createTestUsers() {
  console.log('Creating test users for different roles...');
  
  try {
    // Create a landlord test user
    const landlordPassword = await hashPassword('password123');
    const landlord = await storage.createUser({
      username: 'testlandlord',
      password: landlordPassword,
      email: 'landlord@test.com',
      firstName: 'Test',
      lastName: 'Landlord',
      role: UserRole.LANDLORD,
      phone: '+267 71234567',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg'
    });
    console.log(`Created test landlord: ${landlord.username} (ID: ${landlord.id})`);
    
    // Create a tenant test user
    const tenantPassword = await hashPassword('password123');
    const tenant = await storage.createUser({
      username: 'testtenant',
      password: tenantPassword,
      email: 'tenant@test.com',
      firstName: 'Test',
      lastName: 'Tenant',
      role: UserRole.TENANT,
      phone: '+267 71234568',
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg'
    });
    console.log(`Created test tenant: ${tenant.username} (ID: ${tenant.id})`);
    
    // Create an agency test user
    const agencyPassword = await hashPassword('password123');
    const agency = await storage.createUser({
      username: 'testagency',
      password: agencyPassword,
      email: 'agency@test.com',
      firstName: 'Test',
      lastName: 'Agency',
      role: UserRole.AGENCY,
      phone: '+267 71234569',
      profileImage: 'https://randomuser.me/api/portraits/men/2.jpg'
    });
    console.log(`Created test agency: ${agency.username} (ID: ${agency.id})`);
    
    // Create a maintenance provider test user
    const maintenancePassword = await hashPassword('password123');
    const maintenance = await storage.createUser({
      username: 'testmaintenance',
      password: maintenancePassword,
      email: 'maintenance@test.com',
      firstName: 'Test',
      lastName: 'Provider',
      role: UserRole.MAINTENANCE,
      phone: '+267 71234570',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg'
    });
    console.log(`Created test maintenance provider: ${maintenance.username} (ID: ${maintenance.id})`);
    
    console.log('\nTest users created successfully!');
    console.log('All users have password: password123\n');
    
    return { landlord, tenant, agency, maintenance };
  } catch (error) {
    console.error('Error creating test users:', error);
    throw error;
  }
}

// Run the function if this is called directly
createTestUsers()
  .then(() => {
    console.log('Test users creation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });