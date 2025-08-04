import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is missing');
  console.error('Please check your .env file and ensure DATABASE_URL is set');
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Validate DATABASE_URL format
try {
  new URL(process.env.DATABASE_URL);
} catch (error) {
  console.error('Invalid DATABASE_URL format:', process.env.DATABASE_URL);
  throw new Error('Invalid DATABASE_URL format. Please check your configuration.');
}

// Create PostgreSQL connection using postgres.js (compatible with Supabase)
const connectionString = process.env.DATABASE_URL;
export const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(sql, { schema });

// Export a function to test database connectivity
export async function testDatabaseConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
