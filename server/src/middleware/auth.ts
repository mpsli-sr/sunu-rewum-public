import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { JWT_ACCESS_SECRET } from '../config';

const prisma = new PrismaClient();

export const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Non authentifié' });
    try {
      const decoded: any = jwt.verify(token, JWT_ACCESS_SECRET as string);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true },
      });
      if (!user) return res.status(401).json({ message: 'Accès refusé' });
      if (!roles.includes(user.role)) return res.status(403).json({ message: 'Accès interdit' });
      (req as any).user = user;
      next();
    } catch {
      return res.status(401).json({ message: 'Token invalide' });
    }
  };
};
