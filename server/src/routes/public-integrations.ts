import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Liste des clés publiques (non sensibles)
const PUBLIC_KEYS = [
  'whatsappNumber', 'telegramUsername', 'facebookUrl', 'xUrl', 'youtubeUrl', 'tiktokUrl',
  'acronymDefinition', 'contactEmail', 'contactPhone',
];

router.get('/', async (_req, res) => {
  try {
    const integrations = await prisma.integration.findMany();
    const result: Record<string, string> = {};
    for (const i of integrations) {
      if (PUBLIC_KEYS.includes(i.key)) {
        result[i.key] = i.value;
      }
    }
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
