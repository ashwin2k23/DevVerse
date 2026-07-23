import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router: Router = Router();

// GET /api/stats — public, no auth required
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [developers, projects, communities] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.community.count(),
    ]);

    res.json({ developers, projects, communities });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
