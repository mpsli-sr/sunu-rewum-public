import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Récupérer le menu (public)
router.get('/', async (_req, res) => {
  const items = await prisma.menuItem.findMany({ orderBy: { order: 'asc' } });
  res.json(items);
});

// Mettre à jour ou créer un item (admin)
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { label, href, icon, parentId, order, roles, enabled } = req.body;
  const item = await prisma.menuItem.create({
    data: { label, href, icon, parentId, order, roles, enabled },
  });
  res.json(item);
});

router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { label, href, icon, parentId, order, roles, enabled } = req.body;
  const item = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: { label, href, icon, parentId, order, roles, enabled },
  });
  res.json(item);
});

router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.menuItem.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
