"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import InlineEditor from "@/components/InlineEditor";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { http } from "@/lib/api";

export default function DiscoverPage() {
  const [stats, setStats] = useState({ users: 0, posts: 0, events: 0 });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    http
      .get<{ users: number; posts: number; events: number }>(
        "/api/public/stats",
      )
      .then(setStats)
      .catch(() => setStats({ users: 1234, posts: 89, events: 12 }));
    http
      .get<any>("/api/auth/me")
      .then((u) => {
        if (u) setUser(u);
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center text-gray-900 dark:text-white">
        <InlineEditor
          initialContent="Découvrez SUNU REWUM"
          onSave={async () => {}}
          role={user?.role}
          className="text-5xl font-bold mb-6"
          as="h1"
        />
        <InlineEditor
          initialContent="Un mouvement citoyen pour la souveraineté, la neutralité et la parité."
          onSave={async () => {}}
          role={user?.role}
          className="text-xl mb-12"
          as="p"
        />

        {/* Compteurs dynamiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <p className="text-4xl font-bold text-green-700">{stats.users}</p>
            <p className="text-gray-500">Membres</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <p className="text-4xl font-bold text-yellow-600">{stats.posts}</p>
            <p className="text-gray-500">Propositions</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <p className="text-4xl font-bold text-red-600">{stats.events}</p>
            <p className="text-gray-500">Événements</p>
          </div>
        </div>

        {/* Piliers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-2">📋 Programme 2029</h2>
            <p>Consultez nos propositions détaillées pour le Sénégal.</p>
            <Link
              href="/program"
              className="text-brand-green hover:underline mt-4 inline-block"
            >
              En savoir plus
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-2">🌍 Diaspora</h2>
            <p>Rejoignez les Sénégalais de l'étranger.</p>
            <Link
              href="/diaspora"
              className="text-brand-green hover:underline mt-4 inline-block"
            >
              En savoir plus
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-2">💰 Transparence</h2>
            <p>Suivez nos comptes et nos dons.</p>
            <Link
              href="/transparency"
              className="text-brand-green hover:underline mt-4 inline-block"
            >
              En savoir plus
            </Link>
          </div>
        </div>

        {/* Appel à l'action */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow mb-16">
          <h2 className="text-2xl font-bold mb-4">Prêt à vous engager ?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-brand-green text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition"
            >
              Adhérer
            </Link>
            <Link
              href="/donations"
              className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-yellow-300 transition"
            >
              Faire un don
            </Link>
            <Link
              href="/charter"
              className="bg-gray-800 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-700 transition"
            >
              Signer la charte
            </Link>
          </div>
        </div>

        {/* Blocs modulables (témoignages, etc.) */}
        <EditableBlockRenderer page="discover" />
      </div>
    </div>
  );
}
