import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public : rubriques actives
router.get('/', async (_req, res) => {
  const rubriques = await prisma.rubrique.findMany({
    where: { actif: true },
    orderBy: [{ parentId: 'asc' }, { ordre: 'asc' }],
  });
  res.json(rubriques);
});

// Admin : toutes (y compris inactives)
router.get('/all', requireRole('ADMIN', 'COORDINATOR'), async (_req, res) => {
  const rubriques = await prisma.rubrique.findMany({
    orderBy: [{ parentId: 'asc' }, { ordre: 'asc' }],
    include: { _count: { select: { enfants: true } } },
  });
  res.json(rubriques);
});

// Création
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { slug, titre, description, icon, couleur, ordre, actif, parentId } = req.body;
  if (!slug || !titre) return res.status(400).json({ message: 'slug et titre requis' });
  try {
    const rubrique = await prisma.rubrique.create({
      data: {
        slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
        titre,
        description,
        icon,
        couleur,
        ordre: ordre ?? 0,
        actif: actif ?? true,
        parentId: parentId ?? null,
      },
    });
    res.status(201).json(rubrique);
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(409).json({ message: 'Slug déjà utilisé' });
    throw e;
  }
});

// Réorganisation
router.put('/reorder', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const items: { id: string; ordre: number; parentId?: string | null }[] = req.body.items;
  await prisma.$transaction(items.map((it) =>
    prisma.rubrique.update({
      where: { id: it.id },
      data: { ordre: it.ordre, parentId: it.parentId ?? null },
    })
  ));
  res.json({ ok: true });
});

// Mise à jour
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { slug, titre, description, icon, couleur, ordre, actif, parentId } = req.body;
  const rubrique = await prisma.rubrique.update({
    where: { id: req.params.id },
    data: { slug, titre, description, icon, couleur, ordre, actif, parentId },
  });
  res.json(rubrique);
});

// Suppression
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  await prisma.rubrique.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
