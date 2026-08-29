import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { target } = req.body;
  if (target === 'sponsorships-pending') {
    await prisma.sponsorship.deleteMany({ where: { verified: false } });
  } else if (target === 'sponsorships-all') {
    await prisma.sponsorship.deleteMany({});
  } else if (target === 'votes-proposals') {
    await prisma.vote.deleteMany({});
  } else if (target === 'votes-diaspora') {
    await prisma.diasporaVote.deleteMany({});
  } else {
    return res.status(400).json({ message: 'Cible invalide' });
  }
  res.json({ ok: true });
});

export default router;
