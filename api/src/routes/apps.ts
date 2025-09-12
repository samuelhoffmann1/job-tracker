import { Router } from 'express';
import { ApplicationSchema } from "../schemas";

const router = Router();

// GET all /apps
router.get('/', async (req, res) => {
  const db = req.app.get('db');
  try {
    const result = await db.query(
      'SELECT * FROM applications ORDER BY rating DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET apps/count
router.get('/count', async (req, res) => {
  const db = req.app.get('db');
  try {
    const result = await db.query(
      'SELECT CAST(COUNT(*) AS INTEGER) as count FROM applications'
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error counting applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /apps/user
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

    // Get all applications for this user
    const result = await db.query(
      'SELECT * FROM applications WHERE user_id = $1 ORDER BY rating DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /apps
router.post('/', async (req, res) => {
  const db = req.app.get('db');
  console.log(req.body);
  const result = ApplicationSchema.safeParse(req.body);
  if (!result.success) {
    console.log('Error: ', result.error!.issues)
    res.status(400).json({
      message: 'Validation failed',
      errors: result.error!.issues,
    });
    return;
  }
  const application = result.data;

  try {
    const googleId = (req as any).user.sub;
    const userResult = await db.query('SELECT id FROM users WHERE google_id = $1', [googleId]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userId = userResult.rows[0].id;
    
    // Insert into the new unified applications table
    const newApp = await db.query(
      `INSERT INTO applications (
        title, company, url, location, date_posted, applied_date, 
        min_salary, max_salary, rating, status, feeling, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        application.title,
        application.company,
        application.url,
        application.location,
        application.date_posted || null,
        application.applied_date || new Date().toISOString().split('T')[0],
        application.min_salary || null,
        application.max_salary || null,
        application.rating,
        application.status || 'Applied',
        application.feeling || null,
        userId
      ]
    );
    
    res.status(201).json(newApp.rows[0]);
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update application
router.put('/:id', async (req, res) => {
  const db = req.app.get('db');
  const appId = parseInt(req.params.id);

  if (isNaN(appId) || appId <= 0) {
    res.status(400).json({ error: 'Invalid application ID' });
    return;
  }

  // Using a partial schema as not all fields are required for update
  const updateSchema = ApplicationSchema.partial()
  const result = updateSchema.safeParse(req.body);
  if (!result.success) {
    console.log(req.body)
    res.status(400).json({
      message: 'Validation failed',
      errors: result.error!.issues,
    });
    return;
  }
  const appUpdate = result.data;

  // Check if at least one field is provided
  if (Object.keys(appUpdate).length === 0) {
    res.status(400).json({ error: 'No fields provided for update' });
    return;
  }

  try {
    const googleId = (req as any).user.sub;
    const userResult = await db.query('SELECT id FROM users WHERE google_id = $1', [googleId]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userId = userResult.rows[0].id;

    // Check if application exists and belongs to the user
    const app = await db.query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2', 
      [appId, userId]
    );
    
    if (app.rows.length === 0) {
      res.status(404).json({ error: 'Application not found or not authorized' });
      return;
    }

    // Build dynamic update query
    const fields = Object.keys(appUpdate);
    const values = Object.values(appUpdate);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE applications SET ${setClause} WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} RETURNING *`;
    
    const updatedApp = await db.query(query, [...values, appId, userId]);
    res.json(updatedApp.rows[0]);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE application
router.delete('/:id', async (req, res) => {
  const db = req.app.get('db');
  const appId = parseInt(req.params.id);

  if (isNaN(appId) || appId <= 0) {
    res.status(400).json({ error: 'Invalid application ID' });
    return;
  }

  try {
    const googleId = (req as any).user.sub;
    const userResult = await db.query('SELECT id FROM users WHERE google_id = $1', [googleId]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userId = userResult.rows[0].id;

    // Check if application exists and belongs to the user
    const app = await db.query(
      'SELECT * FROM applications WHERE id = $1 AND user_id = $2', 
      [appId, userId]
    );
    
    if (app.rows.length === 0) {
      res.status(404).json({ error: 'Application not found or not authorized' });
      return;
    }

    // Delete the application
    await db.query('DELETE FROM applications WHERE id = $1 AND user_id = $2', [appId, userId]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router
