import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET – liste pour admin/coordinateur
router.get('/', requireRole('ADMIN', 'COORDINATOR'), async (_req, res) => {
  const list = await prisma.sponsorship.findMany({ include: { user: true } });
  res.json(list);
});

// POST – création par un utilisateur connecté
router.post('/', async (req: Request, res: Response) => {
  const {
    userId,
    cniNumber,
    voterCardNumber,
    signatureData,
    honorDeclaration,
    charterSigned,
    firstName,
    lastName,
    email,
    phone,
    address,
    engagementLetter,
  } = req.body;

  try {
    const sp = await prisma.sponsorship.create({
      data: {
        userId,
        cniNumber,
        voterCardNumber,
        signatureData,
        honorDeclaration,
        charterSigned,
        firstName,
        lastName,
        email,
        phone,
        address,
        engagementLetter,
        region: req.body.region || '',
        user: { connect: { id: userId } },
      },
    });
    res.status(201).json(sp);
  } catch (e: any) {
    if (e.code === 'P2002') {
      res.status(409).json({ error: 'Ce parrainage existe déjà' });
    } else {
      console.error('Erreur création parrainage:', e);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

export default router;
