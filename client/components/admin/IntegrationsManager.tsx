"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

const FIELDS = [
  { key: "whatsappNumber", label: "Numéro WhatsApp", placeholder: "+221773453889" },
  { key: "telegramUsername", label: "Nom d'utilisateur Telegram", placeholder: "@sunurewum" },
  { key: "waveMerchantId", label: "Identifiant marchand Wave", placeholder: "123456" },
  { key: "orangeMoneyMerchantId", label: "Identifiant Orange Money", placeholder: "789012" },
  { key: "contactEmail", label: "Email de contact (dons, info)", placeholder: "mpsli.adm@proton.me" },
  { key: "contactPhone", label: "Téléphone officiel du mouvement", placeholder: "+221773453889" },
  { key: "tiktokUrl", label: "Lien TikTok", placeholder: "https://tiktok.com/@sunurewum" },
  { key: "facebookUrl", label: "Lien Facebook", placeholder: "https://fb.com/sunurewum" },
  { key: "xUrl", label: "Lien X (Twitter)", placeholder: "https://x.com/sunurewum" },
  { key: "youtubeUrl", label: "Lien YouTube", placeholder: "https://youtube.com/@sunurewum" },
  { key: "adminEmail", label: "Email administrateur (Proton)", placeholder: "mpsli.adm@proton.me" },
  { key: "githubRepo", label: "Dépôt GitHub", placeholder: "https://github.com/sunurewum" },
  { key: "vercelProject", label: "Projet Vercel", placeholder: "sunurewum" },
  { key: "acronymDefinition", label: "Définition M.P.S.L.I", placeholder: "Mouvement Patriotique pour la Souveraineté, la Liberté et l'Indépendance" },
];

export default function IntegrationsManager() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    http
      .get<Record<string, string>>("/api/integrations")
      .then((data) => setValues(data || {}))
      .catch(() => setValues({}));
  }, []);

  const handleChange = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    try {
      await http.put("/api/integrations", values);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Erreur intégrations:", err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Réseaux sociaux & Services</h2>
      <div className="space-y-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium mb-1">
              {field.label}
            </label>
            <input
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              placeholder={field.placeholder}
              value={values[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <button
        onClick={save}
        className="mt-4 bg-brand-green text-white px-6 py-2 rounded"
      >
        Enregistrer
      </button>
      {saved && <p className="text-green-600 mt-2">✅ Sauvegardé.</p>}
    </div>
  );
}
