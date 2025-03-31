/**
 * This script clears all tables in the database to prepare for fresh data insertion
 */

import { db } from "../server/db";
import { messages, documents, maintenanceRequests, payments, leases, properties, users, applications, maintenanceJobs, maintenanceBids } from "../shared/schema";

async function clearDatabase() {
  console.log("Clearing database tables...");
  
  try {
    // Delete in order to respect foreign key constraints
    console.log("Clearing messages...");
    await db.delete(messages);
    
    console.log("Clearing documents...");
    await db.delete(documents);
    
    console.log("Clearing applications...");
    await db.delete(applications);
    
    console.log("Clearing maintenance bids...");
    await db.delete(maintenanceBids);
    
    console.log("Clearing maintenance jobs...");
    await db.delete(maintenanceJobs);
    
    console.log("Clearing maintenance requests...");
    await db.delete(maintenanceRequests);
    
    console.log("Clearing payments...");
    await db.delete(payments);
    
    console.log("Clearing leases...");
    await db.delete(leases);
    
    console.log("Clearing properties...");
    await db.delete(properties);
    
    console.log("Clearing users...");
    await db.delete(users);
    
    console.log("All database tables have been cleared successfully!");
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
}

// Run the script
clearDatabase()
  .then(() => {
    console.log("Database is now ready for fresh data insertion.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Uncaught error:", error);
    process.exit(1);
  });