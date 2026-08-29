"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

const POSTES = [
  { value: "coordinateur", label: "Coordinateur" },
  { value: "elu", label: "Élu" },
  { value: "conseiller", label: "Conseiller" },
  { value: "responsable_regional", label: "Responsable Régional" },
  { value: "responsable_departemental", label: "Responsable Départemental" },
  { value: "responsable_communal", label: "Responsable Communal" },
  { value: "responsable_national", label: "Responsable National" },
  {
    value: "representant_diaspora_france",
    label: "Représentant Diaspora – France",
  },
  {
    value: "representant_diaspora_usa",
    label: "Représentant Diaspora – États‑Unis",
  },
  {
    value: "representant_diaspora_italie",
    label: "Représentant Diaspora – Italie",
  },
  { value: "delegue_diaspora_europe", label: "Délégué Diaspora – Europe" },
  { value: "delegue_diaspora_amerique", label: "Délégué Diaspora – Amériques" },
  {
    value: "delegue_diaspora_afrique",
    label: "Délégué Diaspora – Afrique (hors Sénégal)",
  },
  { value: "delegue_diaspora_asie", label: "Délégué Diaspora – Asie" },
];

export default function CandidaturesManager() {
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPoste, setFilterPoste] = useState("");
  const [filterZone, setFilterZone] = useState("");

  const load = () => {
    const params = new URLSearchParams();
    if (filterStatus) params.append("status", filterStatus);
    if (filterPoste) params.append("poste", filterPoste);
    if (filterZone) params.append("zone", filterZone);
    http
      .get<any[]>(`/api/candidatures?${params.toString()}`)
      .then(setCandidatures)
      .catch(() => setCandidatures([]));
  };

  useEffect(() => {
    load();
  }, [filterStatus, filterPoste, filterZone]);

  const changeStatus = async (id: string, status: string) => {
    try {
      await http.patch(`/api/candidatures/${id}`, { status });
      load();
    } catch (err) {
      console.error("Erreur changement statut:", err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gestion des candidatures</h2>
      <div className="flex gap-4 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="APPROVED">Validée</option>
          <option value="REJECTED">Rejetée</option>
        </select>
        <select
          value={filterPoste}
          onChange={(e) => setFilterPoste(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Tous les postes</option>
          {POSTES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          className="border rounded p-2"
        />
      </div>
      <div className="space-y-2">
        {candidatures.map((c: any) => (
          <div
            key={c.id}
            className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                {c.user?.firstName ?? ""} {c.user?.lastName ?? ""}
              </p>
              <p className="text-sm">
                {POSTES.find((p) => p.value === c.poste)?.label || c.poste}{" "}
                {c.zone ? ` - ${c.zone}` : ""}
              </p>
              <p className="text-sm text-gray-500">{c.motivation}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  c.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : c.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {c.status}
              </span>
              {c.status === "PENDING" && (
                <>
                  <button
                    onClick={() => changeStatus(c.id, "APPROVED")}
                    className="text-green-500 hover:underline text-sm"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => changeStatus(c.id, "REJECTED")}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Rejeter
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
