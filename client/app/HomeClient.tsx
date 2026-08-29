"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import SocialFooter from "@/components/SocialFooter";
import InlineEditor from "@/components/InlineEditor";
import AcronymeDisplay from "@/components/AcronymeDisplay";
import { http } from "@/lib/api";

export default function HomeClient() {
  const [stats, setStats] = useState({ users: 0, posts: 0, events: 0 });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [heroTitle, setHeroTitle] = useState("SUNU REWUM");
  const [user, setUser] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPosition, setLogoPosition] = useState("");

  useEffect(() => {
    // Statistiques publiques
    http
      .get<{ users: number; posts: number; events: number }>(
        "/api/public/stats",
      )
      .then(setStats)
      .catch(() => {});

    // Utilisateur connecté (pour l'édition)
    http
      .get("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null));

    // Réglages du site (titre, logo)
    http
      .get("/api/site-settings")
      .then((s: any) => {
        if (s.siteTitle) {
          // On enlève le drapeau et les espaces superflus pour éviter le clignotement
          const cleanTitle = s.siteTitle.replace(/^🇸🇳\s*/, "").trim();
          setHeroTitle(cleanTitle || "SUNU REWUM");
        }
        if (s.logoHeaderLeft) setLogoUrl(s.logoHeaderLeft);
        if (s.logoPosition) setLogoPosition(s.logoPosition);
      })
      .catch(() => {});
  }, []);

  const saveHeroTitle = async (val: string) => {
    // On sauvegarde uniquement le texte sans drapeau
    const cleanVal = val.replace(/^🇸🇳\s*/, "").trim();
    setHeroTitle(cleanVal);
    try {
      await http.put("/api/site-settings", { siteTitle: cleanVal });
    } catch {}
  };

  const subscribe = async () => {
    if (!newsletterEmail) return;
    try {
      await http.post("/api/newsletter", { email: newsletterEmail });
      setNewsletterMsg("Merci pour votre inscription !");
      setNewsletterEmail("");
    } catch {
      setNewsletterMsg("Erreur lors de l’inscription.");
    }
  };

  const showLogo = logoUrl && logoPosition?.includes("header_left");

  return (
    <>
      {/* Bannière hero */}
      <section className="bg-gradient-to-r from-green-700 to-yellow-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Drapeau fixe, toujours affiché */}
            <span className="text-5xl md:text-6xl font-extrabold">🇸🇳</span>
            {showLogo && (
              <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
            )}
            <InlineEditor
              initialContent={heroTitle}
              onSave={saveHeroTitle}
              role={user?.role}
              className="text-5xl md:text-6xl font-extrabold"
              as="h1"
            />
          </div>
          <p className="text-2xl md:text-3xl mb-2">COTHIE AK M.P.S.L.I</p>
          <p className="text-xl mb-8">
            Travail, Dignité, Souveraineté, Solidarité
          </p>
          <AcronymeDisplay />
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link
              href="/register"
              className="bg-white text-green-800 font-bold px-8 py-3 rounded-full"
            >
              Adhérer
            </Link>
            <Link
              href="/donations"
              className="bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-full"
            >
              Faire un don
            </Link>
            <Link
              href="/events"
              className="bg-red-600 text-white font-bold px-8 py-3 rounded-full"
            >
              Participer à un événement
            </Link>
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="max-w-4xl mx-auto -mt-10 grid grid-cols-3 gap-4 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <p className="text-4xl font-bold text-green-700">{stats.users}</p>
          <p className="text-gray-500 dark:text-gray-300">Membres</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <p className="text-4xl font-bold text-yellow-600">{stats.posts}</p>
          <p className="text-gray-500 dark:text-gray-300">Propositions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <p className="text-4xl font-bold text-red-600">{stats.events}</p>
          <p className="text-gray-500 dark:text-gray-300">Événements</p>
        </div>
      </section>

      {/* Grille de navigation */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Explorez le mouvement
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { href: "/dashboard", icon: "📊", label: "Tableau de bord" },
            { href: "/feed", icon: "📰", label: "Actualités" },
            { href: "/program", icon: "📋", label: "Programme 2029" },
            { href: "/proposals", icon: "💡", label: "Propositions" },
            { href: "/diaspora", icon: "🌍", label: "Diaspora" },
            { href: "/simulator", icon: "🏛", label: "Simulateur" },
            { href: "/leaderboard", icon: "🏆", label: "Classement" },
            { href: "/discover", icon: "🔍", label: "Découvrir" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-center hover:shadow-lg transition"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {item.label}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <EditableBlockRenderer page="home" />

      {/* Newsletter */}
      <section className="bg-gray-100 dark:bg-gray-800 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Restez informé</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Recevez les dernières actualités du mouvement.
          </p>
          {newsletterMsg && (
            <p className="text-green-600 mb-4">{newsletterMsg}</p>
          )}
          <div className="flex gap-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={subscribe}
              className="bg-green-700 text-white px-6 py-2 rounded"
            >
              S'abonner
            </button>
          </div>
        </div>
      </section>

      <SocialFooter />
    </>
  );
}
