import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET – toutes les candidatures (admin)
router.get('/', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { status } = req.query;
  const where: any = {};
  if (status) where.status = status;
  const candidates = await prisma.diasporaCandidate.findMany({ where, include: { user: true } });
  res.json(candidates);
});

// POST – créer une candidature (utilisateur connecté)
router.post('/', async (req: Request, res: Response) => {
  const { userId, firstName, lastName, email, phone, country, city, profession, sector, motivation } = req.body;
  try {
    const candidate = await prisma.diasporaCandidate.create({
  data: {
    userId,
    firstName,
    lastName,
    email,
    phone,
    country,
    city,
    profession,
    sector,
    motivation,
    theme: req.body.theme || 'Général',
    user: {
      connect: { id: userId },
    },
  },
});
    
return res.status(201).json(candidate);
  } catch (e) {
    res.status(500).json({ error: 'Erreur création' });
  }
});

// PATCH – modifier une candidature (admin)
router.patch('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await prisma.diasporaCandidate.update({ where: { id }, data });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erreur modification' });
  }
});

// DELETE – supprimer une candidature (admin)
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.diasporaCandidate.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

// PUT – changer le statut (admin)
router.put('/:id/status', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.diasporaCandidate.update({ where: { id }, data: { status } });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Erreur statut' });
  }
});

// PUT : modifier une intention
router.put('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  try {
    const updated = await prisma.diasporaIntent.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur modification' });
  }
});

// DELETE : supprimer une intention
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  try {
    await prisma.diasporaIntent.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

export default router;
