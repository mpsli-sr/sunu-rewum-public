import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const badges = await prisma.badge.findMany();
  res.json(badges);
});

// Badges d'un utilisateur spécifique
router.get('/my', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Non connecté' });
  const jwt = require('jsonwebtoken');
  const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: decoded.userId },
    include: { badge: true },
  });
  res.json(userBadges.map((ub) => ub.badge));
});
export default router;
