import { Router } from 'express';
import * as z from "zod/v4";

const UserSchema = z.object({
  google_id: z.string(),
  email: z.email(),
  name: z.string().min(2).max(100).optional(),
  picture: z.string().length(2).optional(),
  created_at: z.date().default(() => new Date()),
});

const router = Router();

// GET /users
router.get('/', async (_req, res) => {
  throw new Error('Not implemented');
});

// GET /users/:id
router.get('/:id', async (req, res) => {
  throw new Error('Not implemented');
});

// POST /users - Create or update user
router.post('/', async (req, res) => {
  const db = req.app.get('db');
  const result = UserSchema.safeParse(req.body);
  
  if (!result.success) {
    res.status(400).json({
      message: 'Validation failed',
      errors: result.error.issues,
    });
    return;
  }
  
  const user = result.data;

  try {
    const result = await db.query(
      `INSERT INTO users (google_id, email, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (google_id) 
       DO UPDATE SET 
         email = EXCLUDED.email, 
         name = EXCLUDED.name 
       RETURNING *`,
      [user.google_id, user.email, user.name]
    );
    
    res.status(200).json({
      message: 'User created or updated',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error upserting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /users/:id
router.put('/:id', async (req, res) => {
  throw new Error('Not implemented');
});

// DELETE /users/:id
router.delete('/:id', async (req, res) => {
  throw new Error('Not implemented');
});

export default router;
