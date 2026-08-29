"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/contexts/I18nContext";
import ThemeChanger from "@/components/ThemeChanger";
import SocialFooter from "@/components/SocialFooter";
import { http } from "@/lib/api";

const NAV_FALLBACK = [
  {
    id: "principal",
    icon: "🏠",
    label: "sidebar.groupDashboard",
    children: [
      {
        id: "dashboard",
        href: "/dashboard",
        icon: "📊",
        label: "sidebar.dashboard",
      },
      { id: "profile", href: "/profile", icon: "👤", label: "sidebar.profile" },
      {
        id: "messages",
        href: "/messages",
        icon: "✉️",
        label: "sidebar.messages",
      },
      {
        id: "settings",
        href: "/settings",
        icon: "⚙️",
        label: "sidebar.settings",
      },
    ],
  },
  {
    id: "mouvement",
    icon: "🌍",
    label: "sidebar.groupVieDuMouvement",
    children: [
      {
        id: "organization",
        href: "/organization",
        icon: "🏛️",
        label: "sidebar.organization",
      },
      {
        id: "diaspora",
        href: "/diaspora",
        icon: "🌍",
        label: "sidebar.diaspora",
      },
      {
        id: "government",
        href: "/government",
        icon: "🏛️",
        label: "sidebar.government",
      },
      {
        id: "ideology",
        href: "/ideology",
        icon: "🧠",
        label: "sidebar.activeNeutrality",
      },
      { id: "charter", href: "/charter", icon: "📜", label: "sidebar.charter" },
      {
        id: "transparency",
        href: "/transparency",
        icon: "📊",
        label: "sidebar.transparency",
      },
    ],
  },
  {
    id: "engagement",
    icon: "🤝",
    label: "sidebar.groupProgrammeOutils",
    children: [
      {
        id: "proposals",
        href: "/proposals",
        icon: "💡",
        label: "sidebar.proposals",
      },
      {
        id: "candidatures",
        href: "/candidatures",
        icon: "📝",
        label: "sidebar.candidatures",
      },
      {
        id: "sponsorship",
        href: "/sponsorship",
        icon: "🤝",
        label: "sidebar.sponsorship",
      },
      {
        id: "leaderboard",
        href: "/leaderboard",
        icon: "🏆",
        label: "sidebar.leaderboard",
      },
      { id: "badges", href: "/badges", icon: "🎖️", label: "sidebar.badges" },
    ],
  },
  {
    id: "communication",
    icon: "📰",
    label: "sidebar.groupMediasDons",
    children: [
      { id: "feed", href: "/feed", icon: "📰", label: "sidebar.feed" },
      { id: "events", href: "/events", icon: "📅", label: "sidebar.events" },
      { id: "media", href: "/media", icon: "🎬", label: "sidebar.media" },
      { id: "gallery", href: "/gallery", icon: "🖼️", label: "sidebar.gallery" },
    ],
  },
  {
    id: "programme",
    icon: "📋",
    label: "sidebar.groupProgrammeOutils",
    children: [
      { id: "program", href: "/program", icon: "📋", label: "sidebar.program" },
      {
        id: "digital",
        href: "/digital",
        icon: "💻",
        label: "sidebar.digitalSovereignty",
      },
      {
        id: "donations",
        href: "/donations",
        icon: "💰",
        label: "sidebar.donations",
      },
      {
        id: "food",
        href: "/food",
        icon: "🍲",
        label: "sidebar.foodSovereignty",
      },
      { id: "map", href: "/map", icon: "🗺️", label: "sidebar.map" },
      { id: "parity", href: "/parity", icon: "⚖️", label: "sidebar.parity" },
      {
        id: "recruitment",
        href: "/recruitment",
        icon: "🧑‍💼",
        label: "sidebar.recruitment",
      },
      {
        id: "simulator",
        href: "/simulator",
        icon: "🏛️",
        label: "sidebar.simulator",
      },
    ],
  },
  {
    id: "admin",
    icon: "🔐",
    label: "sidebar.groupMonCompte",
    children: [
      { id: "admin", href: "/admin", icon: "🔐", label: "sidebar.admin" },
      {
        id: "admin-menus",
        href: "/admin/menus",
        icon: "🧩",
        label: "sidebar.admin",
      },
      {
        id: "admin-pages",
        href: "/admin/pages",
        icon: "📄",
        label: "sidebar.admin",
      },
      {
        id: "admin-settings",
        href: "/admin/settings",
        icon: "⚙️",
        label: "sidebar.generalSettings",
      },
      {
        id: "admin-translations",
        href: "/admin/translations",
        icon: "🌐",
        label: "sidebar.settings",
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then((u) => {
        if (u) setUser(u);
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (!user) return <div className="p-8">Chargement...</div>;

  const handleLogout = async () => {
    try {
      await http.post("/api/auth/logout");
    } catch (err) {
      console.error("Erreur déconnexion:", err);
    }
    sessionStorage.removeItem("sunu_rewum_access");
    router.push("/login");
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <aside className="fixed left-0 top-0 h-screen w-64 bg-brand-green text-white overflow-y-auto z-50">
          <div className="p-6 border-b border-white/20">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">🇸🇳</span>
              <span className="text-xl font-bold">SUNU REWUM</span>
            </Link>
            <p className="text-xs text-white/50 mt-2">
              {user.role} • Niv.{user.level}
            </p>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="mt-2 text-xs bg-white/20 rounded px-2 py-1"
            >
              <option value="fr">Fr</option>
              <option value="wol">Wol</option>
              <option value="en">En</option>
            </select>
            <ThemeChanger />
          </div>
          <nav className="p-4 space-y-1">
            {NAV_FALLBACK.map((group: any) => {
              const visibleChildren = group.children;
              if (!visibleChildren || visibleChildren.length === 0) return null;
              const isOpen = openMenus[group.id] || false;
              return (
                <div key={group.id}>
                  <button
                    onClick={() =>
                      setOpenMenus((prev) => ({
                        ...prev,
                        [group.id]: !prev[group.id],
                      }))
                    }
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10"
                  >
                    <span>
                      {group.icon} {t(group.label)}
                    </span>
                    <span>{isOpen ? "▾" : "▸"}</span>
                  </button>
                  {isOpen && (
                    <div className="ml-4 space-y-1 mt-1">
                      {visibleChildren.map((child: any) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                            pathname === child.href
                              ? "bg-white/20 text-yellow-300 font-medium"
                              : "text-white/70 hover:bg-white/10"
                          }`}
                        >
                          <span>{child.icon}</span>
                          <span>{t(child.label)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 w-full text-left mt-4 border-t border-white/20 pt-2"
            >
              <span>🚪</span>
              <span>{t("sidebar.logout")}</span>
            </button>
          </nav>
        </aside>
        <main className="ml-64 p-8 flex-1 pb-16">{children}</main>
        <div className="fixed bottom-0 left-0 w-full z-40 bg-white dark:bg-gray-800 border-t shadow-lg">
          <div className="ml-64">
            <SocialFooter />
          </div>
        </div>
      </div>
  );
}
