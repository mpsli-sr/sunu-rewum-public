import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Lister toutes les offres
router.get('/', requireRole('ADMIN'), async (_req, res) => {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(jobs);
});

// Mettre à jour une offre
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { title, description, department, location, remote } = req.body;
  const updated = await prisma.job.update({
    where: { id: req.params.id },
    data: { title, description, department, location, remote },
  });
  res.json(updated);
});

// Supprimer une offre
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.job.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
