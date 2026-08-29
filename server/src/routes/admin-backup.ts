import { Router, Request, Response } from 'express';
import { requireRole } from '../middleware/auth';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const router = Router();

// Sauvegarde manuelle
router.post('/', requireRole('ADMIN'), (req: Request, res: Response) => {
  const dbPath = path.join(__dirname, '../../prisma/dev.db');
  const backupDir = path.join(__dirname, '../../backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(backupDir, `backup-${timestamp}.db`);
  fs.copyFileSync(dbPath, dest);
  res.json({ message: `Sauvegarde créée : ${dest}` });
});

// Activer/désactiver la sauvegarde automatique (simulé, le cron réel nécessite un service)
router.post('/auto', requireRole('ADMIN'), (req: Request, res: Response) => {
  const { enabled, intervalHours } = req.body;
  // Enregistrer dans un fichier de config ou variable d'environnement (ici on simule)
  console.log(`Sauvegarde automatique ${enabled ? 'activée' : 'désactivée'} toutes les ${intervalHours || 24}h`);
  res.json({ message: `Configuration de la sauvegarde automatique mise à jour (simulation)` });
});

export default router;
