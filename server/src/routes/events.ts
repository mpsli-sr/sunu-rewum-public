import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';
import { addXP } from '../services/gamification';
import { getIO } from '../socket';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(events);
  } catch (error) {
    console.error('❌ Erreur GET /api/events:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/', requireRole('ADMIN', 'COORDINATOR'), async (req, res) => {
  const { title, description, date, type, creatorId } = req.body;
  const event = await prisma.event.create({ data: { title, description, date: new Date(date), type, creatorId } });
  await addXP(creatorId, 'CREATE_EVENT');
  // Notifier tous les utilisateurs connectés
  try {
    getIO().emit("new_event", { title, description, date });
  } catch (e) {}
  res.json(event);
});

router.patch('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, type, location, locationUrl, maxParticipants } = req.body;
    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(type !== undefined && { type }),
        ...(location !== undefined && { location }),
        ...(locationUrl !== undefined && { locationUrl }),
        ...(maxParticipants !== undefined && { maxParticipants }),
      },
    });
    res.json(event);
  } catch (error) {
    console.error('❌ Erreur PATCH /api/events:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur DELETE /api/events:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
