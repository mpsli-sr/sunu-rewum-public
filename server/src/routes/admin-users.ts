import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Créer un compte (admin) – inchangé, mais force le mot de passe
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role } = req.body;
  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role, verified: true },
  });
  const { passwordHash: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Mettre à jour un utilisateur (admin) – accepte un nouveau mot de passe optionnel
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, email, country, region, departement, commune, adresse, phone, cni, carteElecteur, password } = req.body;
  const data: any = { firstName, lastName, email, country, region, departement, commune, adresse, phone, cni, carteElecteur };
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, firstName: true, lastName: true, country: true, region: true, role: true },
  });
  res.json(user);
});

export default router;
