import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// S'abonner
router.post('/subscribe', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requis' });

  const exists = await prisma.newsletter.findUnique({ where: { email } });
  if (exists && exists.confirmed) return res.status(400).json({ message: 'Déjà abonné' });

  const token = crypto.randomBytes(32).toString('hex');
  if (exists) {
    // Mise à jour du token si l'ancien n'était pas confirmé
    await prisma.newsletter.update({ where: { email }, data: { token } });
  } else {
    await prisma.newsletter.create({ data: { email, token } });
  }

  const confirmLink = `http://localhost:3001/api/newsletter/confirm/${token}`;
  console.log(`📬 Newsletter - confirmer l'abonnement de ${email} : ${confirmLink}`);

  // En production, on enverrait un vrai email. Ici on retourne le lien pour test.
  res.json({ message: 'Vérifiez vos emails pour confirmer (lien dans la console).', link: confirmLink });
});

// Confirmer l'abonnement
router.get('/confirm/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  const sub = await prisma.newsletter.findFirst({ where: { token } });
  if (!sub) return res.status(400).json({ message: 'Token invalide' });

  await prisma.newsletter.update({
    where: { id: sub.id },
    data: { confirmed: true, token: null },
  });

  res.json({ message: 'Abonnement confirmé !' });
});

// Se désabonner
router.post('/unsubscribe', async (req: Request, res: Response) => {
  const { email } = req.body;
  await prisma.newsletter.deleteMany({ where: { email } });
  res.json({ message: 'Désabonné avec succès' });
});

// Nombre d'abonnés (public)
router.get('/count', async (_req, res) => {
  const count = await prisma.newsletter.count({ where: { confirmed: true } });
  res.json({ count });
});

export default router;
