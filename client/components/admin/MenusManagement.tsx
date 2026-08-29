"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function MenusManagement() {
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    label: "",
    href: "",
    icon: "",
    roles: "MEMBER,COORDINATOR,ADMIN",
    enabled: true,
    order: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    http
      .get<any[]>("/api/menus")
      .then(setItems)
      .catch(() => setItems([]));
  };

  const save = async () => {
    try {
      if (editingId) {
        await http.put(`/api/menus/${editingId}`, newItem);
      } else {
        await http.post("/api/menus", newItem);
      }
      setEditingId(null);
      setNewItem({
        label: "",
        href: "",
        icon: "",
        roles: "MEMBER,COORDINATOR,ADMIN",
        enabled: true,
        order: 0,
      });
      loadItems();
    } catch (err) {
      console.error("Erreur menu:", err);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer ce menu ?")) return;
    try {
      await http.delete(`/api/menus/${id}`);
      loadItems();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setNewItem(item);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestion des menus</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setNewItem({
              label: "",
              href: "",
              icon: "",
              roles: "MEMBER,COORDINATOR,ADMIN",
              enabled: true,
              order: 0,
            });
          }}
          className="bg-brand-green text-white px-4 py-2 rounded"
        >
          + Ajouter
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-2">
        <input
          placeholder="Libellé"
          value={newItem.label}
          onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          placeholder="Lien (href)"
          value={newItem.href}
          onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          placeholder="Icône (emoji)"
          value={newItem.icon}
          onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          placeholder="Rôles (séparés par des virgules)"
          value={newItem.roles}
          onChange={(e) => setNewItem({ ...newItem, roles: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          type="number"
          placeholder="Ordre"
          value={newItem.order}
          onChange={(e) =>
            setNewItem({ ...newItem, order: parseInt(e.target.value) || 0 })
          }
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={newItem.enabled}
            onChange={(e) =>
              setNewItem({ ...newItem, enabled: e.target.checked })
            }
          />{" "}
          Actif
        </label>
        <button
          onClick={save}
          className="bg-brand-green text-white px-4 py-2 rounded"
        >
          {editingId ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 p-3 rounded shadow flex justify-between items-center"
          >
            <div>
              <span className="font-medium">
                {item.icon} {item.label}
              </span>{" "}
              <span className="text-sm text-gray-500">({item.href})</span>
              <span className="text-xs ml-2 text-gray-400">
                {item.enabled ? "✅" : "❌"}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(item)} className="text-blue-500">
                Modifier
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
