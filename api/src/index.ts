import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { jwtDecrypt } from 'jose';
import crypto from 'crypto';
import jobsRouter from './routes/apps';
import usersRouter from './routes/users';
import { db } from './db';

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secretString = process.env.NEXTAUTH_SECRET!;
    
    // Use NextAuth's exact HKDF implementation
    const info = 'NextAuth.js Generated Encryption Key';
    const salt = new Uint8Array(0); // Empty salt
    
    const derivedKey = crypto.hkdfSync('sha256', secretString, salt, info, 32);
    const secret = new Uint8Array(derivedKey);
    
    const result = await jwtDecrypt(token, secret);
    (req as any).user = result.payload;
    
    next();
  } catch (err) {
    console.error("JWE decryption failed:", err);
    res.status(403).json({ error: "Invalid token" });
    return;
  }
};

// Extract app creation into factory function with database parameter
export function createApp(database: any) {
  const app = express();

  // Inject database into app context - ALL routes can access this
  app.set('db', database);

  // Logging middleware
  function logger(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime();
    res.on('finish', () => {
      const [secs, nanosecs] = process.hrtime(start);
      const ms = (secs * 1000 + nanosecs / 1e6).toFixed(3);
      console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms} ms`);
    });
    next();
  }

  // Error handling middleware
  function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error(`[${new Date().toISOString()}] Error on ${req.method} ${req.originalUrl}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(logger);

  // Mount the routes
  app.use('/apps', authenticateToken, jobsRouter);
  app.use('/users', usersRouter);

  // Error handling middleware
  app.use(errorHandler);

  // Catch-all 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  return app;
}

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  const app = createApp(db); // Pass production database
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}