import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET – toutes les unités (avec leurs postes et les infos du membre assigné)
router.get('/', async (req: Request, res: Response) => {
  try {
    const units = await prisma.organizationUnit.findMany({
      include: {
        positions: {
          include: {
            member: true,   // cela permet d'afficher le membre assigné
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(units);
  } catch (error) {
    console.error('Erreur GET /api/organization:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST – créer une unité
router.post('/', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { name, type, parentId } = req.body;
  const unit = await prisma.organizationUnit.create({ data: { name, type, parentId } });
  res.json(unit);
});

// PUT – modifier une unité
router.put('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { name, type } = req.body;
  const unit = await prisma.organizationUnit.update({
    where: { id: req.params.id },
    data: { name, type }
  });
  res.json(unit);
});

// DELETE – supprimer une unité
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  await prisma.organizationUnit.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ----- Gestion des postes -----

// POST – créer un poste dans une unité
router.post('/:id/positions', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { title, memberId } = req.body;
  const position = await prisma.organizationPosition.create({
    data: { title, memberId, unitId: req.params.id }
  });
  res.json(position);
});

// PUT – modifier un poste
router.put('/positions/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { title, memberId } = req.body;
  const position = await prisma.organizationPosition.update({
    where: { id: req.params.id },
    data: { title, memberId }
  });
  res.json(position);
});

// DELETE – supprimer un poste
router.delete('/positions/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  await prisma.organizationPosition.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
