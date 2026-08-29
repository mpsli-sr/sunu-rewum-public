import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Définition des actions et points
export const XP_REWARDS: Record<string, number> = {
  CREATE_POST: 10,
  CREATE_EVENT: 30,
  DONATION: 20,
  VOTE: 5,
  COMMENT: 5,
};

// Vérifier et attribuer les badges
export async function addXP(userId: string, action: string) {
  const points = XP_REWARDS[action] || 0;
  if (points === 0) return;

  // Mettre à jour l'XP et le niveau
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: points },
      // Niveau basé sur l'XP total (formule simple)
      level: { increment: 0 }, // sera recalculé
    },
  });

  // Recalculer le niveau
  const newLevel = Math.floor(Math.sqrt(user.xp + points) / 2) + 1;
  await prisma.user.update({
    where: { id: userId },
    data: { level: newLevel },
  });

  // Vérifier tous les badges non encore possédés
  const allBadges = await prisma.badge.findMany();
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  });
  const possessedIds = userBadges.map((ub) => ub.badgeId);

  for (const badge of allBadges) {
    if (!possessedIds.includes(badge.id) && (user.xp + points) >= badge.requiredXp) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      console.log(`🏆 Badge "${badge.name}" attribué à ${user.email}`);
    }
  }
}
