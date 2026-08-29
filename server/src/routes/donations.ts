import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { addXP } from '../services/gamification';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  const { userId, amount } = req.body;
  // Enregistrer le don dans la table Transaction (optionnel)
  await prisma.transaction.create({
    data: {
      userId,
      amountEur: amount,
      amountFcfp: amount * 655, // conversion arbitraire
      mode: 'WAVE',
      type: 'DONATION',
      status: 'COMPLETED',
    },
  });
  await addXP(userId, 'DONATION');
  res.json({ success: true });
});

export default router;
