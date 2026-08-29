import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Lister toutes les pages idéologiques
router.get('/', requireRole('ADMIN'), async (_req, res) => {
  const pages = await prisma.ideologyPage.findMany();
  res.json(pages);
});

// Mettre à jour une page
router.put('/:slug', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { title, content } = req.body;
  const page = await prisma.ideologyPage.upsert({
    where: { slug: req.params.slug },
    update: { title, content },
    create: { slug: req.params.slug, title, content },
  });
  res.json(page);
});

export default router;
