"use client";
import WysiwygEditor from "@/components/WysiwygEditor";
import { useEffect, useState } from "react";
import InlineEditor from "@/components/InlineEditor";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { http } from "@/lib/api";

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    http
      .get<any[]>("/api/recruitment")
      .then(setJobs)
      .catch(() => setJobs([]));
    http
      .get<any>("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const add = async () => {
    if (!title) return;
    const body = {
      title,
      description: desc,
      department,
      location,
      remote,
    };
    try {
      if (editingId) {
        await http.put(`/api/recruitment/${editingId}`, body);
      } else {
        await http.post("/api/recruitment", body);
      }
      setTitle("");
      setDesc("");
      setDepartment("");
      setLocation("");
      setRemote(false);
      setEditingId(null);
      const res = await http.get<any[]>("/api/recruitment");
      setJobs(res);
    } catch (err) {
      console.error("Erreur recrutement:", err);
    }
  };

  const startEdit = (job: any) => {
    setEditingId(job.id);
    setTitle(job.title);
    setDesc(job.description);
    setDepartment(job.department);
    setLocation(job.location);
    setRemote(job.remote);
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Supprimer cette offre ?")) return;
    try {
      await http.delete(`/api/recruitment/${id}`);
      const res = await http.get<any[]>("/api/recruitment");
      setJobs(res);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div>
      <InlineEditor
        initialContent="💼 Recrutement"
        onSave={async () => {}}
        role={user?.role}
        className="text-3xl font-bold mb-6"
        as="h1"
      />
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du poste"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Département"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Lieu"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => setRemote(e.target.checked)}
          />{" "}
          Télétravail
        </label>
        <button
          onClick={add}
          className="bg-brand-green text-white px-6 py-2 rounded"
        >
          {editingId ? "Mettre à jour" : "Publier"}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              setTitle("");
              setDesc("");
            }}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Annuler
          </button>
        )}
      </div>
      <div className="space-y-3">
        {jobs.map((j: any) => (
          <div
            key={j.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between"
          >
            <div>
              <p className="font-medium">{j.title}</p>
              <p className="text-sm text-gray-600">
                {j.department} - {j.location || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                {j.remote ? "Télétravail" : "Présentiel"}
              </p>
            </div>
            {(user?.role === "ADMIN" || user?.role === "COORDINATOR") && (
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(j)}
                  className="text-blue-500 text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => deleteJob(j.id)}
                  className="text-red-500 text-sm"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <EditableBlockRenderer page="recruitment" />
    </div>
  );
}
