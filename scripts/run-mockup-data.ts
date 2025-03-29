/**
 * This script runs the add-mockup-data script to add comprehensive mockup data
 * to demonstrate the full TOV Property Management Platform ecosystem.
 */

import { addMockupData } from './add-mockup-data';

async function runMockupData() {
  console.log("Starting to add mockup data to TOV Property Management Platform...");
  
  try {
    const results = await addMockupData();
    
    console.log("\n=== Mockup Data Created Successfully ===");
    console.log(`Landlords: ${results.landlords.length}`);
    console.log(`Agencies: ${results.agencies.length}`);
    console.log(`Maintenance Providers: ${results.maintenanceProviders.length}`);
    console.log(`Tenants: ${results.tenants.length}`);
    console.log(`Properties: ${results.properties.length}`);
    console.log(`Leases: ${results.leases.length}`);
    console.log("\nThe TOV Property Management Platform now has comprehensive mockup data");
    console.log("demonstrating interactions between landlords, tenants, agencies, and maintenance providers.");
    console.log("\nYou can now login with any of the following test accounts (all use password: password123):");
    console.log("- landlord / landlord2 / landlord3 / etc.");
    console.log("- tenant / tenant2 / tenant3 / etc.");
    console.log("- agency / agency2 / agency3 / etc.");
    console.log("- maintenance / maintenance2 / maintenance3 / etc.");
    
  } catch (error) {
    console.error("Error adding mockup data:", error);
    process.exit(1);
  }
}

// Run the script
runMockupData()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error("Uncaught error:", error);
    process.exit(1);
  });