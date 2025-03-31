/**
 * This script applies new schema changes to the database
 * It creates the landlord_ratings and tenant_ratings tables
 */
import pg from 'pg';
const { Pool } = pg;

async function applySchemaChanges() {
  console.log('Applying schema changes...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Create landlord_ratings table
    console.log('Creating landlord_ratings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS landlord_ratings (
        id SERIAL PRIMARY KEY,
        landlord_id INTEGER NOT NULL,
        tenant_id INTEGER NOT NULL,
        property_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        review TEXT,
        communication_rating INTEGER,
        maintenance_rating INTEGER,
        value_rating INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (landlord_id) REFERENCES users(id),
        FOREIGN KEY (tenant_id) REFERENCES users(id),
        FOREIGN KEY (property_id) REFERENCES properties(id)
      )
    `);

    // Create tenant_ratings table
    console.log('Creating tenant_ratings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenant_ratings (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL,
        landlord_id INTEGER NOT NULL,
        property_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        review TEXT,
        payment_rating INTEGER,
        property_respect_rating INTEGER,
        communication_rating INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES users(id),
        FOREIGN KEY (landlord_id) REFERENCES users(id),
        FOREIGN KEY (property_id) REFERENCES properties(id)
      )
    `);

    // Commit the transaction
    await pool.query('COMMIT');
    console.log('Schema changes applied successfully');
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');
    console.error('Error applying schema changes:', error);
    throw error;
  } finally {
    // End the pool
    await pool.end();
  }
}

// Run the function
applySchemaChanges().catch(err => {
  console.error('Failed to apply schema changes:', err);
  process.exit(1);
});