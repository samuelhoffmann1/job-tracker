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

  // Create jobs table
  await testDb.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      url TEXT NOT NULL,
      date_posted DATE NOT NULL,
      location VARCHAR(200) NOT NULL,
      min_salary INTEGER NOT NULL,
      max_salary INTEGER NOT NULL,
      rating REAL NOT NULL,
      company VARCHAR(255) NOT NULL,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create applications table
  await testDb.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
      status VARCHAR(50) NOT NULL,
      feeling VARCHAR(50),
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

export async function clearTestData() {
  // Delete in correct order due to foreign key constraints
  await testDb.query('DELETE FROM applications');
  await testDb.query('DELETE FROM jobs');
  await testDb.query('DELETE FROM users');
  
  // Reset sequences
  await testDb.query('ALTER SEQUENCE applications_id_seq RESTART WITH 1');
  await testDb.query('ALTER SEQUENCE jobs_id_seq RESTART WITH 1');
  await testDb.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
}

export async function teardownTestDb() {
  await testDb.query('DROP TABLE IF EXISTS applications CASCADE');
  await testDb.query('DROP TABLE IF EXISTS jobs CASCADE');
  await testDb.query('DROP TABLE IF EXISTS users CASCADE');
  await testDb.end();
}