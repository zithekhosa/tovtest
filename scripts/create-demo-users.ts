/**
 * This script creates demo users for each role with a known password
 * Run with: npx tsx scripts/create-demo-users.ts
 */
import { storage } from "../server/storage";
import { UserRole } from "../shared/schema";
import { hashPassword } from "../server/utils";

const DEMO_PASSWORD = "password123";

async function createDemoUsers() {
  console.log("\n=== Creating Demo Users ===\n");
  
  // Check for existing demo users
  const existingLandlord = await storage.getUserByUsername("demo-landlord");
  const existingTenant = await storage.getUserByUsername("demo-tenant");
  const existingAgency = await storage.getUserByUsername("demo-agency");
  const existingMaintenance = await storage.getUserByUsername("demo-maintenance");
  
  if (existingLandlord && existingTenant && existingAgency && existingMaintenance) {
    console.log("Demo users already exist with the following credentials:\n");
    console.log(`LANDLORD: Username: demo-landlord, Password: ${DEMO_PASSWORD}`);
    console.log(`TENANT: Username: demo-tenant, Password: ${DEMO_PASSWORD}`);
    console.log(`AGENCY: Username: demo-agency, Password: ${DEMO_PASSWORD}`);
    console.log(`MAINTENANCE: Username: demo-maintenance, Password: ${DEMO_PASSWORD}`);
    return;
  }
  
  // Create demo landlord
  if (!existingLandlord) {
    const landlord = await storage.createUser({
      username: "demo-landlord",
      password: await hashPassword(DEMO_PASSWORD),
      firstName: "Demo",
      lastName: "Landlord",
      email: "demo.landlord@example.com",
      role: UserRole.LANDLORD,
      phone: "+267 71234567",
      profileImage: null
    });
    console.log(`Created demo landlord: ${landlord.username}`);
  }
  
  // Create demo tenant
  if (!existingTenant) {
    const tenant = await storage.createUser({
      username: "demo-tenant",
      password: await hashPassword(DEMO_PASSWORD),
      firstName: "Demo",
      lastName: "Tenant",
      email: "demo.tenant@example.com",
      role: UserRole.TENANT,
      phone: "+267 72345678",
      profileImage: null
    });
    console.log(`Created demo tenant: ${tenant.username}`);
  }
  
  // Create demo agency
  if (!existingAgency) {
    const agency = await storage.createUser({
      username: "demo-agency",
      password: await hashPassword(DEMO_PASSWORD),
      firstName: "Demo",
      lastName: "Agency",
      email: "demo.agency@example.com",
      role: UserRole.AGENCY,
      phone: "+267 73456789",
      profileImage: null
    });
    console.log(`Created demo agency: ${agency.username}`);
  }
  
  // Create demo maintenance
  if (!existingMaintenance) {
    const maintenance = await storage.createUser({
      username: "demo-maintenance",
      password: await hashPassword(DEMO_PASSWORD),
      firstName: "Demo",
      lastName: "Maintenance",
      email: "demo.maintenance@example.com",
      role: UserRole.MAINTENANCE,
      phone: "+267 74567890",
      profileImage: null
    });
    console.log(`Created demo maintenance: ${maintenance.username}`);
  }
  
  console.log("\n=== Demo User Credentials ===\n");
  console.log(`LANDLORD: Username: demo-landlord, Password: ${DEMO_PASSWORD}`);
  console.log(`TENANT: Username: demo-tenant, Password: ${DEMO_PASSWORD}`);
  console.log(`AGENCY: Username: demo-agency, Password: ${DEMO_PASSWORD}`);
  console.log(`MAINTENANCE: Username: demo-maintenance, Password: ${DEMO_PASSWORD}`);
}

// Run the function
createDemoUsers().catch(console.error);