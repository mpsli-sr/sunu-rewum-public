import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getIO } from '../socket';

const router = Router();
const prisma = new PrismaClient();

async function getOrCreateConversation(user1: string, user2: string) {
  let conv = await prisma.conversation.findFirst({
    where: { isGroup: false, participants: { every: { id: { in: [user1, user2] } } } },
  });
  if (!conv) {
    conv = await prisma.conversation.create({
      data: { participants: { connect: [{ id: user1 }, { id: user2 }] } },
    });
  }
  return conv;
}

router.get('/:userId/:otherId', async (req: Request, res: Response) => {
  // (inchangé)
});

router.post('/', async (req: Request, res: Response) => {
  const { content, senderId, receiverId } = req.body;
  const conv = await getOrCreateConversation(senderId, receiverId);
  const msg = await prisma.message.create({
    data: { content, senderId, receiverId, conversationId: conv.id },
  });
  // Émettre la notification au destinataire
  try {
    getIO().to(receiverId).emit("new_message", {
      senderId,
      content,
      id: msg.id,
      createdAt: msg.createdAt,
    });
  } catch (e) {}
  res.json(msg);
});

export default router;
