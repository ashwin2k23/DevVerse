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

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', router);

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 DevVerse API running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);

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
