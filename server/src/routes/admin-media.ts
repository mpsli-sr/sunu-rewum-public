import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Lister tous les médias
router.get('/', requireRole('ADMIN'), async (_req, res) => {
  const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(media);
});

// Mettre à jour un média
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { title, url, type } = req.body;
  const updated = await prisma.media.update({
    where: { id: req.params.id },
    data: { title, url, type },
  });
  res.json(updated);
});

// Supprimer un média
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.media.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
