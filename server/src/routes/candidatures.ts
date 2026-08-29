import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { requireRole } from '../middleware/auth';
import { JWT_ACCESS_SECRET } from '../config';

const router = Router();
const prisma = new PrismaClient();

// Récupérer ses propres candidatures (membre)
router.get('/me', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET);
    const candidatures = await prisma.candidature.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(candidatures);
  } catch { res.status(401).json({ message: 'Token invalide' }); }
});

// Soumettre une candidature (membre)
router.post('/', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET);
    const { poste, zone, motivation } = req.body;
    if (!poste || !motivation) return res.status(400).json({ message: 'Poste et motivation requis' });
    const existing = await prisma.candidature.findFirst({
      where: { userId: decoded.userId, poste, zone, status: 'PENDING' },
    });
    if (existing) return res.status(400).json({ message: 'Vous avez déjà une candidature en cours pour ce poste' });
    const cand = await prisma.candidature.create({
      data: {
        userId: decoded.userId,
        poste,
        zone: zone || null,
        motivation,
      },
    });
    res.json(cand);
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
});

// Admin : lister toutes les candidatures
router.get('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { status, poste, zone } = req.query;
  const where: any = {};
  if (status) where.status = status as string;
  if (poste) where.poste = poste as string;
  if (zone) where.zone = zone as string;
  const candidatures = await prisma.candidature.findMany({
    where,
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(candidatures);
});

// Admin : changer le statut
router.patch('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ message: 'Statut invalide' });
  const cand = await prisma.candidature.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(cand);
});

export default router;
