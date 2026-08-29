import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET : menu visible pour le rôle de l'utilisateur (ou tout si admin)
router.get('/', async (req: any, res: Response) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { parentId: null, isVisible: true },
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST : créer un élément (admin)
router.post('/', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { label, icon, href, parentId, order, roles } = req.body;
  try {
    const item = await prisma.menuItem.create({
      data: { label, icon, href, parentId: parentId || null, order: order || 0, roles: roles || 'ADMIN,COORDINATOR,MEMBER,VISITOR' },
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Erreur création' });
  }
});

// PATCH : modifier un élément (admin)
router.patch('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await prisma.menuItem.update({ where: { id }, data: req.body });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur modification' });
  }
});

// DELETE : supprimer un élément (admin)
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.menuItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

export default router;
