import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const propositions = await prisma.citizenProposal.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(propositions);
});

export default router;
