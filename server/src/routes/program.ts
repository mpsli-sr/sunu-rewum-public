import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();

async function ensureSections() {
  // (inchangé)
}
ensureSections();

router.get('/sections', async (_req, res) => {
  const sections = await prisma.programSection.findMany({ orderBy: { order: 'asc' } });
  res.json(sections);
});

router.get('/', async (_req, res) => {
  const measures = await prisma.programMeasure.findMany({ include: { section: true } });
  res.json(measures);
});

router.post('/', async (req: Request, res: Response) => {
  const { description, sectionId, budgetEstimate, timeline } = req.body;
  const measure = await prisma.programMeasure.create({
    data: { description, sectionId, budgetEstimate, timeline },
    include: { section: true },
  });
  res.json(measure);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { description, budgetEstimate, timeline } = req.body;
  const measure = await prisma.programMeasure.update({
    where: { id: req.params.id },
    data: { description, budgetEstimate, timeline },
    include: { section: true },
  });
  res.json(measure);
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.programMeasure.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
