import { storage } from "../server/storage";
import { hashPassword } from "../server/utils";
import { UserRole } from "../shared/schema";

/**
 * This script creates a set of test users with predictable credentials
 * for easy testing of the TOV Property Management Platform.
 */
async function createTestUsers() {
  try {
    console.log("Creating test users with Botswana-specific data...");
    
    // Clear existing users if any
    await storage.clearUsers();
    
    // Create test users for each role
    const landlord = await storage.createUser({
      username: "landlord",
      password: await hashPassword("password123"),
      firstName: "Kgosi",
      lastName: "Molefe",
      email: "kgosi.molefe@example.com",
      phone: "+267 71 1234567",
      role: UserRole.LANDLORD,
      profileImage: null
    });
    
    const tenant = await storage.createUser({
      username: "tenant",
      password: await hashPassword("password123"),
      firstName: "Tumelo",
      lastName: "Morapedi",
      email: "tumelo.morapedi@example.com",
      phone: "+267 72 2345678",
      role: UserRole.TENANT,
      profileImage: null
    });
    
    const agency = await storage.createUser({
      username: "agency",
      password: await hashPassword("password123"),
      firstName: "Tebogo",
      lastName: "Kgosidintsi",
      email: "tebogo.kgosidintsi@example.com",
      phone: "+267 73 3456789",
      role: UserRole.AGENCY,
      profileImage: null
    });
    
    const maintenance = await storage.createUser({
      username: "maintenance",
      password: await hashPassword("password123"),
      firstName: "Mpho",
      lastName: "Seleka",
      email: "mpho.seleka@example.com",
      phone: "+267 74 4567890",
      role: UserRole.MAINTENANCE,
      profileImage: null
    });
    
    console.log("\n=== Test Users Created Successfully ===");
    console.log("You can login with the following credentials:");
    console.log(`Landlord: ${landlord.username} / password123`);
    console.log(`Tenant: ${tenant.username} / password123`);
    console.log(`Agency: ${agency.username} / password123`);
    console.log(`Maintenance: ${maintenance.username} / password123`);
    console.log("\nAll users have the password: password123");
    
    return { landlord, tenant, agency, maintenance };
  } catch (error) {
    console.error("Error creating test users:", error);
    throw error;
  }
}

// Run the script
createTestUsers().catch(console.error);