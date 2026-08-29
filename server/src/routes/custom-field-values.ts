import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET } from '../config';

const router = Router();
const prisma = new PrismaClient();

// Récupérer les valeurs pour l'utilisateur connecté
router.get('/me', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET);
    const values = await prisma.customFieldValue.findMany({
      where: { userId: decoded.userId },
      include: { field: true },
    });
    res.json(values);
  } catch { res.status(401).json({ message: 'Token invalide' }); }
});

// Sauvegarder ou mettre à jour une valeur pour un champ
router.put('/:fieldId', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET);
    const { value } = req.body;
    const fieldId = req.params.fieldId;
    // Vérifier que le champ existe et est actif
    const field = await prisma.customField.findUnique({ where: { id: fieldId } });
    if (!field || !field.enabled) return res.status(400).json({ message: 'Champ invalide' });
    // Upsert
    const existing = await prisma.customFieldValue.findUnique({
      where: { userId_fieldId: { userId: decoded.userId, fieldId } },
    });
    if (existing) {
      const updated = await prisma.customFieldValue.update({
        where: { id: existing.id },
        data: { value },
      });
      res.json(updated);
    } else {
      const created = await prisma.customFieldValue.create({
        data: { userId: decoded.userId, fieldId, value },
      });
      res.json(created);
    }
  } catch { res.status(401).json({ message: 'Token invalide' }); }
});

export default router;
