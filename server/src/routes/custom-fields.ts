import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Admin : lister tous les champs
router.get('/', requireRole('ADMIN'), async (_req, res) => {
  const fields = await prisma.customField.findMany({ orderBy: { order: 'asc' } });
  res.json(fields);
});

// Admin : créer un champ
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, label, fieldType, options, required, visibleAtRegistration, order } = req.body;
  if (!name || !label || !fieldType) return res.status(400).json({ message: 'Champs obligatoires manquants' });
  const field = await prisma.customField.create({
    data: { name, label, fieldType, options, required, visibleAtRegistration, order },
  });
  res.json(field);
});

// Admin : modifier un champ
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { label, fieldType, options, required, visibleAtRegistration, order, enabled } = req.body;
  const field = await prisma.customField.update({
    where: { id: req.params.id },
    data: { label, fieldType, options, required, visibleAtRegistration, order, enabled },
  });
  res.json(field);
});

// Admin : supprimer un champ
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.customField.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
