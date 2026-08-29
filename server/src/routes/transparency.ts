import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const totalDonations = await prisma.transaction.aggregate({
    _sum: { amountFcfp: true },
    where: { type: 'DONATION', status: 'COMPLETED' },
  });
  const totalExpenses = 0; // à implémenter avec une table Budget
  const reportsCount = await prisma.report.count();
  res.json({
    totalDonations: totalDonations._sum.amountFcfp || 0,
    totalExpenses,
    reportsCount,
  });
});

export default router;
