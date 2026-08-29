import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Récupérer tous les rôles avec leurs permissions
router.get('/', requireRole('ADMIN'), async (_req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des rôles' });
  }
});

// Récupérer toutes les permissions disponibles
router.get('/permissions', requireRole('ADMIN'), async (_req, res) => {
  try {
    const permissions = await prisma.permission.findMany();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des permissions' });
  }
});

// Créer un rôle
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, description, permissionIds } = req.body;
  if (!name) return res.status(400).json({ message: 'Le nom du rôle est requis' });
  try {
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissionIds ? permissionIds.map((pid: string) => ({ permissionId: pid })) : [],
        },
      },
      include: { permissions: { include: { permission: true } } },
    });
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du rôle' });
  }
});

// Mettre à jour un rôle (permissions et nom)
router.put('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { name, description, permissionIds } = req.body;
  try {
    // Mise à jour du nom et description
    await prisma.role.update({
      where: { id: req.params.id },
      data: { name, description },
    });
    // Supprimer les anciennes associations de permissions
    await prisma.rolePermission.deleteMany({ where: { roleId: req.params.id } });
    // Créer les nouvelles
    if (permissionIds && permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((pid: string) => ({ roleId: req.params.id, permissionId: pid })),
      });
    }
    const role = await prisma.role.findUnique({
      where: { id: req.params.id },
      include: { permissions: { include: { permission: true } } },
    });
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
  }
});

// Supprimer un rôle
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.role.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du rôle' });
  }
});

// Assigner un rôle à un utilisateur
router.post('/assign', requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { userId, roleName } = req.body;
  if (!userId || !roleName) return res.status(400).json({ message: 'userId et roleName requis' });
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: roleName },
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'assignation du rôle' });
  }
});

export default router;
