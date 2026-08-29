import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Route publique : retourne les pages accessibles pour un rôle donné
router.get('/', async (req: Request, res: Response) => {
  const { role } = req.query;
  const pages = await prisma.siteVisibility.findMany();
  if (!role || typeof role !== 'string') {
    // Si aucun rôle n’est fourni, renvoyer toutes les pages (pour l’admin)
    return res.json(pages);
  }
  // Filtrer les pages dont le champ `roles` contient le rôle demandé
  const filtered = pages.filter(p => p.roles.split(',').map(r => r.trim()).includes(role));
  res.json(filtered);
});

// Route admin : mettre à jour la visibilité
router.put('/:page', async (req: Request, res: Response) => {
  // Idéalement protéger cette route, mais nous supposons qu'elle est déjà protégée par le middleware admin
  const { roles } = req.body;
  const page = await prisma.siteVisibility.upsert({
    where: { page: req.params.page },
    update: { roles },
    create: { page: req.params.page, roles },
  });
  res.json(page);
});

export default router;
