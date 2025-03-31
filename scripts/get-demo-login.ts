/**
 * This script retrieves or creates login credentials for demo users of each role
 * Run with: npx tsx scripts/get-demo-login.ts
 */
import { storage } from "../server/storage";
import { UserRole } from "../shared/schema";
import { hashPassword } from "../server/utils";

const DEMO_PASSWORD = "password123";

async function getOrCreateDemoUsers() {
  console.log("\n=== Demo User Credentials ===\n");
  console.log("Use these credentials to log in to the TOV Property Management Platform\n");
  
  // 1. Find or create a landlord user
  let landlord = await storage.getUserByUsername("demo-landlord");
  if (!landlord) {
    // Look for an existing landlord to reset password
    const landlords = await storage.getUsersByRole(UserRole.LANDLORD);
    if (landlords.length > 0) {
      landlord = landlords[0];
      // Here we would reset the password, but the function isn't implemented yet
      // await storage.updateUserPassword(landlord.id, await hashPassword(DEMO_PASSWORD));
      console.log(`LANDLORD: Username: ${landlord.username}, Password: (original database password)`);
    } else {
      // Create a new landlord
      landlord = await storage.createUser({
        username: "demo-landlord",
        password: await hashPassword(DEMO_PASSWORD),
        firstName: "Demo",
        lastName: "Landlord",
        email: "demo.landlord@example.com",
        role: UserRole.LANDLORD,
        phone: "+267 71234567",
        profileImage: null
      });
      console.log(`LANDLORD: Username: ${landlord.username}, Password: ${DEMO_PASSWORD}`);
    }
  } else {
    console.log(`LANDLORD: Username: ${landlord.username}, Password: ${DEMO_PASSWORD}`);
  }
  
  // 2. Find or create a tenant user
  let tenant = await storage.getUserByUsername("demo-tenant");
  if (!tenant) {
    // Look for an existing tenant to reset password
    const tenants = await storage.getUsersByRole(UserRole.TENANT);
    if (tenants.length > 0) {
      tenant = tenants[0];
      console.log(`TENANT: Username: ${tenant.username}, Password: (original database password)`);
    } else {
      // Create a new tenant
      tenant = await storage.createUser({
        username: "demo-tenant",
        password: await hashPassword(DEMO_PASSWORD),
        firstName: "Demo",
        lastName: "Tenant",
        email: "demo.tenant@example.com",
        role: UserRole.TENANT,
        phone: "+267 72345678",
        profileImage: null
      });
      console.log(`TENANT: Username: ${tenant.username}, Password: ${DEMO_PASSWORD}`);
    }
  } else {
    console.log(`TENANT: Username: ${tenant.username}, Password: ${DEMO_PASSWORD}`);
  }
  
  // 3. Find or create an agency user
  let agency = await storage.getUserByUsername("demo-agency");
  if (!agency) {
    // Look for an existing agency to reset password
    const agencies = await storage.getUsersByRole(UserRole.AGENCY);
    if (agencies.length > 0) {
      agency = agencies[0];
      console.log(`AGENCY: Username: ${agency.username}, Password: (original database password)`);
    } else {
      // Create a new agency
      agency = await storage.createUser({
        username: "demo-agency",
        password: await hashPassword(DEMO_PASSWORD),
        firstName: "Demo",
        lastName: "Agency",
        email: "demo.agency@example.com",
        role: UserRole.AGENCY,
        phone: "+267 73456789",
        profileImage: null
      });
      console.log(`AGENCY: Username: ${agency.username}, Password: ${DEMO_PASSWORD}`);
    }
  } else {
    console.log(`AGENCY: Username: ${agency.username}, Password: ${DEMO_PASSWORD}`);
  }
  
  // 4. Find or create a maintenance user
  let maintenance = await storage.getUserByUsername("demo-maintenance");
  if (!maintenance) {
    // Look for an existing maintenance to reset password
    const maintenances = await storage.getUsersByRole(UserRole.MAINTENANCE);
    if (maintenances.length > 0) {
      maintenance = maintenances[0];
      console.log(`MAINTENANCE: Username: ${maintenance.username}, Password: (original database password)`);
    } else {
      // Create a new maintenance
      maintenance = await storage.createUser({
        username: "demo-maintenance",
        password: await hashPassword(DEMO_PASSWORD),
        firstName: "Demo",
        lastName: "Maintenance",
        email: "demo.maintenance@example.com",
        role: UserRole.MAINTENANCE,
        phone: "+267 74567890",
        profileImage: null
      });
      console.log(`MAINTENANCE: Username: ${maintenance.username}, Password: ${DEMO_PASSWORD}`);
    }
  } else {
    console.log(`MAINTENANCE: Username: ${maintenance.username}, Password: ${DEMO_PASSWORD}`);
  }
  
  console.log("\nNote: For users with 'original database password', you need to ask the database administrator for their password or reset it via the admin panel.");
}

// Run the function
getOrCreateDemoUsers().catch(console.error);