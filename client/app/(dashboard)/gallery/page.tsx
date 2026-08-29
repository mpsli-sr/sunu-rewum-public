"use client";
import { useEffect, useState } from "react";
import FileUploader from "@/components/FileUploader";
import { http } from "@/lib/api";

export default function GalleryPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("image");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then((u) => {
        if (u) setUser(u);
      })
      .catch(() => setUser(null));
    loadMedia();
  }, []);

  const loadMedia = () => {
    http
      .get<any[]>("/api/media")
      .then(setMedia)
      .catch(() => setMedia([]));
  };

  const addMedia = async () => {
    if (!title || (!url && !type)) return;
    try {
      await http.post("/api/media", { title, url, type });
      setTitle("");
      setUrl("");
      setShowForm(false);
      loadMedia();
    } catch (err) {
      console.error("Erreur ajout média:", err);
    }
  };

  const deleteMedia = async (id: string) => {
    if (!confirm("Supprimer ce média ?")) return;
    try {
      await http.delete(`/api/media/${id}`);
      loadMedia();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const isAdmin =
    user && (user.role === "ADMIN" || user.role === "COORDINATOR");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📸 Galerie</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-brand-green text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            + Ajouter
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          <div className="flex items-center gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL de l'image ou vidéo"
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <FileUploader
              onUpload={(uploadedUrl) => {
                setUrl(uploadedUrl);
              }}
              accept="image/*,video/*"
              label="Upload"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="image">Image</option>
            <option value="video">Vidéo</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={addMedia}
              className="bg-brand-green text-white px-6 py-2 rounded"
            >
              Enregistrer
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item: any) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden relative"
          >
            {item.type === "image" ? (
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/300x200?text=Image+non+disponible";
                }}
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-4xl">🎥</span>
              </div>
            )}
            <div className="p-2">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleDateString("fr")}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => deleteMedia(item.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
