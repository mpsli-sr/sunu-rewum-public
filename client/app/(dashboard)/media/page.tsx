"use client";
import WysiwygEditor from "@/components/WysiwygEditor";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { http } from "@/lib/api";

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    isPublished: false,
  });
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then((u) => {
        if (u) setUser(u);
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
    loadArticles();
  }, []);

  const loadArticles = () => {
    http
      .get<any[]>("/api/articles?published=true")
      .then(setArticles)
      .catch((err) => console.warn("Erreur fetch:", err));
  };

  const openNew = () => {
    setEditId(null);
    setForm({ title: "", summary: "", content: "", isPublished: false });
    setShowForm(true);
  };
  const openEdit = (article: any) => {
    setEditId(article.id);
    setForm({
      title: article.title,
      summary: article.summary,
      content: article.content,
      isPublished: article.isPublished,
    });
    setShowForm(true);
  };

  const insertTag = (tag: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart,
      end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const newText = `<${tag}>${selected || ""}</${tag}>`;
    setForm({
      ...form,
      content:
        textarea.value.substring(0, start) +
        newText +
        textarea.value.substring(end),
    });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + newText.length,
        start + newText.length,
      );
    }, 0);
  };

  const saveArticle = async () => {
    if (!user) return;
    const body = { ...form, authorId: user.id };
    try {
      if (editId) {
        await http.put(`/api/articles/${editId}`, body);
      } else {
        await http.post("/api/articles", body);
      }
      setShowForm(false);
      loadArticles();
    } catch (err) {
      console.error("Erreur sauvegarde article:", err);
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      await http.delete(`/api/articles/${id}`);
      loadArticles();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };
  const togglePublish = async (article: any) => {
    try {
      await http.put(`/api/articles/${article.id}`, {
        ...article,
        isPublished: !article.isPublished,
      });
      loadArticles();
    } catch (err) {
      console.error("Erreur publication:", err);
    }
  };

  if (!user) return <div className="p-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📰 Articles & Médias</h1>
        {(user.role === "ADMIN" || user.role === "COORDINATOR") && (
          <button
            onClick={openNew}
            className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Nouvel article
          </button>
        )}
      </div>
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-6 space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Titre"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Résumé"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            rows={2}
          />
          <div className="border rounded dark:border-gray-600">
            <div className="flex gap-1 p-2 bg-gray-100 dark:bg-gray-700">
              <button
                type="button"
                onClick={() => insertTag("strong")}
                className="px-2 py-1 bg-white dark:bg-gray-600 rounded font-bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertTag("em")}
                className="px-2 py-1 bg-white dark:bg-gray-600 rounded italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertTag("u")}
                className="px-2 py-1 bg-white dark:bg-gray-600 rounded underline"
              >
                U
              </button>
              <button
                type="button"
                onClick={() => insertTag("p")}
                className="px-2 py-1 bg-white dark:bg-gray-600 rounded text-xs"
              >
                ¶
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = contentRef.current;
                  if (t) setForm({ ...form, content: form.content + "<br/>" });
                }}
                className="px-2 py-1 bg-white dark:bg-gray-600 rounded text-xs"
              >
                ↩
              </button>
            </div>
            <textarea
              ref={contentRef}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full p-2 border-0 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
            />{" "}
            Publier maintenant
          </label>
          <div className="flex gap-2">
            <button
              onClick={saveArticle}
              className="bg-brand-green text-white px-6 py-2 rounded"
            >
              {editId ? "Mettre à jour" : "Créer"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 dark:bg-gray-600 px-6 py-2 rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {articles.map((article: any) => (
          <div
            key={article.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{article.title}</h2>
                <p className="text-sm text-gray-500 mb-2">{article.summary}</p>
                <div
                  className="text-sm prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Publié le{" "}
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString("fr")
                    : "brouillon"}{" "}
                  {article.isPublished ? " ✅" : " ⚠️ brouillon"}
                </p>
              </div>
              {(user.role === "ADMIN" || user.role === "COORDINATOR") && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openEdit(article)}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => togglePublish(article)}
                    className="text-yellow-500 hover:underline text-sm"
                  >
                    {article.isPublished ? "Dépublier" : "Publier"}
                  </button>
                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <EditableBlockRenderer page="media" />
    </div>
  );
}
