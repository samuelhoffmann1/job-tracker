import { Router } from 'express';
import * as z from "zod/v4";

const JobSchema = z.object({
  title: z.string(),
  url: z.url({
    protocol: /^https?$/,
    hostname: z.regexes.domain
  }),
  date_posted: z.iso.date(),
  location: z.string(),
  min_salary: z.int().nonnegative().optional(),
  max_salary: z.int().nonnegative().optional(),
  rating: z.number().min(0).max(10),
  company: z.string(),
  owner_id: z.number().int().positive(),
});

const router = Router();

// GET all /jobs
router.get('/', async (req, res) => {
  const db = req.app.get('db');
  try {
    const result = await db.query(
      'SELECT * FROM jobs ORDER BY rating DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /jobs/count
router.get('/count', async (req, res) => {
  const db = req.app.get('db');
  try {
    const result = await db.query(
      'SELECT CAST(COUNT(*) AS INTEGER) FROM jobs'
    );
    // Returns { count: int }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /jobs/user
router.get('/user', async (req, res) => {
  const db = req.app.get('db');
  const googleId = (req as any).user.sub;
  
  try {
    // Get user's database ID from their Google ID
    const userResult = await db.query('SELECT id FROM users WHERE google_id = $1', [googleId]);
    
    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Get jobs for this user
    const result = await db.query(
      'SELECT * FROM jobs WHERE owner_id = $1 ORDER BY rating DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /jobs
router.post('/', async (req, res) => {
  const db = req.app.get('db');
  const result = JobSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: 'Validation failed',
      errors: result.error!.issues,
    });
    return;
  }
  const job = result.data;

  try {
    const newJob = await db.query(
      'INSERT INTO jobs (title, url, date_posted, location, min_salary, max_salary, rating, company, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        job.title, 
        job.url, 
        job.date_posted, 
        job.location, 
        job.min_salary ?? null,
        job.max_salary ?? null,
        job.rating, 
        job.company, 
        job.owner_id
      ]
    );
    res.status(201).json(newJob.rows[0]);
    return;
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// PUT /jobs/:id
router.put('/:id', async (req, res) => {
  const db = req.app.get('db');
  const jobId = parseInt(req.params.id);

  if (isNaN(jobId) || jobId <= 0) {
    res.status(400).json({error: 'Invalid job ID'});
    return;
  }
  
  // Using a partial schema as not all fields are required for update
  const updateSchema = JobSchema.partial()
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: 'Validation failed',
      errors: result.error!.issues,
    });
    return;
  }
  const jobUpdate = result.data;

  // Check if at least one field is provided
  if (Object.keys(jobUpdate).length === 0) {
    res.status(400).json({ error: 'No fields provided for update' });
    return;
  }

  try {
    // Check if job exists
    const job = await db.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    if (job.rows.length === 0) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Build dynamic update query
    const fields = Object.keys(jobUpdate);
    const values = Object.values(jobUpdate);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE jobs SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
    const updatedJob = await db.query(query, [...values, jobId]);

    res.json(updatedJob.rows[0]);
    return;
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }

});

// DELETE /jobs/:id
router.delete('/:id', async (req, res) => {
  const db = req.app.get('db');
  const jobId = parseInt(req.params.id);

  if (isNaN(jobId) || jobId <= 0) {
    res.status(400).json({ error: 'Invalid job ID' });
    return;
  }

  try {
    // Check if job exists
    const job = await db.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    if (job.rows.length === 0) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Delete the job
    await db.query('DELETE FROM jobs WHERE id = $1', [jobId]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
