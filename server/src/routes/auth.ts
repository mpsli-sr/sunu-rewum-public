import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET } from '../config';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Email invalide' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Mot de passe trop court (8 caractères min.)' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(400).json({ message: 'Email déjà utilisé' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: firstName || 'Membre',
      lastName: lastName || '',
      role: 'MEMBER',
      verified: false,
      verificationToken,
    },
  });

  const verifyUrl = `${process.env.FRONT_URL ?? 'https://sunu-rewum.vercel.app'}/verify?token=${verificationToken}`;
  console.log(`[DEV] Lien de vérification pour ${email}: ${verifyUrl}`);
  // En production : envoyer un email via un service (Resend, SendGrid...)

  return res.status(201).json({ message: 'Compte créé. Vérifiez votre email.' });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Identifiants incorrects' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Identifiants incorrects' });
  if (!user.verified) return res.status(403).json({ message: 'Veuillez vérifier votre email avant de vous connecter.' });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_ACCESS_SECRET as string,
    { expiresIn: '7d' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    partitioned: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.json({
    message: 'Connecté',
    user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
  });
});

router.get('/me', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });

  try {
    const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET as string);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        xp: true,
        level: true,
        verified: true,
      },
    });

    if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });

    return res.json(user);
  } catch (err) {
    console.error('❌ Erreur dans /me:', (err as Error).message);
    return res.status(401).json({ message: 'Token invalide' });
  }
});

router.get('/verify', async (req: Request, res: Response) => {
  const { token } = req.query;
  if (typeof token !== 'string') return res.status(400).json({ message: 'Token manquant' });

  const user = await prisma.user.findUnique({ where: { verificationToken: token } });
  if (!user) return res.status(400).json({ message: 'Token invalide ou expiré' });

  await prisma.user.update({
    where: { id: user.id },
    data: { verified: true, verificationToken: null },
  });

  return res.json({ message: 'Email vérifié. Vous pouvez vous connecter.' });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'Déconnecté' });
});

export default router;
