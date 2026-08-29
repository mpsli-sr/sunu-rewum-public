"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

const LOCALES = ["fr", "wol", "en"];

export default function AdminTranslationsPage() {
  const [translations, setTranslations] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ key: "", locale: "fr", value: "" });

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    http
      .get<any[]>("/api/translations")
      .then(setTranslations)
      .catch(() => setTranslations([]));
  };

  const submit = async () => {
    try {
      await http.post("/api/translations", form);
      setForm({ key: "", locale: "fr", value: "" });
      load();
    } catch (err) {
      console.error("Erreur traduction:", err);
    }
  };

  const remove = async (id: string) => {
    try {
      await http.delete(`/api/translations/${id}`);
      load();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const filtered = filter
    ? translations.filter(
        (t) =>
          (t.key || "").includes(filter) || (t.value || "").includes(filter),
      )
    : translations;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🌐 Traductions éditables</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-3">
        <input
          placeholder="Clé (ex: sidebar.dashboard)"
          value={form.key}
          onChange={(e) => setForm({ ...form, key: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <select
          value={form.locale}
          onChange={(e) => setForm({ ...form, locale: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        >
          {LOCALES.map((l) => (
            <option key={l} value={l}>
              {l.toUpperCase()}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Traduction"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-24"
        />
        <button
          onClick={submit}
          className="bg-brand-green text-white px-4 py-2 rounded"
        >
          Ajouter / Mettre à jour
        </button>
      </div>

      <input
        placeholder="Filtrer..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mb-4"
      />

      <div className="space-y-1">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-gray-800 p-2 rounded shadow flex justify-between items-center text-sm"
          >
            <div>
              <span className="font-mono text-xs text-gray-500">{t.key}</span>
              <span className="mx-2 text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">
                {t.locale.toUpperCase()}
              </span>
              <span>{t.value}</span>
            </div>
            <button
              onClick={() => remove(t.id)}
              className="text-red-500 text-xs"
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
