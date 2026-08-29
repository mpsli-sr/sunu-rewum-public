"use client";
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { http } from "@/lib/api";

interface Rubrique {
  id: string;
  slug: string;
  titre: string;
  description?: string;
  icon?: string;
  couleur?: string;
  ordre: number;
  actif: boolean;
  parentId: string | null;
  enfants?: Rubrique[];
}

function SortableRow({
  rubrique,
  onEdit,
  onDelete,
}: {
  rubrique: Rubrique;
  onEdit: (r: Rubrique) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: rubrique.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 p-3 rounded shadow flex justify-between items-center cursor-grab"
    >
      <div>
        <span className="font-medium">
          {rubrique.icon} {rubrique.titre}
        </span>
        <span className="text-xs text-gray-500 ml-2">/{rubrique.slug}</span>
        {!rubrique.actif && (
          <span className="text-xs text-red-500 ml-2">(inactive)</span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(rubrique)}
          className="text-blue-500 text-sm"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(rubrique.id)}
          className="text-red-500 text-sm"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}

export default function RubriquesManager() {
  const [rubriques, setRubriques] = useState<Rubrique[]>([]);
  const [form, setForm] = useState({
    slug: "",
    titre: "",
    description: "",
    icon: "",
    couleur: "",
    ordre: 0,
    actif: true,
    parentId: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await http.get<any[]>("/api/rubriques/all");
    setRubriques(data);
  };

  const handleSubmit = async () => {
    if (!form.slug || !form.titre) return alert("Slug et titre requis");
    try {
      if (editingId) {
        await http.put(`/api/rubriques/${editingId}`, form);
      } else {
        await http.post("/api/rubriques", form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({
        slug: "",
        titre: "",
        description: "",
        icon: "",
        couleur: "",
        ordre: 0,
        actif: true,
        parentId: "",
      });
      load();
    } catch (err) {
      console.error("Erreur rubrique:", err);
    }
  };

  const startEdit = (r: Rubrique) => {
    setEditingId(r.id);
    setForm({
      slug: r.slug,
      titre: r.titre,
      description: r.description || "",
      icon: r.icon || "",
      couleur: r.couleur || "",
      ordre: r.ordre,
      actif: r.actif,
      parentId: r.parentId || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette rubrique ?")) return;
    await http.delete(`/api/rubriques/${id}`);
    load();
  };

  const handleReorder = async (items: Rubrique[]) => {
    setRubriques(items);
    await http.put("/api/rubriques/reorder", {
      items: items.map((r, index) => ({
        id: r.id,
        ordre: index,
        parentId: r.parentId,
      })),
    });
  };

  const onDragEnd = (e: any) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = rubriques.findIndex((r) => r.id === active.id);
    const newIndex = rubriques.findIndex((r) => r.id === over.id);
    handleReorder(arrayMove(rubriques, oldIndex, newIndex));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestion des rubriques</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              slug: "",
              titre: "",
              description: "",
              icon: "",
              couleur: "",
              ordre: 0,
              actif: true,
              parentId: "",
            });
            setShowForm(true);
          }}
          className="bg-brand-green text-white px-4 py-2 rounded"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-md w-full space-y-3">
            <h3 className="text-lg font-bold">
              {editingId ? "Modifier" : "Nouvelle"} rubrique
            </h3>
            <input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              placeholder="Titre"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
            <input
              placeholder="Icône (emoji)"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              placeholder="Couleur (hex)"
              value={form.couleur}
              onChange={(e) => setForm({ ...form, couleur: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <select
              value={form.parentId}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Parent --</option>
              {rubriques
                .filter((r) => r.id !== editingId)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.titre}
                  </option>
                ))}
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.actif}
                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
              />{" "}
              Active
            </label>
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={rubriques.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {rubriques.map((rubrique) => (
              <SortableRow
                key={rubrique.id}
                rubrique={rubrique}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
