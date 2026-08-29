import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  const { actions, userId } = req.body; // actions: { education: number, health: number, ... }
  // Calcul simplifié : un score basé sur la somme des budgets
  const total = Object.values(actions as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
  const optimizedBudget = total * 0.9; // simulation
  const scenario = await prisma.simulatorScenario.create({
    data: {
      name: `Simulation ${new Date().toLocaleDateString()}`,
      actions: JSON.stringify(actions),
      optimizedBudget,
      userId,
    },
  });
  res.json(scenario);
});

router.get('/', async (req: Request, res: Response) => {
  const scenarios = await prisma.simulatorScenario.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  res.json(scenarios);
});
export default router;
