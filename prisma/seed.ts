import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Injection des données par défaut dans Neon...');

  // 1. MENU (Sidebar)
  await prisma.menuItem.upsert({
    where: { id: 'seed-menu-1' },
    update: {},
    create: { id: 'seed-menu-1', label: 'Tableau de bord', href: '/dashboard', icon: 'dashboard', order: 1, enabled: true, isVisible: true, roles: 'ADMIN,COORDINATOR,MEMBER,VISITOR' },
  });
  await prisma.menuItem.upsert({
    where: { id: 'seed-menu-2' },
    update: {},
    create: { id: 'seed-menu-2', label: 'Utilisateurs', href: '/dashboard/users', icon: 'users', order: 2, enabled: true, isVisible: true, roles: 'ADMIN,COORDINATOR' },
  });
  await prisma.menuItem.upsert({
    where: { id: 'seed-menu-3' },
    update: {},
    create: { id: 'seed-menu-3', label: 'Paramètres', href: '/dashboard/settings', icon: 'settings', order: 3, enabled: true, isVisible: true, roles: 'ADMIN' },
  });

  // 2. BLOCS CONTENU (Page accueil)
  await prisma.contentBlock.upsert({
    where: { id: 'seed-home-hero' },
    update: {},
    create: { id: 'seed-home-hero', page: 'home', title: 'Bienvenue sur Sunu Rewum', content: 'Contenu par défaut', order: 1, status: 'published' },
  });

  // 3. VISIBILITE SITE
  await prisma.siteVisibility.upsert({
    where: { page: 'global' },
    update: {},
    create: { page: 'global', roles: 'ADMIN,COORDINATOR,MEMBER,VISITOR' },
  });

  console.log('✅ Données injectées avec succès !');
}

main().catch(e => { console.error('❌ Erreur seed:', e); process.exit(1); }).finally(() => prisma.$disconnect());
