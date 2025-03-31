/**
 * This script updates all tenants to be renting from the demo landlord account
 * Run with: npx tsx scripts/update-tenant-landlords.ts
 */
import { db } from "../server/db";

async function updateTenantLandlords() {
  try {
    console.log("Starting tenant-landlord relationship update...");

    // 1. Get the demo landlord account ID
    const demoLandlordResult = await db.execute(
      `SELECT id FROM users WHERE username = 'demo-landlord' LIMIT 1`
    );
    
    if (!demoLandlordResult.rows.length) {
      console.error("Demo landlord account not found!");
      return;
    }
    
    const demoLandlordId = demoLandlordResult.rows[0].id;
    console.log(`Found demo landlord with ID: ${demoLandlordId}`);

    // 2. Update all properties to belong to the demo landlord
    const updateResult = await db.execute(
      `UPDATE properties 
       SET landlord_id = ${demoLandlordId} 
       WHERE landlord_id != ${demoLandlordId}
       RETURNING id`
    );

    console.log(`Updated ${updateResult.rows.length} properties to belong to demo landlord`);

    // 3. Get all properties now belonging to the demo landlord
    const demoPropertiesResult = await db.execute(
      `SELECT id FROM properties WHERE landlord_id = ${demoLandlordId}`
    );

    console.log(`Demo landlord now owns ${demoPropertiesResult.rows.length} properties`);

    // 4. Get active leases on those properties
    const propertyIds = demoPropertiesResult.rows.map(row => row.id);
    
    if (propertyIds.length > 0) {
      const activeLeasesResult = await db.execute(
        `SELECT COUNT(*) FROM leases 
         WHERE property_id IN (${propertyIds.join(',')}) 
         AND active = true`
      );
      
      console.log(`Active leases on demo landlord properties: ${activeLeasesResult.rows[0]?.count || 0}`);
      
      // 5. Get tenants with active leases from demo landlord
      const tenantLeaseResults = await db.execute(`
        SELECT DISTINCT u.id, u.username, u.first_name, u.last_name
        FROM users u
        JOIN leases l ON u.id = l.tenant_id
        JOIN properties p ON l.property_id = p.id
        WHERE p.landlord_id = ${demoLandlordId} AND u.role = 'tenant' AND l.active = true
      `);
  
      console.log("\nTenants renting from demo landlord:");
      tenantLeaseResults.rows.forEach((tenant) => {
        console.log(`- ${tenant.first_name} ${tenant.last_name} (${tenant.username}, ID: ${tenant.id})`);
      });
    } else {
      console.log("No properties found for demo landlord");
    }

    console.log("\nUpdate completed successfully!");
  } catch (error) {
    console.error("Error updating tenant-landlord relationships:", error);
  }
}

// Run the update function
updateTenantLandlords().then(() => {
  console.log("Script finished");
  process.exit(0);
}).catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});