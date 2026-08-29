import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET toutes les pages (admin)
router.get('/', requireRole('ADMIN', 'COORDINATOR'), async (_req, res) => {
  const pages = await prisma.dynamicPage.findMany({ orderBy: { updatedAt: 'desc' } });
  res.json(pages);
});

// GET une page par slug (public)
router.get('/:slug', async (req: Request, res: Response) => {
  const page = await prisma.dynamicPage.findUnique({ where: { slug: req.params.slug } });
  if (!page || !page.isPublished) return res.status(404).json({ error: 'Page non trouvée' });
  res.json(page);
});

// POST créer une page (admin)
router.post('/', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { slug, title, content, isPublished } = req.body;
  try {
    const page = await prisma.dynamicPage.create({
      data: { slug, title, content: content || '', isPublished: isPublished || false },
    });
    res.status(201).json(page);
  } catch (e: any) {
    if (e.code === 'P2002') {
      res.status(409).json({ error: 'Ce slug existe déjà' });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// PUT modifier une page (admin)
router.put('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { slug, title, content, isPublished } = req.body;
  try {
    const updated = await prisma.dynamicPage.update({
      where: { id },
      data: { slug, title, content, isPublished },
    });
    res.json(updated);
  } catch (e: any) {
    if (e.code === 'P2002') {
      res.status(409).json({ error: 'Ce slug existe déjà' });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// DELETE supprimer une page (admin)
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.dynamicPage.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
