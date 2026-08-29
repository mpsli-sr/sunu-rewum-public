"use client";
import { useState } from "react";
import WysiwygEditor from "@/components/WysiwygEditor";

interface Candidate {
  id: string;
  name: string;
  country: string;
  theme: string;
  bio?: string;
  status: string;
  votes?: any[];
}

interface Props {
  candidates: Candidate[];
  isAdmin: boolean;
  user: any;
  onVote: (id: string) => void;
  onEdit: (c: any) => void;
  onStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onCreate: (c: any) => void;
}

export default function DiasporaRepresentTab({
  candidates,
  isAdmin,
  user,
  onVote,
  onEdit,
  onStatus,
  onDelete,
  onCreate,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newCand, setNewCand] = useState({
    name: "",
    country: "",
    theme: "",
    bio: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    country: "",
    theme: "",
    bio: "",
  });

  const handleCreate = () => {
    onCreate(newCand);
    setShowForm(false);
    setNewCand({ name: "", country: "", theme: "", bio: "" });
  };

  const startEdit = (c: Candidate) => {
    console.log("startEdit appelé avec", c);
    setEditingId(c.id);
    setEditForm({
      name: c.name,
      country: c.country,
      theme: c.theme,
      bio: c.bio || "",
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    onEdit({ id: editingId, ...editForm });
    setEditingId(null);
  };

  console.log("Rendering, editingId =", editingId); // <-- log de débogage

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          🗳 Candidats aux élections de la diaspora
        </h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
          >
            + Ajouter un candidat
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-4 space-y-2">
          <WysiwygEditor
            value={newCand.bio}
            onChange={(val) => setNewCand({ ...newCand, bio: val })}
          />
          <button
            onClick={handleCreate}
            className="bg-brand-green text-white px-4 py-2 rounded"
          >
            Créer
          </button>
        </div>
      )}

      {/* Modal d'édition */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg w-full space-y-4">
            <h3 className="font-bold text-lg">Modifier le candidat</h3>
            <input
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              value={editForm.country}
              onChange={(e) =>
                setEditForm({ ...editForm, country: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              value={editForm.theme}
              onChange={(e) =>
                setEditForm({ ...editForm, theme: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <div>
              <label className="block text-sm font-medium mb-1">
                Biographie
              </label>
              <WysiwygEditor
                value={editForm.bio}
                onChange={(val) => setEditForm({ ...editForm, bio: val })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingId(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Annuler
              </button>
              <button
                onClick={saveEdit}
                className="bg-brand-green text-white px-4 py-2 rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidates.length === 0 ? (
          <p className="text-gray-500 text-center py-8 col-span-full">
            Aucun candidat pour le moment.
          </p>
        ) : (
          candidates.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{c.name}</p>
                <p className="text-sm text-gray-500">
                  {c.country} - {c.theme}
                </p>
                <p className="text-xs">{c.bio}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Statut : {c.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onVote(c.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  👍 {c.votes?.length || 0}
                </button>
                {isAdmin && (
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs font-medium"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onStatus(c.id, "APPROVED")}
                      className="text-green-700 bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => onStatus(c.id, "REJECTED")}
                      className="text-red-700 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium"
                    >
                      Rejeter
                    </button>
                    <button
                      onClick={() => onStatus(c.id, "INVALIDATED")}
                      className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs font-medium"
                    >
                      Invalider
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="text-red-700 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
