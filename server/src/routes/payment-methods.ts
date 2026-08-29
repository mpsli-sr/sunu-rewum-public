import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try {
    const methods = await prisma.paymentMethod.findMany({ orderBy: { name: 'asc' } });
    res.json(methods);
  } catch {
    res.json([]);
  }
});

router.get('/admin', requireRole('ADMIN', 'COORDINATOR'), async (_req, res) => {
  try {
    const methods = await prisma.paymentMethod.findMany({ orderBy: { name: 'asc' } });
    res.json(methods);
  } catch {
    res.json([]);
  }
});

router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, icon, enabled, fields, instructions, recipientPhone } = req.body;
  try {
    const method = await prisma.paymentMethod.create({
      data: {
        name,
        icon: icon || '💳',
        enabled: enabled !== false,
        fields: fields || null,
        instructions: instructions || null,
        recipientPhone: recipientPhone || null,
      },
    });
    res.json(method);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erreur' });
  }
});

router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, icon, enabled, fields, instructions, recipientPhone } = req.body;
  try {
    const method = await prisma.paymentMethod.update({
      where: { id: req.params.id },
      data: {
        name,
        icon,
        enabled,
        fields,
        instructions,
        recipientPhone,
      },
    });
    res.json(method);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Erreur' });
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.paymentMethod.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur suppression' });
  }
});

export default router;
