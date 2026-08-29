"use client";
import { useEffect, useState } from "react";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { http } from "@/lib/api";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [user, setUser] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    http.get<any>("/api/auth/me").then(setUser).catch(() => setUser(null));
    loadPosts();
  }, [showArchived]);

  const loadPosts = () => {
    http
      .get<any[]>(`/api/posts${showArchived ? "?archived=true" : ""}`)
      .then(setPosts)
      .catch(() => setPosts([]));
  };

  const addPost = async () => {
    if (!content || !user) return;
    try {
      await http.post("/api/posts", { content, userId: user.id });
      setContent("");
      loadPosts();
    } catch (err) {
      console.error("Erreur ajout post:", err);
    }
  };

  const toggleArchive = async (id: string, current: boolean) => {
    try {
      await http.put(`/api/posts/${id}`, { archived: !current });
      loadPosts();
    } catch (err) {
      console.error("Erreur archivage:", err);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Supprimer ce post ?")) return;
    try {
      await http.delete(`/api/posts/${id}`);
      loadPosts();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const startEdit = (post: any) => {
    setEditId(post.id);
    setContent(post.content);
  };

  const saveEdit = async () => {
    if (!editId || !user) return;
    try {
      await http.put(`/api/posts/${editId}`, { content });
      setEditId(null);
      setContent("");
      loadPosts();
    } catch (err) {
      console.error("Erreur modification:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📰 Fil actualité</h1>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded"
        >
          {showArchived ? "Masquer archivés" : "Voir archivés"}
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={editId ? "Modifier votre post..." : "Quoi de neuf ?"}
          className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white"
          rows={3}
        />
        <button
          onClick={editId ? saveEdit : addPost}
          className="mt-2 bg-brand-green text-white px-6 py-2 rounded"
        >
          {editId ? "Enregistrer" : "Publier"}
        </button>
        {editId && (
          <button
            onClick={() => {
              setEditId(null);
              setContent("");
            }}
            className="ml-2 text-gray-500"
          >
            Annuler
          </button>
        )}
      </div>
      <div className="space-y-4">
        {posts.map((post: any) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {post.user?.firstName ?? ""} {post.user?.lastName ?? ""}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString("fr")}
                </p>
                {post.archived && (
                  <span className="text-xs text-yellow-500">Archivé</span>
                )}
              </div>
              <div className="flex gap-2">
                {user?.role === "ADMIN" && (
                  <button
                    onClick={() => toggleArchive(post.id, post.archived)}
                    className="text-blue-500 text-xs"
                  >
                    {post.archived ? "Désarchiver" : "Archiver"}
                  </button>
                )}
                {user?.id === post.userId && (
                  <>
                    <button
                      onClick={() => startEdit(post)}
                      className="text-blue-500 text-xs"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-red-500 text-xs"
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              {post.content}
            </p>
          </div>
        ))}
      </div>
      <EditableBlockRenderer page="feed" />
    </div>
  );
}
