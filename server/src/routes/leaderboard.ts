import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      xp: true,
      level: true,
      badges: { select: { badge: { select: { name: true, icon: true } } } },
    },
    orderBy: { xp: 'desc' },
    take: 20,
  });
  res.json(users);
});
export default router;
