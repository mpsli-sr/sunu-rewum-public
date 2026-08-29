"use client";
import { useState, useEffect } from "react";
import SiteVisibilityAdmin from "@/components/admin/SiteVisibilityAdmin";
import DashboardConfigAdmin from "@/components/admin/DashboardConfigAdmin";
import { http } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState<string>("appearance");

  useEffect(() => {
    http
      .get<any>("/api/site-settings")
      .then((data) => setSettings(data))
      .catch(() => setSettings({}));
  }, []);

  const handleUpload = async (file: File, field: string) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await http.post<{ url: string }>("/api/upload", formData, {
        auth: false,
      });
      setSettings({ ...settings, [field]: res.url });
    } catch (err) {
      console.error("Erreur upload:", err);
    }
  };

  const saveSettings = async () => {
    try {
      await http.put("/api/site-settings", settings);
      alert("Paramètres enregistrés");
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
    }
  };

  const tabs = [
    { key: "appearance", label: "🎨 Apparence" },
    { key: "visibility", label: "👁️ Visibilité & Accès" },
    { key: "dashboard", label: "📊 Tableau de bord" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres généraux</h1>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white dark:bg-gray-800 text-brand-green border-b-2 border-brand-green"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Onglet APPARENCE */}
      {activeTab === "appearance" && (
        <div className="space-y-6">
          {/* Couleurs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Couleur primaire
              </label>
              <input
                type="color"
                value={settings.primaryColor || "#008000"}
                onChange={(e) =>
                  setSettings({ ...settings, primaryColor: e.target.value })
                }
                className="w-full h-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Couleur secondaire
              </label>
              <input
                type="color"
                value={settings.secondaryColor || "#FFD700"}
                onChange={(e) =>
                  setSettings({ ...settings, secondaryColor: e.target.value })
                }
                className="w-full h-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Couleur accent
              </label>
              <input
                type="color"
                value={settings.accentColor || "#E31B23"}
                onChange={(e) =>
                  setSettings({ ...settings, accentColor: e.target.value })
                }
                className="w-full h-10"
              />
            </div>
          </div>

          {/* Titre du site */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Titre du site
            </label>
            <input
              type="text"
              value={settings.siteTitle || ""}
              onChange={(e) =>
                setSettings({ ...settings, siteTitle: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Logos par position */}
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Logos par emplacement
            </label>
            {[
              { key: "logoHeaderLeft", label: "En-tête gauche" },
              { key: "logoHeaderRight", label: "En-tête droite" },
              { key: "logoFooterLeft", label: "Pied de page gauche" },
              { key: "logoFooterRight", label: "Pied de page droite" },
            ].map((pos) => (
              <div
                key={pos.key}
                className="border p-3 rounded dark:border-gray-600"
              >
                <label className="text-sm font-medium mb-1 block">
                  {pos.label}
                </label>
                <input
                  type="text"
                  value={settings[pos.key] || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, [pos.key]: e.target.value })
                  }
                  placeholder="URL du logo (ou vide pour aucun)"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file, pos.key);
                  }}
                  className="mt-1"
                />
              </div>
            ))}
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Favicon (URL ou upload)
            </label>
            <input
              type="text"
              value={settings.faviconUrl || ""}
              onChange={(e) =>
                setSettings({ ...settings, faviconUrl: e.target.value })
              }
              placeholder="https://..."
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              type="file"
              accept="image/x-icon,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file, "faviconUrl");
              }}
              className="mt-1"
            />
          </div>

          {/* Position du logo (cases à cocher) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Activer l'affichage du logo sur :
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "header_left", label: "En-tête gauche" },
                { key: "header_right", label: "En-tête droite" },
                { key: "footer_left", label: "Pied de page gauche" },
                { key: "footer_right", label: "Pied de page droite" },
              ].map((pos) => {
                const selected = (settings.logoPosition || "")
                  .split(",")
                  .includes(pos.key);
                return (
                  <label
                    key={pos.key}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => {
                        const current = (settings.logoPosition || "")
                          .split(",")
                          .filter(Boolean);
                        if (e.target.checked) {
                          current.push(pos.key);
                        } else {
                          const idx = current.indexOf(pos.key);
                          if (idx !== -1) current.splice(idx, 1);
                        }
                        setSettings({
                          ...settings,
                          logoPosition: current.join(","),
                        });
                      }}
                      className="h-4 w-4"
                    />
                    {pos.label}
                  </label>
                );
              })}
            </div>
          </div>

          {/* CSS personnalisé */}
          <div>
            <label className="block text-sm font-medium mb-1">
              CSS personnalisé
            </label>
            <textarea
              value={settings.customCSS || ""}
              onChange={(e) =>
                setSettings({ ...settings, customCSS: e.target.value })
              }
              placeholder="/* Votre code CSS */"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-32 font-mono text-sm"
            />
          </div>
          {/* JS personnalisé */}
          <div>
            <label className="block text-sm font-medium mb-1">
              JavaScript personnalisé
            </label>
            <textarea
              value={settings.customJS || ""}
              onChange={(e) =>
                setSettings({ ...settings, customJS: e.target.value })
              }
              placeholder="// Votre code JS"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-32 font-mono text-sm"
            />
          </div>
          {/* Image de fond */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Image de fond (URL)
            </label>
            <input
              type="text"
              value={settings.backgroundImage || ""}
              onChange={(e) =>
                setSettings({ ...settings, backgroundImage: e.target.value })
              }
              placeholder="https://..."
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* Protection anti‑copie */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.copyProtection || false}
              onChange={(e) =>
                setSettings({ ...settings, copyProtection: e.target.checked })
              }
              id="copyProtection"
              className="h-4 w-4"
            />
            <label htmlFor="copyProtection" className="text-sm font-medium">
              Activer la protection anti‑copie / téléchargement
            </label>
          </div>

          <button
            onClick={saveSettings}
            className="bg-brand-green text-white px-6 py-2 rounded"
          >
            Enregistrer
          </button>
        </div>
      )}

      {/* Onglet VISIBILITÉ */}
      {activeTab === "visibility" && <SiteVisibilityAdmin />}

      {/* Onglet TABLEAU DE BORD */}
      {activeTab === "dashboard" && <DashboardConfigAdmin />}
    </div>
  );
}
