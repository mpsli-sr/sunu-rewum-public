"use client";
import { useEffect, useState } from "react";
import InlineEditor from "@/components/InlineEditor";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import WysiwygEditor from "@/components/WysiwygEditor";
import { http } from "@/lib/api";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("MEETING");
  const [user, setUser] = useState<any>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    http.get<any>("/api/auth/me").then(setUser).catch(() => setUser(null));
    loadEvents();
  }, [showArchived]);

  const loadEvents = () => {
    http
      .get<any[]>(`/api/events${showArchived ? "?archived=true" : ""}`)
      .then(setEvents)
      .catch(() => setEvents([]));
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setDate("");
    setType("MEETING");
    setEditingId(null);
  };

  const openEdit = (event: any) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDesc(event.description || "");
    setDate(event.date?.slice(0, 10) || "");
    setType(event.type || "MEETING");
  };

  const addOrUpdate = async () => {
    if (!title || !user) return;
    const body: any = { title, description: desc, date, type };

    try {
      if (editingId) {
        await http.patch(`/api/events/${editingId}`, body);
      } else {
        body.creatorId = user.id;
        await http.post("/api/events", body);
      }
      resetForm();
      loadEvents();
    } catch (err) {
      console.error("Erreur événement:", err);
    }
  };

  const archive = async (id: string, archived: boolean) => {
    try {
      await http.patch(`/api/events/${id}`, { archived });
      loadEvents();
    } catch (err) {
      console.error("Erreur archivage:", err);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    try {
      await http.delete(`/api/events/${id}`);
      loadEvents();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const isAdminOrCoordinator =
    user?.role === "ADMIN" || user?.role === "COORDINATOR";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <InlineEditor
          initialContent="📅 Événements"
          onSave={async () => {}}
          role={user?.role}
          className="text-3xl font-bold"
          as="h1"
        />
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-sm"
        >
          {showArchived ? "Masquer archivés" : "Voir archivés"}
        </button>
      </div>

      {isAdminOrCoordinator && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <WysiwygEditor value={desc} onChange={setDesc} />
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          >
            <option value="VIRTUAL">Virtuel</option>
            <option value="PHYSICAL">Physique</option>
            <option value="MEETING">Réunion</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={addOrUpdate}
              className="bg-brand-green text-white px-6 py-2 rounded"
            >
              {editingId ? "Modifier" : "Créer"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {events.map((e: any) => (
          <div
            key={e.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{e.title}</p>
              <div
                className="text-sm prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: e.description || "" }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {new Date(e.date).toLocaleDateString("fr")} - {e.type}
                {e.archived && (
                  <span className="text-yellow-500 ml-2">Archivé</span>
                )}
              </p>
            </div>
            {isAdminOrCoordinator && (
              <div className="flex gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => openEdit(e)}
                  className="text-blue-500 hover:underline text-xs"
                >
                  Modifier
                </button>
                <button
                  onClick={() => archive(e.id, !e.archived)}
                  className="text-yellow-500 hover:underline text-xs"
                >
                  {e.archived ? "Désarchiver" : "Archiver"}
                </button>
                <button
                  onClick={() => deleteEvent(e.id)}
                  className="text-red-500 hover:underline text-xs"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <EditableBlockRenderer page="events" />
    </div>
  );
}
