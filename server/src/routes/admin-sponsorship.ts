import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Lister tous les parrainages avec infos utilisateur
router.get('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { region, status } = req.query;
  const where: any = {};
  if (region) where.region = region as string;
  if (status === 'verified') where.verified = true;
  else if (status === 'pending') where.verified = false;

  const sponsorships = await prisma.sponsorship.findMany({
    where,
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(sponsorships);
});

// Valider un parrainage
router.put('/:id/validate', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.sponsorship.update({ where: { id: req.params.id }, data: { verified: true, smsCode: null } });
  res.json({ ok: true });
});

// Invalider un parrainage
router.put('/:id/invalidate', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.sponsorship.update({ where: { id: req.params.id }, data: { verified: false } });
  res.json({ ok: true });
});

// Supprimer un parrainage
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.sponsorship.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
