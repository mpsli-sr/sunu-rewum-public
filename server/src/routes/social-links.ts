import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();
router.get('/', async (_req, res) => {
  const links = await prisma.socialLink.findMany({ where: { enabled: true } });
  res.json(links);
});
export default router;
