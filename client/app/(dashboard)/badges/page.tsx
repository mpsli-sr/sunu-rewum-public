"use client";
import { useEffect, useState } from "react";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { http } from "@/lib/api";

export default function BadgesPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);

  useEffect(() => {
    http
      .get<any[]>("/api/badges")
      .then(setBadges)
      .catch(() => setBadges([]));
    http
      .get<any[]>("/api/badges/my")
      .then(setUserBadges)
      .catch(() => setUserBadges([]));
  }, []);

  const userBadgeIds = userBadges.map((b: any) => b.id);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🏆 Badges</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((b: any) => (
          <div
            key={b.id}
            className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center ${
              userBadgeIds.includes(b.id)
                ? "ring-2 ring-yellow-500"
                : "opacity-60"
            }`}
          >
            <span className="text-4xl">{b.icon || "🏅"}</span>
            <h3 className="font-bold mt-2">{b.name}</h3>
            <p className="text-sm text-gray-500">{b.description}</p>
            <p className="text-xs text-gray-400">XP requis : {b.requiredXp}</p>
            {userBadgeIds.includes(b.id) && (
              <p className="text-xs text-green-600 mt-1">✅ Obtenu</p>
            )}
          </div>
        ))}
      </div>
      <EditableBlockRenderer page="badges" />
    </div>
  );
}
