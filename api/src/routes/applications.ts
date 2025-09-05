import { Router } from 'express';
import { ApplicationSchema, AppWithJobSchema } from '../schemas';

const router = Router();

// GET /applications
router.get('/', async (_req, res) => {
  throw new Error('Not implemented');
});

// GET /applications/:id
router.get('/:id', async (req, res) => {
  throw new Error('Not implemented');
});

// POST /applications
router.post('/', async (req, res) => {
  const db = req.app.get('db');
  const result = AppWithJobSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ message: 'Validation failed', errors: result.error.issues });
    return;
  }
  const { job, applied_date, feeling } = result.data;

  try {

    const googleId = (req as any).user.sub;

    const userResult = await db.query('SELECT id FROM users WHERE google_id = $1', [googleId]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userId = userResult.rows[0].id;
    // 1. Create the job
    const jobResult = await db.query(
      `INSERT INTO jobs (title, url, date_posted, location, min_salary, max_salary, rating, company, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        job.title,
        job.url,
        job.date_posted,
        job.location,
        job.min_salary ?? null,
        job.max_salary ?? null,
        job.rating,
        job.company,
        userId,
      ]
    );
    const job_id = jobResult.rows[0].id;

    // 2. Create the application
    const appResult = await db.query(
      `INSERT INTO applications (applied_date, status, feeling, job_id, applicant_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        applied_date ?? new Date().toISOString().split('T')[0],
        'applied',
        feeling ?? null,
        job_id,
        userId,
      ]
    );

    res.status(201).json(appResult.rows[0]);
  } catch (error) {
    console.error('Error creating job and application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /applications/:id
router.put('/:id', async (req, res) => {
  throw new Error('Not implemented');
});

// DELETE /applications/:id
router.delete('/:id', async (req, res) => {
  throw new Error('Not implemented');
});

export default router;
