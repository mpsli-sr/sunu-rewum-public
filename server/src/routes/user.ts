import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Récupérer son propre profil complet
router.get('/me', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { settings: true },
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    // Ne pas renvoyer le hash du mot de passe
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch { res.status(401).json({ message: 'Token invalide' }); }
});

// Mettre à jour son profil (bio, image)
router.put('/me', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
    const { bio, profileImage, region } = req.body;
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { bio, profileImage, region },
    });
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch { res.status(500).json({ message: 'Erreur lors de la mise à jour' }); }
});

// Changer son mot de passe
router.put('/me/password', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: decoded.userId }, data: { passwordHash } });
    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch { res.status(500).json({ message: 'Erreur' }); }
});

export default router;
