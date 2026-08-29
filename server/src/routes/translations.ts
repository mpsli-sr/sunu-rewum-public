import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireRole('ADMIN', 'COORDINATOR'), async (_req, res) => {
  const translations = await prisma.translation.findMany({ orderBy: { key: 'asc' } });
  res.json(translations);
});

router.get('/:locale', async (req, res) => {
  const list = await prisma.translation.findMany({ where: { locale: req.params.locale } });
  const map: Record<string, string> = {};
  list.forEach(t => { map[t.key] = t.value; });
  res.json(map);
});

router.post('/', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { key, locale, value } = req.body;
  try {
    const t = await prisma.translation.upsert({
      where: { key_locale: { key, locale } },
      update: { value },
      create: { key, locale, value },
    });
    res.json(t);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  try {
    await prisma.translation.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

export default router;
