"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

const DEFAULT_PAGES = [
  { page: "/dashboard", label: "📊 Dashboard" },
  { page: "/feed", label: "📰 Fil actualité" },
  { page: "/proposals", label: "💡 Propositions" },
  { page: "/events", label: "📅 Événements" },
  { page: "/leaderboard", label: "🏆 Classement" },
  { page: "/badges", label: "🎖 Badges" },
  { page: "/program", label: "📋 Programme 2029" },
  { page: "/simulator", label: "🏛 Simulateur" },
  { page: "/recruitment", label: "💼 Recrutement" },
  { page: "/gallery", label: "📸 Galerie" },
  { page: "/media", label: "🎥 Médias" },
  { page: "/donations", label: "💰 Dons" },
  { page: "/diaspora", label: "🌍 Diaspora" },
  { page: "/messages", label: "💬 Messagerie" },
  { page: "/candidatures", label: "🗳 Candidatures" },
  { page: "/admin", label: "⚙ Admin" },
  { page: "/admin/settings", label: "🔧 Paramètres généraux" },
  { page: "/government", label: "🏛 Gouvernement" },
  { page: "/organization", label: "🏗 Organisation" },
  { page: "/ideology", label: "🕊 Neutralité active" },
  { page: "/parity", label: "🚺 Parité" },
  { page: "/food", label: "🌾 Souv. alimentaire" },
  { page: "/digital", label: "💻 Souv. numérique" },
  { page: "/transparency", label: "🛡 Transparence" },
  { page: "/charter", label: "📜 Charte" },
  { page: "/profile", label: "👤 Profil" },
  { page: "/settings", label: "🔧 Paramètres" },
];

const ALL_ROLES = ["ADMIN", "COORDINATOR", "MEMBER", "VISITOR"];

export default function SiteVisibilityAdmin() {
  const [visibilities, setVisibilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await http.get<any[]>("/api/site-visibility");
      const map = new Map((data || []).map((v: any) => [v.page, v]));
      const merged = DEFAULT_PAGES.map((dp) => {
        const existing = map.get(dp.page);
        return {
          page: dp.page,
          label: dp.label,
          roles: existing
            ? (existing as any).roles
            : "ADMIN,COORDINATOR,MEMBER,VISITOR",
          id: existing ? (existing as any).id : undefined,
        };
      });
      setVisibilities(merged);
    } catch (err) {
      console.error("Erreur visibilité:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (page: string, role: string) => {
    const item = visibilities.find((v) => v.page === page);
    if (!item) return;
    let rolesArray = item.roles.split(",").map((r: string) => r.trim());
    if (rolesArray.includes(role)) {
      rolesArray = rolesArray.filter((r: string) => r !== role);
    } else {
      rolesArray.push(role);
    }
    const newRoles = rolesArray.join(",");
    setVisibilities((prev) =>
      prev.map((v) => (v.page === page ? { ...v, roles: newRoles } : v)),
    );

    try {
      await http.put(`/api/site-visibility/${page}`, { roles: newRoles });
    } catch (err) {
      console.error("Erreur update visibilité:", err);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="text-left p-2">Page</th>
            {ALL_ROLES.map((role) => (
              <th key={role} className="p-2 text-center">
                {role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibilities.map((item) => (
            <tr
              key={item.page}
              className="border-b border-gray-200 dark:border-gray-700"
            >
              <td className="p-2 font-medium">{item.label}</td>
              {ALL_ROLES.map((role) => (
                <td key={role} className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={item.roles
                      .split(",")
                      .map((r: string) => r.trim())
                      .includes(role)}
                    onChange={() => handleRoleToggle(item.page, role)}
                    className="h-4 w-4"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
