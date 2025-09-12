import { Pool } from 'pg';

// Use the same pattern as your main database
const testDbConfig = {
  connectionString: process.env.TEST_DATABASE_URL
};

export const testDb = new Pool(testDbConfig);

// Setup test database schema
export async function setupTestDb() {
  // Create users table
  await testDb.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(320) NOT NULL UNIQUE,
      name VARCHAR(255),
      picture VARCHAR(8) DEFAULT '★',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    )
  `);

  // Create new applications table
  await testDb.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      company VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      location VARCHAR(200) NOT NULL,
      date_posted DATE,
      applied_date DATE,
      min_salary INTEGER,
      max_salary INTEGER,
      rating REAL NOT NULL,
      status VARCHAR(50) DEFAULT 'Applied' NOT NULL,
      feeling VARCHAR(1000),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )
  `);

  // Create indexes for the applications table
  await testDb.query(`
    CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);
  `);

  // Create sequence for applications table
  await testDb.query(`
    CREATE SEQUENCE IF NOT EXISTS applications_id_seq
      AS integer
      START WITH 1
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1;
  `);
}

// Clear test data
export async function clearTestData() {
  // Delete all data from the applications table
  await testDb.query('DELETE FROM applications');

  // Delete all data from the users table
  await testDb.query('DELETE FROM users');

  // Reset sequences
  await testDb.query('ALTER SEQUENCE applications_id_seq RESTART WITH 1');
  await testDb.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
}

// Teardown test database
export async function teardownTestDb() {
  // Drop the applications table
  await testDb.query('DROP TABLE IF EXISTS applications CASCADE');

  // Drop the users table
  await testDb.query('DROP TABLE IF EXISTS users CASCADE');

  // End the database connection
  await testDb.end();
}