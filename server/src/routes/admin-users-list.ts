import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Retourne la liste des utilisateurs avec nom, prénom, région (accessible aux membres connectés)
router.get('/', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      region: true,
      email: true,
    },
    orderBy: { lastName: 'asc' },
  });
  res.json(users);
});

export default router;
