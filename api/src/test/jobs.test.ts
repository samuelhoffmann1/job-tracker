import request from 'supertest';
import { createApp } from '../index';
import { testDb, setupTestDb, clearTestData, teardownTestDb } from '../test-utils/test-db';

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn()
}));

import { getToken } from 'next-auth/jwt';

describe('Jobs API', () => {
  let app: any;

  beforeAll(async () => {
    // Setup test database schema
    await setupTestDb();
    
    // Create app with test database
    app = createApp(testDb);
  });

  beforeEach(async () => {
    // Clear data before each test
    await clearTestData();
    
    // Mock getToken to return our test token data
    (getToken as jest.Mock).mockResolvedValue({
      sub: '123',
      email: 'test@example.com',
      name: 'Test User'
    });
  });

  afterAll(async () => {
    // Cleanup after all tests
    await teardownTestDb();
  });

  describe('GET /jobs', () => {
    it('should return empty array when no jobs exist', async () => {
      const response = await request(app)
        .get('/jobs')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return jobs ordered by rating DESC', async () => {
      // Insert test user first
      const userResult = await testDb.query(
        'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id',
        ['123', 'test@example.com', 'Test User']
      );
      const userId = userResult.rows[0].id;

      // Insert test jobs
      await testDb.query(
        'INSERT INTO jobs (title, url, date_posted, location, min_salary, max_salary, rating, company, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        ['Job 1', 'https://example.com/job1', '2024-01-01', 'Remote', 50000, 60000, 7.5, 'Company A', userId]
      );
      await testDb.query(
        'INSERT INTO jobs (title, url, date_posted, location, min_salary, max_salary, rating, company, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        ['Job 2', 'https://example.com/job2', '2024-01-02', 'New York', 70000, 80000, 9.0, 'Company B', userId]
      );

      const response = await request(app)
        .get('/jobs')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].rating).toBe(9.0); // Higher rating first
      expect(response.body[1].rating).toBe(7.5);
    });
  });

  describe('GET /jobs/:id', () => {
    let userId: number;
    let jobId: number;
    
    beforeEach(async () => {
      // Create a test user
      const userResult = await testDb.query(
        'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id',
        ['123', 'test@example.com', 'Test User']
      );
      userId = userResult.rows[0].id;

      // Create a test job
      const jobResult = await testDb.query(
        'INSERT INTO jobs (title, url, date_posted, location, min_salary, max_salary, rating, company, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        ['Test Job', 'https://example.com/test-job', '2024-01-01', 'Remote', 50000, 60000, 7.5, 'Test Company', userId]
      );
      jobId = jobResult.rows[0].id;
    });

    it('should return job by ID', async () => {
      const response = await request(app)
        .get(`/jobs/${jobId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: jobId,
        title: 'Test Job',
        url: 'https://example.com/test-job',
        location: 'Remote',
        min_salary: 50000,
        max_salary: 60000,
        rating: 7.5,
        company: 'Test Company',
        owner_id: userId
      });
    });
  });

  describe('POST /jobs', () => {
    let userId: number;

    beforeEach(async () => {
      // Create a test user for each POST test
      const userResult = await testDb.query(
        'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id',
        ['123', 'test@example.com', 'Test User']
      );
      userId = userResult.rows[0].id;
    });

    it('should create a new job with valid data', async () => {
      const jobData = {
        title: 'Software Engineer',
        url: 'https://example.com/job',
        date_posted: '2024-01-15',
        location: 'San Francisco',
        min_salary: 80000,
        max_salary: 120000,
        rating: 8.5,
        company: 'Tech Corp',
        owner_id: userId
      };

      const response = await request(app)
        .post('/jobs')
        .send(jobData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Software Engineer',
        url: 'https://example.com/job',
        location: 'San Francisco',
        min_salary: 80000,
        max_salary: 120000,
        rating: 8.5,
        company: 'Tech Corp',
        owner_id: userId
      });
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const invalidJobData = {
        title: 'Software Engineer',
        // Missing required fields
        url: 'https://example.com/job',
        location: 'San Francisco'
      };

      const response = await request(app)
        .post('/jobs')
        .send(invalidJobData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should return 400 for invalid URL format', async () => {
      const jobData = {
        title: 'Software Engineer',
        url: 'not-a-valid-url',
        date_posted: '2024-01-15',
        location: 'San Francisco',
        min_salary: 80000,
        max_salary: 120000,
        rating: 8.5,
        company: 'Tech Corp',
        owner_id: userId
      };

      const response = await request(app)
        .post('/jobs')
        .send(jobData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for invalid rating (out of range)', async () => {
      const jobData = {
        title: 'Software Engineer',
        url: 'https://example.com/job',
        date_posted: '2024-01-15',
        location: 'San Francisco',
        min_salary: 80000,
        max_salary: 120000,
        rating: 15, // Invalid: > 10
        company: 'Tech Corp',
        owner_id: userId
      };

      const response = await request(app)
        .post('/jobs')
        .send(jobData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for negative salary', async () => {
      const jobData = {
        title: 'Software Engineer',
        url: 'https://example.com/job',
        date_posted: '2024-01-15',
        location: 'San Francisco',
        min_salary: -1000, // Invalid: negative
        max_salary: 120000,
        rating: 8.5,
        company: 'Tech Corp',
        owner_id: userId
      };

      const response = await request(app)
        .post('/jobs')
        .send(jobData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /jobs/:id', () => {
    let userId: number;
    let jobId: number;

    beforeEach(async () => {
      // Create a test user
      const userResult = await testDb.query(
        'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id',
        ['123', 'test@example.com', 'Test User']
      );
      userId = userResult.rows[0].id;

      // Create a test job to update
      const jobResult = await testDb.query(
        'INSERT INTO jobs (title, url, date_posted, location, min_salary, max_salary, rating, company, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        ['Original Job', 'https://example.com/original', '2024-01-01', 'Remote', 50000, 60000, 7.0, 'Original Company', userId]
      );
      jobId = jobResult.rows[0].id;
    });

    it('should update job with valid data', async () => {
      const updateData = {
        title: 'Updated Job Title',
        rating: 9.5,
        location: 'New York'
      };

      const response = await request(app)
        .put(`/jobs/${jobId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: jobId,
        title: 'Updated Job Title',
        rating: 9.5,
        location: 'New York',
        // Other fields should remain unchanged
        url: 'https://example.com/original',
        company: 'Original Company',
        owner_id: userId
      });
    });

    it('should update only provided fields', async () => {
      const updateData = {
        rating: 8.8
      };

      const response = await request(app)
        .put(`/jobs/${jobId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.rating).toBe(8.8);
      expect(response.body.title).toBe('Original Job'); // Should remain unchanged
      expect(response.body.company).toBe('Original Company'); // Should remain unchanged
    });

    it('should return 400 for invalid job ID', async () => {
      const updateData = { title: 'Updated Title' };

      await request(app)
        .put('/jobs/invalid-id')
        .send(updateData)
        .expect(400);

      await request(app)
        .put('/jobs/0')
        .send(updateData)
        .expect(400);

      await request(app)
        .put('/jobs/-1')
        .send(updateData)
        .expect(400);
    });

    it('should return 404 for non-existent job', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put('/jobs/99999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Job not found');
    });

    it('should return 400 when no fields provided for update', async () => {
      const response = await request(app)
        .put(`/jobs/${jobId}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'No fields provided for update');
    });

    it('should return 400 for invalid field values', async () => {
      const updateData = {
        rating: 15, // Invalid: > 10
        min_salary: -500 // Invalid: negative
      };

      const response = await request(app)
        .put(`/jobs/${jobId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should return 400 for invalid URL in update', async () => {
      const updateData = {
        url: 'not-a-valid-url'
      };

      const response = await request(app)
        .put(`/jobs/${jobId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should handle partial updates correctly', async () => {
      const updateData = {
        min_salary: 70000,
        max_salary: 90000,
        company: 'New Company Inc'
      };

      const response = await request(app)
        .put(`/jobs/${jobId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: jobId,
        min_salary: 70000,
        max_salary: 90000,
        company: 'New Company Inc',
        // These should remain unchanged
        title: 'Original Job',
        rating: 7.0,
        location: 'Remote'
      });
    });
  });

  describe('GET /jobs/count', () => {
    it('should return zero jobs when none exist', async () => {
      const response = await request(app)
        .get('/jobs/count')
        .expect(200);

      expect(response.body).toHaveProperty('count', 0);
    });

    it('should return the total count of jobs', async () => {
      // Insert test user first
      const userResult = await testDb.query(
        'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id',
        ['123', 'test@example.com', 'Test User']
      );
      const userId = userResult.rows[0].id;

      // Insert a job for the test user
      await testDb.query(
        'INSERT INTO jobs (title, url, date_posted, location, min_salary, max_salary, rating, company, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        ['Test Job', 'https://example.com', new Date(), 'Remote', 50000, 100000, 5, 'Test Company', userId]
      );
      const response = await request(app)
        .get('/jobs/count')
        .expect(200);
      
      expect(response.body).toHaveProperty('count', 1);
    });
  });

  describe('DELETE /jobs/:id', () => {
    let userId: number;
    let jobId: number;

    beforeEach(async () => {
      // Create a test user
      const userResult = await testDb.query(
        'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING id',
        ['123', 'test@example.com', 'Test User']
      );
      userId = userResult.rows[0].id;

      // Create a test job
      const jobResult = await testDb.query(
        'INSERT INTO jobs (title, url, date_posted, location, min_salary, max_salary, rating, company, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        ['Test Job', 'https://example.com', new Date(), 'Remote', 50000, 100000, 5, 'Test Company', userId]
      );
      jobId = jobResult.rows[0].id;
    });

    it('should return 204 for successful deletion', async () => {
      let count = await testDb.query('SELECT COUNT(*) :: integer FROM jobs');
      expect(count.rows[0]).toHaveProperty('count', 1);

      const response = await request(app)
        .delete(`/jobs/${jobId}`)
        .expect(204);

      expect(response.body).toEqual({});

      count = await testDb.query('SELECT COUNT(*) :: integer FROM jobs');
      expect(count.rows[0]).toHaveProperty('count', 0);
    });

    it('should return 404 for non-existent job', async () => {
      const response = await request(app)
        .delete('/jobs/99999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Job not found');
    });

    it('should return 400 for invalid job ID', async () => {
      const response = await request(app)
        .delete('/jobs/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid job ID');
    });
  });
});
