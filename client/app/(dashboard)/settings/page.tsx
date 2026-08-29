"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: "fr",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then((u) => setUser(u))
      .catch(() => setUser(null));
    http
      .get<any>("/api/settings")
      .then((s) => {
        if (s && s.notifications !== undefined) setSettings(s);
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    try {
      await http.put("/api/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
    }
  };

  if (!user) return <div className="p-8">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🔧 Paramètres</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg space-y-6">
        <div>
          <label className="block font-medium mb-2">Langue</label>
          <select
            value={settings.language}
            onChange={(e) =>
              setSettings({ ...settings, language: e.target.value })
            }
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="fr">Français</option>
            <option value="wol">Wolof</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span>Notifications</span>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) =>
              setSettings({ ...settings, notifications: e.target.checked })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <span>Mode sombre</span>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) =>
              setSettings({ ...settings, darkMode: e.target.checked })
            }
          />
        </div>
        <button
          onClick={save}
          className="bg-brand-green text-white px-6 py-2 rounded"
        >
          Enregistrer
        </button>
        {saved && <p className="text-green-600 text-sm">✅ Sauvegardé !</p>}
      </div>
    </div>
  );
}
