import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || q.length < 2) return res.json([]);

  const query = q.toLowerCase();

  // Rechercher dans les articles
  const articles = await prisma.pressRelease.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { summary: { contains: query } },
        { content: { contains: query } },
      ],
      isPublished: true,
    },
    select: { title: true, summary: true },
    take: 3,
  });

  // Rechercher dans les événements
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    select: { title: true, description: true },
    take: 3,
  });

  // Rechercher dans les propositions
  const proposals = await prisma.citizenProposal.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    select: { title: true, description: true },
    take: 3,
  });

  // Rechercher des membres
  const members = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { email: { contains: query } },
      ],
    },
    select: { id: true, firstName: true, lastName: true },
    take: 3,
  });

  const results = [
    ...articles.map(a => ({ type: 'Article', title: a.title, subtitle: a.summary?.substring(0, 80), href: '/media' })),
    ...events.map(e => ({ type: 'Événement', title: e.title, subtitle: e.description?.substring(0, 80), href: '/events' })),
    ...proposals.map(p => ({ type: 'Proposition', title: p.title, subtitle: p.description?.substring(0, 80), href: '/proposals' })),
    ...members.map(m => ({ type: 'Membre', title: `${m.firstName} ${m.lastName}`, subtitle: '', href: `/profile` })),
  ];

  res.json(results);
});

export default router;
