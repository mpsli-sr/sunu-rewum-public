"use client";
import { useEffect, useState } from "react";
import InlineEditor from "@/components/InlineEditor";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { http } from "@/lib/api";

export default function GovernmentPage() {
  const [ministries, setMinistries] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [newMinistry, setNewMinistry] = useState({
    name: "",
    budget: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
    http
      .get<any[]>("/api/ministries")
      .then(setMinistries)
      .catch(() => setMinistries([]));
  }, []);

  const isAdmin =
    user && (user.role === "ADMIN" || user.role === "COORDINATOR");

  const handleSubmit = async () => {
    const body = {
      name: newMinistry.name,
      budget: parseFloat(newMinistry.budget) || 0,
      description: newMinistry.description,
    };
    try {
      if (editingId) {
        await http.put(`/api/ministries/${editingId}`, body);
      } else {
        await http.post("/api/ministries", body);
      }
      setShowForm(false);
      setEditingId(null);
      setNewMinistry({ name: "", budget: "", description: "" });
      const res = await http.get<any[]>("/api/ministries");
      setMinistries(res);
    } catch (err) {
      console.error("Erreur ministère:", err);
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setNewMinistry({
      name: m.name,
      budget: String(m.budget),
      description: m.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce ministère ?")) return;
    try {
      await http.delete(`/api/ministries/${id}`);
      const res = await http.get<any[]>("/api/ministries");
      setMinistries(res);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  if (!user) return <div className="p-8">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <InlineEditor
          initialContent="🏛️ Gouvernement"
          onSave={async () => {}}
          role={user?.role}
          className="text-3xl font-bold"
          as="h1"
        />
        {isAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setNewMinistry({ name: "", budget: "", description: "" });
              setShowForm(true);
            }}
            className="bg-brand-green text-white px-4 py-2 rounded"
          >
            + Ajouter un ministère
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg w-full space-y-4">
            <h3 className="text-xl font-bold">
              {editingId ? "Modifier" : "Ajouter"} un ministère
            </h3>
            <input
              placeholder="Nom du ministère"
              value={newMinistry.name}
              onChange={(e) =>
                setNewMinistry({ ...newMinistry, name: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <input
              type="number"
              placeholder="Budget"
              value={newMinistry.budget}
              onChange={(e) =>
                setNewMinistry({ ...newMinistry, budget: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <textarea
              placeholder="Description"
              value={newMinistry.description}
              onChange={(e) =>
                setNewMinistry({ ...newMinistry, description: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-24"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-brand-green text-white rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ministries.map((m) => (
          <div
            key={m.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold">{m.name}</h2>
              {isAdmin && (
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => startEdit(m)}
                    className="text-blue-500"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-red-500"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Budget : {m.budget ? `${m.budget}€` : "Non défini"}
            </p>
            {m.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {m.description}
              </p>
            )}
            {m.directors?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Directeurs :
                </p>
                <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400">
                  {m.directors.map((d: any) => (
                    <li key={d.id}>
                      {d.name} – {d.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <EditableBlockRenderer page="government" />
    </div>
  );
}
