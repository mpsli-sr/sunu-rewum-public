import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  // Membres par région (depuis la colonne User.region)
  const users = await prisma.user.findMany({ select: { region: true } });
  const membersByRegion: Record<string, number> = {};
  users.forEach(u => {
    if (u.region) {
      membersByRegion[u.region] = (membersByRegion[u.region] || 0) + 1;
    }
  });

  // Parrains par région (depuis Sponsorship)
  const sponsorships = await prisma.sponsorship.findMany({
    where: { verified: true },
    select: { region: true },
  });
  const sponsorsByRegion: Record<string, number> = {};
  sponsorships.forEach(s => {
    if (s.region) {
      sponsorsByRegion[s.region] = (sponsorsByRegion[s.region] || 0) + 1;
    }
  });

  // Combiner les données
  const regions = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Touba', 'Diourbel', 'Fatick', 'Louga', 'Tambacounda', 'Kolda', 'Matam', 'Sédhiou', 'Kaffrine', 'Kédougou'];
  const result = regions.map(region => ({
    region,
    members: membersByRegion[region] || 0,
    sponsors: sponsorsByRegion[region] || 0,
  }));

  res.json(result);
});

export default router;
