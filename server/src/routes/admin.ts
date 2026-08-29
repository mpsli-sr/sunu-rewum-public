import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', requireRole('ADMIN'), async (_req, res) => {
  const [users, posts, events] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.event.count(),
  ]);
  res.json({ users, posts, events });
});

router.get('/users', requireRole('ADMIN'), async (_req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, role: true } });
  res.json(users);
});

export default router;
