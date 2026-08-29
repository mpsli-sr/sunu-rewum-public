"use client";
import WysiwygEditor from "@/components/WysiwygEditor";
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

export default function CandidaturesPage() {
  const [user, setUser] = useState<any>(null);
  const [mesCandidatures, setMesCandidatures] = useState<any[]>([]);
  const [poste, setPoste] = useState("coordinateur");
  const [zone, setZone] = useState("");
  const [motivation, setMotivation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then((u) => {
        if (u) setUser(u);
      })
      .catch(() => setUser(null));

    http
      .get<any[]>("/api/candidatures/me")
      .then(setMesCandidatures)
      .catch(() => setMesCandidatures([]));

    http
      .get<any[]>("/api/custom-field-values/me")
      .then((vals) => {
        const map: any = {};
        vals.forEach((v: any) => {
          map[v.fieldId] = v.value;
        });
        setValues(map);
      })
      .catch(() => {});
  }, []);

  const submitCandidature = async () => {
    const requiredFields = [
      { key: "phone", label: "Téléphone" },
      { key: "region", label: "Région" },
    ];
    let incomplete = false;
    for (const field of requiredFields) {
      const val = values[field.key] || "";
      if (!val.trim()) {
        setMessage(
          `Veuillez d'abord compléter votre profil : ${field.label} manquant. Allez dans votre <a href="/profile" class="underline">Profil</a> pour le renseigner.`,
        );
        incomplete = true;
        break;
      }
    }
    if (incomplete) return;

    if (!poste || !motivation) {
      setMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const res = await http.post<any>("/api/candidatures", {
        poste,
        zone: zone || null,
        motivation,
      });
      setMessage("✅ Candidature envoyée avec succès !");
      setPoste("coordinateur");
      setZone("");
      setMotivation("");
      const myCand = await http.get<any[]>("/api/candidatures/me");
      setMesCandidatures(myCand || []);
    } catch (err: any) {
      setMessage(err.message || "Erreur");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  if (!user) return <div className="p-8">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🗳️ Candidatures</h1>
      <p className="text-gray-500 mb-6">
        Postulez pour un poste à responsabilité dans le mouvement. Votre
        candidature sera examinée par l'équipe dirigeante.
      </p>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Nouvelle candidature</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Poste souhaité *</label>
            <select
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              {POSTES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">
              Zone géographique (optionnel)
            </label>
            <input
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="Ex: Dakar, Thiès, France, Europe..."
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Motivation *</label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Expliquez pourquoi vous souhaitez occuper ce poste..."
              rows={5}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={submitCandidature}
            disabled={loading}
            className="bg-brand-green text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Envoi..." : "Envoyer ma candidature"}
          </button>
          {message && (
            <p
              className="text-sm mt-2 text-blue-600"
              dangerouslySetInnerHTML={{ __html: message }}
            />
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Mes candidatures</h2>
      {mesCandidatures.length === 0 ? (
        <p className="text-gray-500">Aucune candidature en cours.</p>
      ) : (
        <div className="space-y-3">
          {mesCandidatures.map((c: any) => (
            <div
              key={c.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {POSTES.find((p) => p.value === c.poste)?.label || c.poste}
                </p>
                {c.zone && (
                  <p className="text-sm text-gray-500">Zone : {c.zone}</p>
                )}
                <p className="text-sm text-gray-500">
                  Motivation : {c.motivation.substring(0, 100)}...
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  c.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : c.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {c.status === "APPROVED"
                  ? "Validée"
                  : c.status === "REJECTED"
                    ? "Rejetée"
                    : "En attente"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
