"use client";
import { useEffect, useState } from "react";
import WysiwygEditor from "./WysiwygEditor";
import FileUploader from "./FileUploader";
import { http } from "@/lib/api";

function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then((u) => setUser(u))
      .catch(() => setError(true));
  }, []);

  return { user, error };
}

export default function EditableBlockRenderer({ page }: { page: string }) {
  const { user, error } = useCurrentUser();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newBlock, setNewBlock] = useState<any>({});
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const canEdit = user && ["ADMIN", "COORDINATOR"].includes(user.role);

  const loadBlocks = async () => {
    try {
      const data = await http.get<any[]>(`/api/content-blocks/${page}`);
      setBlocks(data || []);
    } catch (err) {
      console.error("Erreur chargement blocs:", err);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, [page]);

  const handleSave = async () => {
    try {
      if (editingBlock) {
        await http.put(`/api/content-blocks/${editingBlock.id}`, newBlock);
      } else {
        await http.post("/api/content-blocks", { ...newBlock, page });
      }
      setShowForm(false);
      setEditingBlock(null);
      setNewBlock({});
      loadBlocks();
    } catch (err) {
      console.error("Erreur sauvegarde bloc:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce bloc ?")) return;
    try {
      await http.delete(`/api/content-blocks/${id}`);
      loadBlocks();
    } catch (err) {
      console.error("Erreur suppression bloc:", err);
    }
  };

  if (error)
    return (
      <p className="text-red-500">⚠️ Impossible de vérifier vos droits.</p>
    );

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Contenu modulable</h2>
        {canEdit && (
          <button
            onClick={() => {
              setEditingBlock(null);
              setNewBlock({});
              setShowForm(true);
            }}
            className="bg-brand-green text-white px-4 py-2 rounded-lg"
          >
            + Ajouter un bloc
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingBlock ? "Modifier" : "Ajouter"} un bloc
            </h3>
            <input
              value={newBlock.title || ""}
              onChange={(e) =>
                setNewBlock({ ...newBlock, title: e.target.value })
              }
              className="w-full p-2 border rounded mb-2"
            />
            <WysiwygEditor
              value={newBlock.content || ""}
              onChange={(c) => setNewBlock({ ...newBlock, content: c })}
            />
            <input
              value={newBlock.imageUrl || ""}
              onChange={(e) =>
                setNewBlock({ ...newBlock, imageUrl: e.target.value })
              }
              className="w-full p-2 border rounded mt-2"
            />
            <FileUploader
              onUpload={(url) => setNewBlock({ ...newBlock, imageUrl: url })}
              accept="image/*"
              label="Upload image"
            />
            <input
              value={newBlock.linkUrl || ""}
              onChange={(e) =>
                setNewBlock({ ...newBlock, linkUrl: e.target.value })
              }
              className="w-full p-2 border rounded mt-2"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brand-green text-white rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow"
          >
            {block.title && <h3 className="font-bold">{block.title}</h3>}
            {block.imageUrl && (
              <img
                src={block.imageUrl}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <div dangerouslySetInnerHTML={{ __html: block.content }} />
            {block.linkUrl && (
              <a
                href={block.linkUrl}
                target="_blank"
                className="text-brand-green hover:underline mt-2 inline-block"
              >
                En savoir plus
              </a>
            )}
            {canEdit && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setEditingBlock(block);
                    setNewBlock(block);
                    setShowForm(true);
                  }}
                  className="text-blue-500 text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(block.id)}
                  className="text-red-500 text-sm"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
