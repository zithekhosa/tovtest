import { cleanupData } from './seed-data';

async function runCleanup() {
  try {
    console.log("Starting to clean up all test data...");
    await cleanupData();
    console.log("All test data has been successfully removed!");
  } catch (error) {
    console.error("Error running cleanup script:", error);
    process.exit(1);
  }
}

runCleanup();