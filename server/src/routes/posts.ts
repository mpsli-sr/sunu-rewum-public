import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { addXP } from '../services/gamification';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  const { archived } = req.query;
  const where: any = {};
  if (archived === 'true') where.archived = true;
  else if (archived === 'false') where.archived = false;
  const posts = await prisma.post.findMany({
    where,
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(posts);
});

router.post('/', async (req: Request, res: Response) => {
  const { content, userId } = req.body;
  const post = await prisma.post.create({
    data: { content, userId },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  await addXP(userId, 'CREATE_POST');
  res.json(post);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { content, archived } = req.body;
  const data: any = {};
  if (content !== undefined) data.content = content;
  if (archived !== undefined) data.archived = archived;
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data,
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  res.json(post);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
