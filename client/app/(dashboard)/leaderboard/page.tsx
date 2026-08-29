"use client";
import { useEffect, useState } from "react";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { http } from "@/lib/api";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    http
      .get<any[]>("/api/leaderboard")
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🏆 Classement des militants</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Nom</th>
              <th className="p-3">XP</th>
              <th className="p-3">Badges</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className="border-t dark:border-gray-700">
                <td className="p-3 font-bold">{i + 1}</td>
                <td className="p-3">
                  {u?.firstName ?? ""} {u?.lastName ?? ""}
                </td>
                <td className="p-3">{u.xp}</td>
                <td className="p-3 flex gap-1">
                  {(u.badges || []).map((b: any) => (
                    <span key={b.badge?.name} title={b.badge?.name}>
                      {b.badge?.icon}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <EditableBlockRenderer page="leaderboard" />
    </div>
  );
}
