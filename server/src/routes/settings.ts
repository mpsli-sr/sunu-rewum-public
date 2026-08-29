import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Récupérer les paramètres de l'utilisateur connecté
router.get('/', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
    let settings = await prisma.userSettings.findUnique({ where: { userId: decoded.userId } });
    if (!settings) {
      // Créer des paramètres par défaut
      settings = await prisma.userSettings.create({
        data: { userId: decoded.userId },
      });
    }
    res.json(settings);
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Mettre à jour les paramètres
router.put('/', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
    const { notifications, darkMode, language } = req.body;
    const settings = await prisma.userSettings.upsert({
      where: { userId: decoded.userId },
      update: { notifications, darkMode, language },
      create: { userId: decoded.userId, notifications, darkMode, language },
    });
    res.json(settings);
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
});

export default router;
