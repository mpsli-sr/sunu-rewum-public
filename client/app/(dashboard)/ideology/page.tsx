"use client";
import { useEffect, useState } from "react";
import WysiwygEditor from "@/components/WysiwygEditor";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { http } from "@/lib/api";

export default function Page() {
  const [page, setPage] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
    http
      .get<any>("/api/ideology/neutralite-active")
      .then((p) => {
        if (p) {
          setPage(p);
          setEditContent(p.content || "");
        }
      })
      .catch(() =>
        setPage({
          title: "neutralite-active",
          content: "<p>Contenu à venir</p>",
        }),
      );
  }, []);

  const isAdmin =
    user && (user.role === "ADMIN" || user.role === "COORDINATOR");

  const save = async () => {
    try {
      await http.put("/api/ideology/neutralite-active", {
        title: page.title,
        content: editContent,
      });
      setPage({ ...page, content: editContent });
      setEditing(false);
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
    }
  };

  if (!page) return <div className="p-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {editing ? (
            <input
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="border p-1 rounded"
            />
          ) : (
            page.title
          )}
        </h1>
        {isAdmin &&
          (editing ? (
            <div className="flex gap-2">
              <button
                onClick={save}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Modifier
            </button>
          ))}
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-8">
        {editing ? (
          <WysiwygEditor value={editContent} onChange={setEditContent} />
        ) : (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
      </div>
      <EditableBlockRenderer page="neutralite-active" />
    </div>
  );
}
