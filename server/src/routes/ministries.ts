import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Liste publique
router.get('/', async (_req, res) => {
  const ministries = await prisma.ministry.findMany({
    include: { directors: true },
    orderBy: { name: 'asc' },
  });
  res.json(ministries);
});

// Créer un ministère (admin)
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, budget, description } = req.body;
  const ministry = await prisma.ministry.create({ data: { name, budget, description } });
  res.json(ministry);
});

// Modifier un ministère (admin)
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, budget, description } = req.body;
  const ministry = await prisma.ministry.update({
    where: { id: req.params.id },
    data: { name, budget, description },
  });
  res.json(ministry);
});

// Supprimer un ministère (admin)
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.ministry.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Ajouter un directeur à un ministère (admin)
router.post('/:id/directors', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, title, email, phone } = req.body;
  const director = await prisma.director.create({
    data: { name, title, email, phone, ministryId: req.params.id },
  });
  res.json(director);
});

// Modifier un directeur (admin)
router.put('/directors/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, title, email, phone } = req.body;
  const director = await prisma.director.update({
    where: { id: req.params.id },
    data: { name, title, email, phone },
  });
  res.json(director);
});

// Supprimer un directeur (admin)
router.delete('/directors/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.director.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
