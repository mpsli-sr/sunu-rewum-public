import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(media);
});

router.post('/', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { title, url, type, authorId } = req.body;
  const media = await prisma.media.create({ data: { title, url, type, authorId } });
  res.json(media);
});

router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  await prisma.media.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
