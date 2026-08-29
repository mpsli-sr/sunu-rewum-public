import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';
import { JWT_ACCESS_SECRET } from '../config';

const router = Router();
const prisma = new PrismaClient();

// Créer un signalement (accessible à tous les utilisateurs connectés)
router.post('/', async (req: Request, res: Response) => {
  const { description, category, anonymous } = req.body;
  const token = req.cookies?.token;
  let userId = null;
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET);
      userId = decoded.userId;
    } catch {}
  }
  const report = await prisma.report.create({
    data: { description, category, anonymous: anonymous !== false, userId },
  });
  res.json({ message: 'Signalement enregistré avec succès', id: report.id });
});

// Lister les signalements (admin)
router.get('/', requireRole('ADMIN'), async (_req, res) => {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  res.json(reports);
});

// Changer le statut (admin)
router.patch('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { status } = req.body;
  await prisma.report.update({ where: { id: req.params.id }, data: { status } });
  res.json({ ok: true });
});

export default router;
