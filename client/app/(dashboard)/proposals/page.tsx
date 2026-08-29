"use client";
import { useEffect, useState } from "react";
import WysiwygEditor from "@/components/WysiwygEditor";
import { http } from "@/lib/api";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [theme, setTheme] = useState("Éducation");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    http.get<any>("/api/auth/me").then(setUser).catch(() => setUser(null));
    loadProposals();
  }, []);

  const loadProposals = () => {
    http
      .get<any[]>("/api/proposals")
      .then(setProposals)
      .catch(() => setProposals([]));
  };

  const submitProposal = async () => {
    if (!title || !user) return;
    const body = {
      title,
      description: desc,
      theme,
      userId: user.id,
    };
    try {
      if (editingId) {
        await http.put(`/api/proposals/${editingId}`, body);
      } else {
        await http.post("/api/proposals", body);
      }
      setTitle("");
      setDesc("");
      setEditingId(null);
      loadProposals();
    } catch (err) {
      console.error("Erreur proposition:", err);
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDesc(p.description);
    setTheme(p.theme);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDesc("");
  };

  const deleteProposal = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    try {
      await http.delete(`/api/proposals/${id}`);
      loadProposals();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const toggleVote = async (id: string) => {
    try {
      await http.post("/api/proposals/vote", { proposalId: id, userId: user.id });
      loadProposals();
    } catch (err) {
      console.error("Erreur vote:", err);
    }
  };

  if (!user) return <div className="p-8">Chargement...</div>;

  const isAdmin = user.role === "ADMIN" || user.role === "COORDINATOR";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">💡 Propositions citoyennes</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="w-full p-2 border rounded"
        />
        <WysiwygEditor value={desc} onChange={setDesc} />
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option>Éducation</option>
          <option>Santé</option>
          <option>Économie</option>
          <option>Agriculture</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={submitProposal}
            className="bg-brand-green text-white px-6 py-2 rounded"
          >
            {editingId ? "Mettre à jour" : "Proposer"}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
      <div className="space-y-4">
        {proposals.map((p: any) => (
          <div
            key={p.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between"
          >
            <div>
              <h2 className="font-bold text-lg">{p.title}</h2>
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: p.description }}
              />
              <p className="text-xs text-gray-500">
                Thème: {p.theme} • Statut: {p.status}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => toggleVote(p.id)}
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded"
              >
                👍 {p.votes?.length || 0}
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => startEdit(p)}
                    className="text-blue-500 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteProposal(p.id)}
                    className="text-red-500 text-sm"
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
