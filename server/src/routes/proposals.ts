import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const proposals = await prisma.citizenProposal.findMany({ where: { status: 'APPROVED' }, include: { user: { select: { firstName: true, lastName: true } }, votes: true }, orderBy: { createdAt: 'desc' } });
  res.json(proposals);
});

router.get('/all', requireRole('ADMIN', 'COORDINATOR'), async (_req, res) => {
  const proposals = await prisma.citizenProposal.findMany({ include: { user: { select: { firstName: true, lastName: true } }, votes: true }, orderBy: { createdAt: 'desc' } });
  res.json(proposals);
});

router.post('/', requireRole('MEMBER', 'COORDINATOR', 'ADMIN'), async (req: Request, res: Response) => {
  const { title, description, theme } = req.body;
  const user = (req as any).user;
  const proposal = await prisma.citizenProposal.create({ data: { title, description, theme, userId: user.id, status: 'PENDING' }, include: { user: { select: { firstName: true } } } });
  res.json(proposal);
});

router.post('/vote', requireRole('MEMBER', 'COORDINATOR', 'ADMIN'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { proposalId } = req.body;

  if (!proposalId) return res.status(400).json({ message: 'proposalId requis' });

  const existing = await prisma.vote.findUnique({
    where: { userId_proposalId: { userId: user.id, proposalId } },
  });

  if (existing) {
    await prisma.vote.delete({ where: { id: existing.id } });
  } else {
    await prisma.vote.create({ data: { userId: user.id, proposalId } });
  }

  const proposal = await prisma.citizenProposal.findUnique({
    where: { id: proposalId },
    include: { votes: true },
  });
  res.json(proposal);
});

router.patch('/:id/status', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ message: 'Statut invalide' });
  const proposal = await prisma.citizenProposal.update({ where: { id: req.params.id }, data: { status } });
  res.json(proposal);
});

router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  await prisma.citizenProposal.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
