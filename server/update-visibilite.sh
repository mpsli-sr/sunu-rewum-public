#!/usr/bin/env bash
cd ~/sunu-rewum

echo "💾 Sauvegarde Git..."
git add -A && git commit -m "Sauvegarde avant mise à jour visibilité - $(date +%d-%m-%Y_%H-%M)" 2>/dev/null || echo "Rien à commit"

# ============================================================
# 1. MISE À JOUR DU LAYOUT POUR UTILISER LA VISIBILITÉ DYNAMIQUE
# ============================================================
echo "🔧 Modification du layout pour la visibilité dynamique..."

cat > 'client/app/(dashboard)/layout.tsx' << 'LAYOUT'
'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import ThemeChanger from '@/components/ThemeChanger';

// Structure de base (sans les rôles, qui seront chargés dynamiquement)
const baseMenu = [
  { href: '/dashboard', label: 'sidebar.dashboard', icon: '📊' },
  { href: '/feed', label: 'sidebar.feed', icon: '📰' },
  { href: '/proposals', label: 'sidebar.proposals', icon: '💡' },
  { href: '/events', label: 'sidebar.events', icon: '📅' },
  { href: '/leaderboard', label: 'sidebar.leaderboard', icon: '🏆' },
  { href: '/badges', label: 'sidebar.badges', icon: '🎖️' },
  { href: '/program', label: 'sidebar.program', icon: '📋' },
  { href: '/simulator', label: 'sidebar.simulator', icon: '🏛️' },
  { href: '/recruitment', label: 'sidebar.recruitment', icon: '💼' },
  { href: '/gallery', label: 'sidebar.gallery', icon: '📸' },
  { href: '/media', label: 'sidebar.media', icon: '🎥' },
  { href: '/donations', label: 'sidebar.donations', icon: '💰' },
  { href: '/diaspora', label: 'sidebar.diaspora', icon: '🌍' },
  { href: '/messages', label: 'sidebar.messages', icon: '💬' },
  { href: '/candidatures', label: 'Candidatures', icon: '🗳️' },
  { href: '/admin', label: 'sidebar.admin', icon: '⚙️' },
  { href: '/admin/settings', label: 'Paramètres généraux', icon: '🔧' },
  { href: '/government', label: 'Gouvernement', icon: '🏛️' },
  { href: '/organization', label: 'Organisation', icon: '🏗️' },
  { href: '/ideology', label: 'Neutralité active', icon: '🕊️' },
  { href: '/parity', label: 'Parité', icon: '🚺' },
  { href: '/food', label: 'Souv. alimentaire', icon: '🌾' },
  { href: '/digital', label: 'Souv. numérique', icon: '💻' },
  { href: '/transparency', label: 'Transparence', icon: '🛡️' },
  { href: '/charter', label: 'Charte', icon: '📜' },
  { href: '/profile', label: 'sidebar.profile', icon: '👤' },
  { href: '/settings', label: 'sidebar.settings', icon: '🔧' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [visibility, setVisibility] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(u => { if (u) setUser(u); else router.push('/login'); });
    // Charger la visibilité
    fetch('http://localhost:3001/api/site-visibility')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, string> = {};
        data.forEach((item: any) => { map[item.page] = item.roles; });
        setVisibility(map);
      })
      .catch(() => {});
  }, [router]);

  // Recherche
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const delay = setTimeout(async () => {
      const res = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        setSearchResults(await res.json());
        setShowResults(true);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-green border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Filtrer les liens selon la visibilité
  const allowedLinks = baseMenu.filter(item => {
    const roles = visibility[item.href] || 'ADMIN,COORDINATOR,MEMBER,VISITOR';
    return roles.split(',').map(r => r.trim()).includes(user.role);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-brand-green text-white overflow-y-auto z-50">
        <div className="p-6 border-b border-white/20">
          <Link href="/" className="text-xl font-bold">🇸🇳 SUNU REWUM</Link>
          <p className="text-xs text-white/70 mt-1">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-white/50">{user.role} • Niv.{user.level}</p>
          <select value={lang} onChange={(e) => setLang(e.target.value as any)} className="mt-2 text-xs bg-white/10 rounded px-1 py-0.5 text-white">
            <option value="fr">Fr</option>
            <option value="wol">Wol</option>
            <option value="en">En</option>
          </select>
          <ThemeChanger />
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              className="w-full p-1 text-xs rounded bg-white/20 text-white placeholder-white/70 focus:outline-none"
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-b shadow-lg max-h-60 overflow-y-auto z-50">
                {searchResults.map((result: any, i: number) => (
                  <Link key={i} href={result.href} className="block px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-700 last:border-0"
                    onClick={() => { setSearchQuery(''); setShowResults(false); }}>
                    <span className="font-medium text-brand-green">{result.type}</span>: {result.title}
                    {result.subtitle && <p className="text-gray-500 text-xs truncate">{result.subtitle}</p>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {allowedLinks.map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${pathname === item.href ? 'bg-white/20 text-yellow-300 font-medium' : 'text-white/80 hover:bg-white/10'}`}>
              <span>{item.icon}</span>
              <span>{t(item.label) || item.label}</span>
            </Link>
          ))}
          <button onClick={async () => { await fetch('http://localhost:3001/api/auth/logout', { method: 'POST', credentials: 'include' }); router.push('/login'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 w-full text-left">
            <span>🚪</span> <span>{t('sidebar.logout')}</span>
          </button>
        </nav>
      </aside>
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
LAYOUT

# ============================================================
# 2. AMÉLIORATION DU COMPOSANT VISIBILITY MANAGER (cases à cocher)
# ============================================================
echo "📋 Mise à jour du composant VisibilityManager..."
mkdir -p client/components/admin
cat > client/components/admin/VisibilityManager.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';

const ALL_PAGES = [
  '/dashboard', '/feed', '/proposals', '/events', '/leaderboard', '/badges',
  '/program', '/simulator', '/recruitment', '/gallery', '/media', '/donations',
  '/diaspora', '/messages', '/candidatures', '/admin', '/admin/settings',
  '/government', '/organization',
  '/ideology', '/parity', '/food', '/digital',
  '/transparency', '/charter',
  '/profile', '/settings'
];

const ROLES = ['VISITOR', 'MEMBER', 'COORDINATOR', 'ADMIN'];

export default function VisibilityManager() {
  const [vis, setVis] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/site-visibility', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const map: Record<string, string> = {};
        data.forEach((item: any) => { map[item.page] = item.roles; });
        setVis(map);
      });
  }, []);

  const toggleRole = async (page: string, role: string) => {
    const currentRoles = (vis[page] || 'ADMIN,COORDINATOR,MEMBER,VISITOR').split(',').map(r => r.trim());
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    const rolesStr = newRoles.join(',');
    setVis({ ...vis, [page]: rolesStr });
    await fetch(`http://localhost:3001/api/site-visibility/${page}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles: rolesStr }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Visibilité des rubriques par rôle</h2>
      {saved && <p className="text-green-600 text-sm mb-2">✅ Modifications enregistrées.</p>}
      <div className="space-y-2">
        {ALL_PAGES.map(page => {
          const roles = (vis[page] || 'ADMIN,COORDINATOR,MEMBER,VISITOR').split(',').map(r => r.trim());
          return (
            <div key={page} className="bg-white dark:bg-gray-800 p-3 rounded shadow">
              <p className="font-medium text-sm mb-1">{page}</p>
              <div className="flex gap-4">
                {ROLES.map(role => (
                  <label key={role} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={roles.includes(role)}
                      onChange={() => toggleRole(page, role)}
                    />
                    {role === 'VISITOR' ? 'Visiteur' : role === 'MEMBER' ? 'Membre' : role === 'COORDINATOR' ? 'Coordinateur' : 'Admin'}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
EOF

# ============================================================
# 3. INITIALISER LES VALEURS PAR DÉFAUT DANS LA BASE
# ============================================================
echo "🗃️ Initialisation des visibilités par défaut..."
cd server
npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const pages = [
    '/dashboard', '/feed', '/proposals', '/events', '/leaderboard', '/badges',
    '/program', '/simulator', '/recruitment', '/gallery', '/media', '/donations',
    '/diaspora', '/messages', '/candidatures', '/admin', '/admin/settings',
    '/government', '/organization',
    '/ideology', '/parity', '/food', '/digital',
    '/transparency', '/charter',
    '/profile', '/settings'
  ];
  for (const page of pages) {
    await prisma.siteVisibility.upsert({
      where: { page },
      update: {},
      create: { page, roles: 'ADMIN,COORDINATOR,MEMBER,VISITOR' },
    });
  }
  console.log('✅ Visibilités initialisées.');
  await prisma.\$disconnect();
})();
" 2>/dev/null
cd ..

echo "✅ Mise à jour terminée."
echo "🔁 Redémarrez le frontend : cd ~/sunu-rewum/client && npm run dev"
