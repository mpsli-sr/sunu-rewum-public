import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET – tous les ministères (avec leurs directeurs)
router.get('/', async (_req, res) => {
  try {
    const ministries = await prisma.ministry.findMany({
      include: { directors: true },
      orderBy: { name: 'asc' }
    });
    res.json(ministries);
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
});

// POST – créer un ministère
router.post('/', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { name, budget, description } = req.body;
  const ministry = await prisma.ministry.create({ data: { name, budget, description } });
  res.json(ministry);
});

// PUT – modifier un ministère
router.put('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { name, budget, description } = req.body;
  const ministry = await prisma.ministry.update({
    where: { id: req.params.id },
    data: { name, budget, description }
  });
  res.json(ministry);
});

// DELETE – supprimer un ministère
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  await prisma.ministry.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ----- Gestion des directeurs -----

// POST – ajouter un directeur à un ministère
router.post('/:id/directors', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { name, title } = req.body;
  const director = await prisma.director.create({
    data: { name, title, ministryId: req.params.id }
  });
  res.json(director);
});

// PUT – modifier un directeur
router.put('/directors/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { name, title } = req.body;
  const director = await prisma.director.update({
    where: { id: req.params.id },
    data: { name, title }
  });
  res.json(director);
});

// DELETE – supprimer un directeur
router.delete('/directors/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  await prisma.director.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
