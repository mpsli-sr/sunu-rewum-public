import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/:page', async (req: Request, res: Response) => {
  const blocks = await prisma.contentBlock.findMany({ where: { page: req.params.page, status: 'published' }, orderBy: { order: 'asc' } });
  res.json(blocks);
});

router.get('/', requireRole('ADMIN', 'COORDINATOR'), async (_req, res) => {
  const blocks = await prisma.contentBlock.findMany({ orderBy: [{ page: 'asc' }, { order: 'asc' }], include: { author: { select: { firstName: true, lastName: true } } } });
  res.json(blocks);
});

router.post('/', requireRole('MEMBER', 'COORDINATOR', 'ADMIN'), async (req: Request, res: Response) => {
  const { page, title, content, imageUrl, linkUrl, order } = req.body;
  const user = (req as any).user;
  const canPublish = ['ADMIN', 'COORDINATOR'].includes(user.role);
  const block = await prisma.contentBlock.create({
    data: { page, title, content, imageUrl, linkUrl, order: order || 0, status: canPublish ? 'published' : 'draft', authorId: user.id },
  });
  res.json(block);
});

router.put('/:id', requireRole('MEMBER', 'COORDINATOR', 'ADMIN'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const existing = await prisma.contentBlock.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Bloc introuvable' });
  const isAdmin = ['ADMIN', 'COORDINATOR'].includes(user.role);
  const isOwnDraft = existing.authorId === user.id && existing.status === 'draft';
  if (!isAdmin && !isOwnDraft) return res.status(403).json({ message: 'Non autorisé' });
  const { title, content, imageUrl, linkUrl, order } = req.body;
  const data: any = { title, content, imageUrl, linkUrl, order };
  if (req.body.status && isAdmin) data.status = req.body.status;
  const block = await prisma.contentBlock.update({ where: { id: req.params.id }, data });
  res.json(block);
});

router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  await prisma.contentBlock.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.patch('/:id/status', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['draft', 'published', 'rejected'].includes(status)) return res.status(400).json({ message: 'Statut invalide' });
  const block = await prisma.contentBlock.update({ where: { id: req.params.id }, data: { status, validatedById: (req as any).user.id, validatedAt: new Date() } });
  res.json(block);
});

export default router;
