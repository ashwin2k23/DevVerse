import express, { Express } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

import { clerkMiddleware } from '@clerk/express';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/auth';
import router from './routes';
import { initializeSocket } from './services/socketService';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// ─── Socket.io ──────────────────────────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost:') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initializeSocket(io);

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors(corsOptions));

app.use(clerkMiddleware());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Security Response Interceptor ───────────────────────────────────────────
app.use((_req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body && typeof body === 'object') {
      // Replace raw 500 error messages with a generic one
      if (res.statusCode >= 500 && body.success === false) {
        body.message = 'Internal Server Error';
      }
      // Never expose debug properties in JSON responses
      delete body.stack;
      delete body.error;
      delete body.details;
    }
    return originalJson.call(this, body);
  };
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', router);

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 DevVerse API running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);

  // Run production Turso database schema migration
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (tursoUrl && tursoToken) {
    try {
      const { createClient } = require('@libsql/client');
      const client = createClient({ url: tursoUrl, authToken: tursoToken });
      client.execute(`ALTER TABLE followers ADD COLUMN status TEXT NOT NULL DEFAULT 'PENDING'`)
        .then(() => console.log('✅ Turso Migration: Successfully added status column to followers table.'))
        .catch((err: any) => {
          if (err.message.includes('duplicate column') || err.message.includes('already exists') || err.message.includes('duplicate')) {
            console.log('ℹ️ Turso Migration: status column already exists, skipping.');
          } else {
            console.error('❌ Turso Migration failed:', err.message);
          }
        });
    } catch (err: any) {
      console.error('❌ Failed to run Turso migration:', err.message);
    }
  }

  // One-time startup database cleanup for test accounts
  const prisma = require('./lib/prisma').default;
  prisma.user.deleteMany({
    where: {
      OR: [
        { username: { contains: 'test_username' } },
        { email: { contains: 'test' } },
        { username: { contains: 'testuser' } }
      ]
    }
  }).then((deleted: { count: number }) => {
    if (deleted.count > 0) {
      console.log(`🧹 Startup DB Cleanup: Removed ${deleted.count} test users.`);
    }
  }).catch((err: any) => {
    console.error("Failed to run startup database cleanup:", err);
  });
});

export default app;
