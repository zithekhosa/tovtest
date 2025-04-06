/**
 * Script to fix syntax error in vite.config.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';

async function fixViteConfig() {
  console.log(chalk.blue("\n=== Fixing vite.config.ts ===\n"));
  
  try {
    // Read vite.config.ts
    const configPath = './vite.config.ts';
    let configContent = readFileSync(configPath, 'utf8');
    
    // Fix the syntax error (extra comma and curly brace)
    configContent = configContent.replace(/},}/g, '},');
    
    // Write back to file
    writeFileSync(configPath, configContent);
    
    console.log(chalk.green("✅ Fixed syntax error in vite.config.ts"));
  } catch (error) {
    console.error(chalk.red("\n❌ Failed to fix vite.config.ts:"));
    console.error(error);
  }
}

fixViteConfig().catch(console.error);