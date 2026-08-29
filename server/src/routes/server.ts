import { Router } from 'express';
import settingsRoutes from './settings';   // Assurez-vous que ce fichier existe

const router = Router();

router.use('/settings', settingsRoutes);

export default router;
