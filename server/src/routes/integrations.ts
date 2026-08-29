import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Récupérer toutes les intégrations (admin)
router.get('/', requireRole('ADMIN'), async (_req, res) => {
  const integrations = await prisma.integration.findMany();
  const map: Record<string, string> = {};
  integrations.forEach(i => { map[i.key] = i.value; });
  res.json(map);
});

// Sauvegarder plusieurs intégrations à la fois
router.put('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const data = req.body; // { waveNumber: '...', orangeMoneyNumber: '...', ... }
  for (const [key, value] of Object.entries(data)) {
    await prisma.integration.upsert({
      where: { key },
      update: { value: value as string },
      create: { key, value: value as string },
    });
  }
  res.json({ ok: true });
});

export default router;
