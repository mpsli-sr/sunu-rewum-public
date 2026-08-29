import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendMail } from '../services/mailer';
import { JWT_ACCESS_SECRET } from '../config';

const router = Router();
const prisma = new PrismaClient();

router.get('/count', async (_req, res) => {
  const count = await prisma.charterSignature.count({ where: { verified: true } });
  res.json({ count });
});

router.post('/init', async (req: Request, res: Response) => {
  // ... inchangé (enregistrement des infos)
});

router.post('/verify', async (req: Request, res: Response) => {
  // ... vérification du code
  // Après validation, envoyer un email de confirmation
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (user && user.email) {
      await sendMail(user.email, 'Signature de la charte confirmée',
        '<p>Votre signature de la charte SUNU REWUM a bien été enregistrée. Merci pour votre engagement.</p>'
      ).catch(() => {});
    }
    res.json({ message: '✅ Signature validée !' });
  } catch (err) {
    res.status(401).json({ message: 'Erreur' });
  }
});

export default router;
