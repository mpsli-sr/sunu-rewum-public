"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function PopularProposalsWidget() {
  const [proposals, setProposals] = useState<any[]>([]);
  useEffect(() => {
    http
      .get<any[]>("/api/proposals")
      .then((data) => {
        const sorted = (data || []).sort(
          (a: any, b: any) =>
            (b.votes?.length || 0) - (a.votes?.length || 0),
        );
        setProposals(sorted.slice(0, 3));
      })
      .catch(() => setProposals([]));
  }, []);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">💡 Propositions populaires</h2>
      {proposals.length === 0 && (
        <p className="text-gray-500">Aucune proposition.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {proposals.map((p: any) => (
          <div
            key={p.id}
            className="border dark:border-gray-700 rounded-lg p-3"
          >
            <p className="font-medium">{p.title}</p>
            <p className="text-sm text-gray-500 line-clamp-2">
              {p.description}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">{p.status}</span>
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded text-xs">
                👍 {p.votes?.length || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
