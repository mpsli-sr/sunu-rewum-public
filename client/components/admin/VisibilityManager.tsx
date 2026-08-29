"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

const ALL_PAGES = [
  "/dashboard",
  "/feed",
  "/proposals",
  "/events",
  "/leaderboard",
  "/badges",
  "/program",
  "/simulator",
  "/recruitment",
  "/gallery",
  "/media",
  "/donations",
  "/diaspora",
  "/messages",
  "/candidatures",
  "/admin",
  "/admin/settings",
  "/government",
  "/organization",
  "/ideology",
  "/parity",
  "/food",
  "/digital",
  "/transparency",
  "/charter",
  "/profile",
  "/settings",
];

const ROLES = ["VISITOR", "MEMBER", "COORDINATOR", "ADMIN"];

const PROFILES: Record<string, string[]> = {
  "Visiteur seul": ["VISITOR"],
  "Membres+": ["MEMBER", "COORDINATOR", "ADMIN"],
  "Coordinateurs+": ["COORDINATOR", "ADMIN"],
  "Admin seulement": ["ADMIN"],
  "Tout le monde": ["VISITOR", "MEMBER", "COORDINATOR", "ADMIN"],
};

export default function VisibilityManager() {
  const [vis, setVis] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    http
      .get<any[]>("/api/site-visibility")
      .then((data) => {
        const map: Record<string, string> = {};
        (data || []).forEach((item: any) => {
          map[item.page] = item.roles;
        });
        setVis(map);
      })
      .catch(() => setVis({}));
  }, []);

  const toggleRole = async (page: string, role: string) => {
    const currentRoles = (vis[page] || "ADMIN,COORDINATOR,MEMBER,VISITOR")
      .split(",")
      .map((r) => r.trim());
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    const rolesStr = newRoles.join(",");
    setVis({ ...vis, [page]: rolesStr });
    try {
      await http.put(`/api/site-visibility/${page}`, { roles: rolesStr });
      setMessage("✅ Modifications enregistrées.");
    } catch (err) {
      console.error("Erreur visibilité:", err);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const applyProfile = async (profileName: string) => {
    const roles = PROFILES[profileName];
    for (const page of ALL_PAGES) {
      const rolesStr = roles.join(",");
      setVis((prev) => ({ ...prev, [page]: rolesStr }));
      try {
        await http.put(`/api/site-visibility/${page}`, { roles: rolesStr });
      } catch (err) {
        console.error(`Erreur application profil pour ${page}:`, err);
      }
    }
    setMessage(`✅ Profil "${profileName}" appliqué.`);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Appliquer un profil :
        </span>
        {Object.keys(PROFILES).map((profile) => (
          <button
            key={profile}
            onClick={() => applyProfile(profile)}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          >
            {profile}
          </button>
        ))}
      </div>
      {message && <p className="text-green-600 text-sm mb-3">{message}</p>}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Rubrique</th>
              {ROLES.map((role) => (
                <th key={role} className="px-2 py-3 text-center font-semibold">
                  {role === "VISITOR"
                    ? "Visiteur"
                    : role === "MEMBER"
                      ? "Membre"
                      : role === "COORDINATOR"
                        ? "Coord."
                        : "Admin"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {ALL_PAGES.map((page) => {
              const roles = (vis[page] || "ADMIN,COORDINATOR,MEMBER,VISITOR")
                .split(",")
                .map((r) => r.trim());
              return (
                <tr
                  key={page}
                  className="hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-900 dark:text-white">
                    {page}
                  </td>
                  {ROLES.map((role) => (
                    <td key={role} className="px-2 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={roles.includes(role)}
                        onChange={() => toggleRole(page, role)}
                        className="w-4 h-4 text-brand-green bg-gray-100 border-gray-300 rounded focus:ring-brand-green focus:ring-2"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
