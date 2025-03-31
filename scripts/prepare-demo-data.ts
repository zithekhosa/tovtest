/**
 * This script runs all data preparation steps in sequence:
 * 1. Updates all properties to belong to the demo landlord
 * 2. Imports the Botswana mock data
 * 3. Adds ratings between the demo landlord and tenants
 * 
 * Run with: npx tsx scripts/prepare-demo-data.ts
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const currentDir = dirname(fileURLToPath(import.meta.url));

const scriptsToRun = [
  'update-tenant-landlords.ts',
  'import-botswana-data.ts',
  'add-botswana-ratings.ts'
];

async function runScript(scriptName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n====== Running ${scriptName} ======\n`);
    
    const scriptPath = join(currentDir, scriptName);
    const process = spawn('npx', ['tsx', scriptPath], { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`\n====== Successfully completed ${scriptName} ======\n`);
        resolve();
      } else {
        console.error(`\n====== Script ${scriptName} failed with code ${code} ======\n`);
        reject(new Error(`Script ${scriptName} failed with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      console.error(`\n====== Error executing ${scriptName}: ${err.message} ======\n`);
      reject(err);
    });
  });
}

async function runAllScripts() {
  try {
    for (const script of scriptsToRun) {
      await runScript(script);
    }
    console.log('\n====== All scripts completed successfully! ======\n');
    console.log('The demo landlord account now has all tenants assigned to it');
    console.log('with mock Botswana data and ratings.');
  } catch (error) {
    console.error('\n====== Error running scripts ======\n');
    console.error(error);
    process.exit(1);
  }
}

runAllScripts();