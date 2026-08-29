import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendMail } from '../services/mailer';

const router = Router();
const prisma = new PrismaClient();

router.post('/send', async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  if (user.verified) return res.status(400).json({ message: 'Déjà vérifié' });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken: token, verificationExpires: expires },
  });

  const verificationLink = `http://localhost:3001/api/verify/confirm/${token}`;
  
  // Envoyer le vrai email
  try {
    await sendMail(email, 'Vérification de votre compte SUNU REWUM',
      `<p>Cliquez <a href="${verificationLink}">ici</a> pour vérifier votre compte.</p>`
    );
    res.json({ message: 'Email de vérification envoyé.' });
  } catch (error) {
    // Fallback : afficher le lien dans la console si l'envoi échoue
    console.log('Lien de vérification (fallback) : ' + verificationLink);
    res.json({ message: 'Lien de vérification affiché dans la console (SMTP non configuré).', link: verificationLink });
  }
});

router.get('/confirm/:token', async (req: Request, res: Response) => {
  const { token } = req.params;
  const user = await prisma.user.findFirst({
    where: { verificationToken: token, verificationExpires: { gte: new Date() } },
  });
  if (!user) return res.status(400).json({ message: 'Token invalide ou expiré' });
  await prisma.user.update({
    where: { id: user.id },
    data: { verified: true, verificationToken: null, verificationExpires: null },
  });
  res.json({ message: 'Email vérifié avec succès !' });
});

export default router;
