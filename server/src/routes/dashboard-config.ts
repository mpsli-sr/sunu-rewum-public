import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Récupérer la config pour les rôles donnés (public, avec paramètre ?role=...)
router.get('/', async (req: Request, res: Response) => {
  const role = (req.query.role as string) || 'VISITOR';
  const configs = await prisma.dashboardConfig.findMany({
    where: {
      roles: { contains: role },
      enabled: true,
    },
    orderBy: { order: 'asc' },
  });
  res.json(configs.map(c => c.widget));
});

// Admin : liste complète
router.get('/all', requireRole('ADMIN'), async (_req, res) => {
  const configs = await prisma.dashboardConfig.findMany({ orderBy: { order: 'asc' } });
  res.json(configs);
});

// Admin : créer une config
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { widget, enabled, order, roles } = req.body;
  const config = await prisma.dashboardConfig.create({
    data: { widget, enabled, order, roles },
  });
  res.json(config);
});

// Admin : mettre à jour
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { enabled, order, roles } = req.body;
  const config = await prisma.dashboardConfig.update({
    where: { id: req.params.id },
    data: { enabled, order, roles },
  });
  res.json(config);
});

// Admin : supprimer
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.dashboardConfig.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
