"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function AdminMenusPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({
    label: "",
    icon: "",
    href: "",
    parentId: "",
    order: 0,
    roles: "ADMIN,COORDINATOR,MEMBER,VISITOR",
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    http
      .get<any[]>("/api/menu-items")
      .then(setItems)
      .catch(() => setItems([]));
  };

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await http.patch(`/api/menu-items/${editItem.id}`, form);
      } else {
        await http.post("/api/menu-items", form);
      }
      setEditItem(null);
      setForm({
        label: "",
        icon: "",
        href: "",
        parentId: "",
        order: 0,
        roles: "ADMIN,COORDINATOR,MEMBER,VISITOR",
      });
      loadItems();
    } catch (err) {
      console.error("Erreur menu:", err);
    }
  };

  const startEdit = (item: any) => {
    setEditItem(item);
    setForm({
      label: item.label,
      icon: item.icon || "",
      href: item.href || "",
      parentId: item.parentId || "",
      order: item.order || 0,
      roles: item.roles || "ADMIN,COORDINATOR,MEMBER,VISITOR",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet élément ?")) return;
    try {
      await http.delete(`/api/menu-items/${id}`);
      loadItems();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📋 Gestion du menu</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 space-y-3">
        <input
          placeholder="Libellé"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          placeholder="Icône (emoji)"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          placeholder="Lien (href)"
          value={form.href}
          onChange={(e) => setForm({ ...form, href: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          placeholder="ID parent (vide si racine)"
          value={form.parentId}
          onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          type="number"
          placeholder="Ordre"
          value={form.order}
          onChange={(e) =>
            setForm({ ...form, order: parseInt(e.target.value) || 0 })
          }
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <input
          placeholder="Rôles (séparés par des virgules)"
          value={form.roles}
          onChange={(e) => setForm({ ...form, roles: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={handleSubmit}
          className="bg-brand-green text-white px-4 py-2 rounded"
        >
          {editItem ? "Modifier" : "Ajouter"}
        </button>
      </div>

      <div className="space-y-2">
        {items
          .filter((i) => !i.parentId)
          .map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 p-3 rounded shadow"
            >
              <div className="flex justify-between items-center">
                <span>
                  {item.icon} {item.label}{" "}
                  <span className="text-xs text-gray-400">({item.href})</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-blue-500 text-xs"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 text-xs"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              {item.children?.length > 0 && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.children.map((child: any) => (
                    <div
                      key={child.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        {child.icon} {child.label}{" "}
                        <span className="text-xs text-gray-400">
                          ({child.href})
                        </span>
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(child)}
                          className="text-blue-500 text-xs"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(child.id)}
                          className="text-red-500 text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
