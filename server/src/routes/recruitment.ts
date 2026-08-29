import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(jobs);
});

router.post('/', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { title, description, department, location, remote } = req.body;
  const job = await prisma.job.create({ data: { title, description, department, location, remote } });
  res.json(job);
});

router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  await prisma.job.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
