import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Modifier le rôle d'un utilisateur (admin) – mais on bloque le passage en ADMIN
router.put('/user/:id/role', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { role } = req.body;
  if (role === 'ADMIN') {
    return res.status(403).json({ message: 'Il ne peut y avoir qu\'un seul ADMIN. Contactez le support.' });
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
  res.json(user);
});

// Supprimer un utilisateur (admin) – interdit de supprimer l'admin principal
router.delete('/user/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (user && user.email === 'mpsli_adm@proton.me') {
    return res.status(403).json({ message: 'Impossible de supprimer le compte administrateur principal.' });
  }
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ... (reste existant : proposal status)
export default router;
