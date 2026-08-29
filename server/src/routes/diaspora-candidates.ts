import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Récupérer tous les candidats avec leurs votes
router.get('/', async (_req, res) => {
  try {
    const candidates = await prisma.diasporaCandidate.findMany({
      include: { votes: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération candidats' });
  }
});

// Ajouter un candidat (admin/coordinateur)
router.post('/', async (req: Request, res: Response) => {
  const { firstName, lastName, email, phone, country, city, profession, sector, motivation, theme, bio, userId } = req.body;
  try {
    const candidate = await prisma.diasporaCandidate.create({
      data: {
        firstName: firstName || 'Prénom',
        lastName: lastName || 'Nom',
        email: email || 'candidat@example.com',
        phone,
        country,
        city,
        profession,
        sector,
        motivation,
        theme,
        bio,
        userId,
      },
    });
    res.status(201).json(candidate);
  } catch (error) {
    console.error('Erreur création candidat:', error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// Voter pour un candidat
router.post('/vote', async (req: Request, res: Response) => {
  const { candidateId, userId } = req.body;
  try {
    const existing = await prisma.diasporaVote.findUnique({
      where: { userId_candidateId: { userId, candidateId } },
    });
    if (existing) {
      await prisma.diasporaVote.delete({ where: { id: existing.id } });
    } else {
      await prisma.diasporaVote.create({ data: { userId, candidateId } });
    }
    const candidate = await prisma.diasporaCandidate.findUnique({
      where: { id: candidateId },
      include: { votes: true },
    });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du vote' });
  }
});

// PUT : changer le statut
router.put('/:id/status', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await prisma.diasporaCandidate.update({ where: { id }, data: { status } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur statut' });
  }
});

// PATCH : modifier un candidat
router.patch('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  try {
    const updated = await prisma.diasporaCandidate.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur modification' });
  }
});

// DELETE : supprimer un candidat
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req: Request, res: Response) => {
  try {
    await prisma.diasporaCandidate.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

export default router;
