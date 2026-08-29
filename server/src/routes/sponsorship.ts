import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Simuler l'envoi d'un code SMS (affiche dans la console)
function sendSMS(phone: string, code: string) {
  console.log(`📱 SMS envoyé au ${phone} : votre code de vérification est ${code}`);
}

// Vérifier la validité de la CNI (simulation : format 1 lettre suivie de 8 chiffres)
function isValidCNI(cni: string): boolean {
  return /^[A-Z]\d{8}$/.test(cni);
}

// Générer un code aléatoire à 6 chiffres
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Initier un parrainage (envoi code SMS)
router.post('/init', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
    const { cniNumber, region } = req.body;
    if (!cniNumber || !region) return res.status(400).json({ message: 'CNI et région requis' });
    if (!isValidCNI(cniNumber)) return res.status(400).json({ message: 'Format CNI invalide (ex: A12345678)' });

    // Vérifier l'unicité du parrainage par cet utilisateur avec cette CNI
    const existing = await prisma.sponsorship.findFirst({
      where: { userId: decoded.userId, cniNumber }
    });
    if (existing) return res.status(400).json({ message: 'Vous avez déjà parrainé avec cette CNI' });

    // Générer un code et l'associer temporairement (stocké dans un champ du modèle)
    const code = generateCode();
    // On pourrait créer une entrée temporaire, mais pour simplifier on va créer le parrainage non vérifié
    const sponsorship = await prisma.sponsorship.create({
      data: {
        userId: decoded.userId,
        cniNumber,
        region,
        smsCode: code,
        verified: false
      }
    });
    // Simuler l'envoi du SMS
    sendSMS('+221xxxxxx', code); // dans la vraie vie, on récupèrerait le téléphone de l'utilisateur
    res.json({ message: 'Code envoyé par SMS (simulation), vérifiez la console du serveur', sponsorshipId: sponsorship.id, code: code });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Vérifier le code SMS et valider le parrainage
router.post('/verify', async (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_secret');
    const { sponsorshipId, code } = req.body;
    const sponsorship = await prisma.sponsorship.findFirst({
      where: { id: sponsorshipId, userId: decoded.userId }
    });
    if (!sponsorship) return res.status(404).json({ message: 'Parrainage introuvable' });
    if (sponsorship.verified) return res.status(400).json({ message: 'Déjà vérifié' });
    if (sponsorship.smsCode !== code) return res.status(400).json({ message: 'Code incorrect' });

    await prisma.sponsorship.update({
      where: { id: sponsorshipId },
      data: { verified: true, smsCode: null }
    });
    res.json({ message: 'Parrainage validé avec succès !' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les statistiques régionales (membres, parrainages vérifiés)
router.get('/stats', async (_req, res) => {
  // Agrégation simple avec Prisma
  const sponsorships = await prisma.sponsorship.findMany({
    where: { verified: true },
    select: { region: true }
  });
  const stats: any = {};
  sponsorships.forEach(s => {
    stats[s.region] = (stats[s.region] || 0) + 1;
  });
  // Ajouter les membres (tous les utilisateurs) par région, mais on n'a pas l'info de région dans User. On va simuler.
  const regions = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Touba', 'Diourbel', 'Fatick', 'Louga', 'Tambacounda', 'Kolda', 'Matam', 'Sédhiou', 'Kaffrine', 'Kédougou'];
  const result = regions.map(r => ({
    region: r,
    parrains: stats[r] || 0,
    membres: Math.floor(Math.random() * 100) // simulation, car la région n'est pas stockée pour chaque utilisateur
  }));
  res.json(result);
});

export default router;
