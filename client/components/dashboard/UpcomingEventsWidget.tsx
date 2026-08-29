"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    http
      .get<any[]>("/api/events")
      .then((data) => setEvents((data || []).slice(0, 3)))
      .catch(() => setEvents([]));
  }, []);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📅 Événements à venir</h2>
      {events.length === 0 && (
        <p className="text-gray-500">Aucun événement prévu.</p>
      )}
      {events.map((ev: any) => (
        <div
          key={ev.id}
          className="border-b dark:border-gray-700 pb-2 last:border-0 mb-2"
        >
          <p className="font-medium">{ev.title}</p>
          <p className="text-sm text-gray-500">{ev.description}</p>
          <p className="text-xs text-gray-400">
            {new Date(ev.date).toLocaleDateString("fr")} - {ev.type}
          </p>
        </div>
      ))}
    </div>
  );
}
