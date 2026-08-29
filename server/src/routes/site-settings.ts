import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET : récupère tous les paramètres
router.get('/', async (_req, res) => {
  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          primaryColor: '#008000',
          secondaryColor: '#FFD700',
          accentColor: '#E31B23',
          siteTitle: 'SUNU REWUM',
          faviconUrl: '/icon-192.png',
          customCSS: null,
          customJS: null,
          backgroundImage: null,
          logoHeaderLeft: null,
          logoHeaderRight: null,
          logoFooterLeft: null,
          logoFooterRight: null,
          logoPosition: 'header_left',
          copyProtection: false,
        },
      });
    }
    res.json(settings);
  } catch (error) {
    res.json({
      primaryColor: '#008000',
      secondaryColor: '#FFD700',
      accentColor: '#E31B23',
      siteTitle: 'SUNU REWUM',
      faviconUrl: '/icon-192.png',
      customCSS: null,
      customJS: null,
      backgroundImage: null,
      logoHeaderLeft: null,
      logoHeaderRight: null,
      logoFooterLeft: null,
      logoFooterRight: null,
      logoPosition: 'header_left',
      copyProtection: false,
    });
  }
});

// PUT : mise à jour par l'admin
router.put('/', async (req: Request, res: Response) => {
  const {
    primaryColor, secondaryColor, accentColor, siteTitle, faviconUrl,
    customCSS, customJS, backgroundImage,
    logoHeaderLeft, logoHeaderRight, logoFooterLeft, logoFooterRight,
    logoPosition, copyProtection
  } = req.body;

  try {
    const existing = await prisma.siteSettings.findFirst();
    const id = existing?.id ?? 'default';

    const settings = await prisma.siteSettings.upsert({
      where: { id },
      update: {
        primaryColor, secondaryColor, accentColor, siteTitle, faviconUrl,
        customCSS, customJS, backgroundImage,
        logoHeaderLeft, logoHeaderRight, logoFooterLeft, logoFooterRight,
        logoPosition, copyProtection
      },
      create: {
        id,
        primaryColor, secondaryColor, accentColor, siteTitle, faviconUrl,
        customCSS, customJS, backgroundImage,
        logoHeaderLeft, logoHeaderRight, logoFooterLeft, logoFooterRight,
        logoPosition, copyProtection
      },
    });
    res.json(settings);
  } catch (error) {
    console.error('Erreur PUT /api/site-settings:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

export default router;
