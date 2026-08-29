import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Récupérer tous les articles (publics ou non selon l'utilisateur)
router.get('/', async (req: Request, res: Response) => {
  const { published } = req.query;
  const where: any = {};
  if (published === 'true') where.isPublished = true;
  const articles = await prisma.pressRelease.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json(articles);
});

// Récupérer un article par son ID
router.get('/:id', async (req: Request, res: Response) => {
  const article = await prisma.pressRelease.findUnique({ where: { id: req.params.id } });
  if (!article) return res.status(404).json({ message: 'Article non trouvé' });
  res.json(article);
});

// Créer un article (admin ou coordinateur)
router.post('/', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { title, summary, content, isPublished, authorId } = req.body;
  const article = await prisma.pressRelease.create({
    data: {
      title,
      summary,
      content,
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
      authorId,
    },
  });
  res.json(article);
});

// Mettre à jour un article (admin ou coordinateur)
router.put('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { title, summary, content, isPublished } = req.body;
  const data: any = { title, summary, content };
  if (typeof isPublished === 'boolean') {
    data.isPublished = isPublished;
    data.publishedAt = isPublished ? new Date() : null;
  }
  const article = await prisma.pressRelease.update({
    where: { id: req.params.id },
    data,
  });
  res.json(article);
});

// Supprimer un article (admin ou coordinateur)
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  await prisma.pressRelease.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
