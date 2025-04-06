/**
 * Script to revert production optimizations
 * This script removes production optimization settings from vite.config.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';

async function revertProductionOptimizations() {
  console.log(chalk.blue("\n=== Reverting Production Optimizations ===\n"));
  
  try {
    // Read vite.config.ts
    const configPath = './vite.config.ts';
    let configContent = readFileSync(configPath, 'utf8');
    
    // Check if has optimizations
    if (!configContent.includes('minify: true')) {
      console.log(chalk.yellow("⚠️ No production optimizations found to revert"));
      return;
    }
    
    // Remove build optimizations
    const buildOptionsRegex = /build: {([\s\S]*?)},/;
    const buildOptionsMatch = configContent.match(buildOptionsRegex);
    
    if (buildOptionsMatch) {
      const simpleBuildOptions = `
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  `;
      
      configContent = configContent.replace(buildOptionsRegex, `build: {${simpleBuildOptions}},`);
      
      // Write back to file
      writeFileSync(configPath, configContent);
      
      console.log(chalk.green("✅ Production optimizations removed successfully"));
      console.log(chalk.green("✅ Build settings reverted to development mode"));
    } else {
      console.log(chalk.red("❌ Could not locate build configuration in vite.config.ts"));
    }
    
  } catch (error) {
    console.error(chalk.red("\n❌ Failed to revert production optimizations:"));
    console.error(error);
  }
}

revertProductionOptimizations().catch(console.error);