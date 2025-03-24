import { seedData } from './seed-data';

async function runSeed() {
  try {
    console.log("Starting to seed database with Botswana-specific test data...");
    const result = await seedData();
    
    // Print summary of created entities
    console.log("\n=== Seed Data Summary ===");
    console.log(`Landlords: ${result.landlords.length}`);
    console.log(`Tenants: ${result.tenants.length}`);
    console.log(`Agency Representatives: ${result.agencies.length}`);
    console.log(`Maintenance Providers: ${result.maintenanceProviders.length}`);
    console.log(`Properties: ${result.properties.length}`);
    console.log(`Leases: ${result.leases.length}`);
    console.log(`Payments: ${result.payments.length}`);
    console.log(`Maintenance Requests: ${result.maintenanceRequests.length}`);
    console.log(`Documents: ${result.documents.length}`);
    console.log(`Messages: ${result.messages.length}`);
    
    // Print login information for sample users
    if (result.landlords.length > 0) {
      const landlord = result.landlords[0];
      console.log("\n=== Sample Login Credentials ===");
      console.log(`Landlord: ${landlord.username} / password123`);
    }
    
    if (result.tenants.length > 0) {
      const tenant = result.tenants[0];
      console.log(`Tenant: ${tenant.username} / password123`);
    }
    
    if (result.agencies.length > 0) {
      const agency = result.agencies[0];
      console.log(`Agency: ${agency.username} / password123`);
    }
    
    if (result.maintenanceProviders.length > 0) {
      const maintenance = result.maintenanceProviders[0];
      console.log(`Maintenance: ${maintenance.username} / password123`);
    }
    
    console.log("\nSeeding completed successfully!");
    console.log("Use the provided credentials to log into the TOV Property Management Platform.");
    console.log("All users share the same password: password123");
    
  } catch (error) {
    console.error("Error running seed script:", error);
    process.exit(1);
  }
}

runSeed();