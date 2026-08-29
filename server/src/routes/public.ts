import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', async (_req, res) => {
  const [users, posts, events] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.event.count(),
  ]);
  res.json({ users, posts, events });
});

export default router;
