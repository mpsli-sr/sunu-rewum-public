"use client";
import { useEffect, useState } from "react";
import WysiwygEditor from "@/components/WysiwygEditor";
import { http } from "@/lib/api";

export default function AdminPagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [editPage, setEditPage] = useState<any>(null);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    content: "",
    isPublished: false,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const data = await http.get<any[]>("/api/pages");
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement pages:", err);
    }
  };

  const handleSubmit = async () => {
    if (!form.slug || !form.title) return setMessage("Slug et titre requis");
    try {
      if (editPage) {
        await http.put(`/api/pages/${editPage.id}`, form);
        setMessage("✅ Page modifiée");
      } else {
        await http.post("/api/pages", form);
        setMessage("✅ Page créée");
      }
      setEditPage(null);
      setForm({ slug: "", title: "", content: "", isPublished: false });
      loadPages();
    } catch (err: any) {
      setMessage(err.message || "Erreur");
    }
  };

  const startEdit = (p: any) => {
    setEditPage(p);
    setForm({
      slug: p.slug,
      title: p.title,
      content: p.content || "",
      isPublished: p.isPublished,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette page ?")) return;
    try {
      await http.delete(`/api/pages/${id}`);
      loadPages();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📄 Pages dynamiques</h1>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-3">
        <input
          placeholder="Slug (ex: mon-article)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          placeholder="Titre"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <div>
          <label className="block text-sm font-medium mb-1">Contenu</label>
          <WysiwygEditor
            value={form.content}
            onChange={(val) => setForm({ ...form, content: val })}
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) =>
              setForm({ ...form, isPublished: e.target.checked })
            }
          />
          <span className="text-sm">Publiée</span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="bg-brand-green text-white px-4 py-2 rounded"
          >
            {editPage ? "Modifier" : "Créer"}
          </button>
          {editPage && (
            <button
              onClick={() => {
                setEditPage(null);
                setForm({
                  slug: "",
                  title: "",
                  content: "",
                  isPublished: false,
                });
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {pages.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-gray-800 p-3 rounded shadow flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                {p.title}{" "}
                <span className="text-xs text-gray-400">(/{p.slug})</span>
              </p>
              <p className="text-xs text-gray-500">
                {p.isPublished ? "🟢 Publiée" : "🔴 Brouillon"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(p)}
                className="text-blue-500 text-xs"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-500 text-xs"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
