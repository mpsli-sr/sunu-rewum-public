"use client";
import { useEffect, useState } from "react";
import InlineEditor from "@/components/InlineEditor";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import WysiwygEditor from "@/components/WysiwygEditor";
import { http } from "@/lib/api";

export default function ProgramPage() {
  const [measures, setMeasures] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [desc, setDesc] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [newSectionName, setNewSectionName] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [user, setUser] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    http.get<any>("/api/auth/me").then(setUser).catch(() => setUser(null));
    http
      .get<any[]>("/api/program/sections")
      .then(setSections)
      .catch(() => setSections([]));
    http
      .get<any[]>("/api/program")
      .then(setMeasures)
      .catch(() => setMeasures([]));
  }, []);

  const addOrUpdate = async () => {
    const effectiveSectionId = sectionId === "other" ? null : sectionId;
    const body: any = {
      description: desc,
      budgetEstimate: parseFloat(budget) || null,
      timeline,
    };
    if (effectiveSectionId) {
      body.sectionId = effectiveSectionId;
    } else if (newSectionName.trim()) {
      body.newSectionName = newSectionName.trim();
    } else {
      alert(
        "Veuillez choisir un secteur ou entrer un nom pour le nouveau secteur.",
      );
      return;
    }

    if (!desc || !user) return;
    try {
      if (editingId) {
        await http.put(`/api/program/${editingId}`, body);
      } else {
        await http.post("/api/program", body);
      }
      setDesc("");
      setBudget("");
      setTimeline("");
      setEditingId(null);
      setSectionId("");
      setNewSectionName("");
      const res = await http.get<any[]>("/api/program");
      setMeasures(res);
    } catch (err) {
      console.error("Erreur programme:", err);
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setDesc(m.description);
    setBudget(m.budgetEstimate || "");
    setTimeline(m.timeline || "");
    setSectionId(m.sectionId || "");
    setNewSectionName("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDesc("");
    setBudget("");
    setTimeline("");
    setSectionId("");
    setNewSectionName("");
  };

  const del = async (id: string) => {
    try {
      await http.delete(`/api/program/${id}`);
      const res = await http.get<any[]>("/api/program");
      setMeasures(res);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div>
      <InlineEditor
        initialContent="📋 Programme 2029"
        onSave={async () => {}}
        role={user?.role}
        className="text-3xl font-bold mb-6"
        as="h1"
      />
      <button
        onClick={() =>
          window.open("https://sunu-rewum.onrender.com/api/export-pdf/program")
        }
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm mb-4"
      >
        📄 Exporter en PDF
      </button>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-2">
        <WysiwygEditor value={desc} onChange={setDesc} />
        <input
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          placeholder="Échéance"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Budget"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <div>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- Choisir un secteur --</option>
            {sections.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
            <option value="other">➕ Autre (nouveau secteur)</option>
          </select>
          {sectionId === "other" && (
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Nom du nouveau secteur"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mt-2"
            />
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={addOrUpdate}
            className="bg-brand-green text-white px-6 py-2 rounded"
          >
            {editingId ? "Mettre à jour" : "Ajouter"}
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
      <div className="space-y-3">
        {measures.map((m: any) => (
          <div
            key={m.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between"
          >
            <div>
              <div
                className="font-medium"
                dangerouslySetInnerHTML={{ __html: m.description }}
              />
              <p className="text-xs text-gray-500">
                {m.timeline} •{" "}
                {m.budgetEstimate ? m.budgetEstimate + " FCFA" : "-"}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(m)} className="text-blue-500">
                Modifier
              </button>
              <button onClick={() => del(m.id)} className="text-red-500">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
      <EditableBlockRenderer page="program" />
    </div>
  );
}
