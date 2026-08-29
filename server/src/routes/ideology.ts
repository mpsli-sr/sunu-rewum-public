import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Récupérer une page par son slug
router.get('/:slug', async (req: Request, res: Response) => {
  const page = await prisma.ideologyPage.findUnique({ where: { slug: req.params.slug } });
  if (!page) return res.status(404).json({ message: 'Page introuvable' });
  res.json(page);
});

// Mettre à jour ou créer une page (admin)
router.put('/:slug', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { title, content } = req.body;
  const page = await prisma.ideologyPage.upsert({
    where: { slug: req.params.slug },
    update: { title, content },
    create: { slug: req.params.slug, title, content },
  });
  res.json(page);
});

export default router;
