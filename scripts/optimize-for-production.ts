/**
 * Production optimization script
 * This script modifies vite.config.ts to enable production optimizations
 */

import { readFileSync, writeFileSync } from 'fs';
import chalk from 'chalk';

async function optimizeForProduction() {
  console.log(chalk.blue("\n=== Optimizing TOV Property Management for Production ===\n"));
  
  try {
    // Read vite.config.ts
    const configPath = './vite.config.ts';
    let configContent = readFileSync(configPath, 'utf8');
    
    // Check if already optimized
    if (configContent.includes('minify: true')) {
      console.log(chalk.yellow("⚠️ Production optimizations already applied"));
      return;
    }
    
    // Add build optimizations
    const buildOptionsRegex = /build: {([\s\S]*?)},/;
    const buildOptionsMatch = configContent.match(buildOptionsRegex);
    
    if (buildOptionsMatch) {
      const buildOptions = buildOptionsMatch[1];
      const optimizedBuildOptions = buildOptions + `
    minify: true,
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'wouter'],
          ui: [
            '@/components/ui',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs'
          ]
        }
      }
    },`;
      
      configContent = configContent.replace(buildOptionsRegex, `build: {${optimizedBuildOptions}},`);
      
      // Write back to file
      writeFileSync(configPath, configContent);
      
      console.log(chalk.green("✅ Production optimizations applied successfully"));
      console.log(chalk.green("✅ Build will now use minification and code splitting"));
      console.log(chalk.yellow("\n⚠️ Note: These changes should only be applied before deployment"));
      console.log(chalk.yellow("⚠️ For development, you may want to revert these changes"));
    } else {
      console.log(chalk.red("❌ Could not locate build configuration in vite.config.ts"));
    }
    
  } catch (error) {
    console.error(chalk.red("\n❌ Production optimization failed with error:"));
    console.error(error);
  }
}

optimizeForProduction().catch(console.error);