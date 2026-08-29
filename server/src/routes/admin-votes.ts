import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req: any, res: any) => {
  const votes = await prisma.vote.findMany({
    include: { user: true },
  });
  return res.json(
    votes.map((v: any) => ({
      id: v.id,
      user: v.user ? `${v.user.firstName} ${v.user.lastName}`.trim() : 'Inconnu',
      target: v.candidateId || 'Inconnu',
      type: 'diaspora',
    }))
  );
});
export default router;
