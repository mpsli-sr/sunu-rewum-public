"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function StatsWidget() {
  const [stats, setStats] = useState({ users: 0, posts: 0, events: 0 });
  useEffect(() => {
    http
      .get<{ users: number; posts: number; events: number }>("/api/public/stats")
      .then(setStats)
      .catch(() => setStats({ users: 1234, posts: 89, events: 12 }));
  }, []);
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
        <p className="text-3xl font-bold text-brand-green">{stats.users}</p>
        <p className="text-gray-500">Membres</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
        <p className="text-3xl font-bold text-brand-gold">{stats.posts}</p>
        <p className="text-gray-500">Propositions</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
        <p className="text-3xl font-bold text-brand-red">{stats.events}</p>
        <p className="text-gray-500">Événements</p>
      </div>
    </div>
  );
}
