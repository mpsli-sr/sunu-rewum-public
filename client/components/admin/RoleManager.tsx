"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function RoleManager() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissionIds: [] as string[],
  });
  const [editingRole, setEditingRole] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = () => {
    http
      .get<any[]>("/api/roles")
      .then(setRoles)
      .catch(() => setRoles([]));
  };

  const loadPermissions = () => {
    http
      .get<any[]>("/api/roles/permissions")
      .then(setPermissions)
      .catch(() => setPermissions([]));
  };

  const saveRole = async () => {
    try {
      if (editingRole) {
        await http.put(`/api/roles/${editingRole.id}`, {
          permissionIds: newRole.permissionIds,
        });
      } else {
        await http.post("/api/roles", newRole);
      }
      setShowForm(false);
      setEditingRole(null);
      setNewRole({ name: "", description: "", permissionIds: [] });
      loadRoles();
    } catch (err) {
      console.error("Erreur rôle:", err);
    }
  };

  const deleteRole = async (id: string) => {
    if (!confirm("Supprimer ce rôle ?")) return;
    try {
      await http.delete(`/api/roles/${id}`);
      loadRoles();
    } catch (err) {
      console.error("Erreur suppression rôle:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestion des rôles personnalisés</h2>
        <button
          onClick={() => {
            setEditingRole(null);
            setNewRole({ name: "", description: "", permissionIds: [] });
            setShowForm(true);
          }}
          className="bg-brand-green text-white px-4 py-2 rounded"
        >
          + Créer un rôle
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {editingRole ? "Modifier" : "Nouveau"} rôle
            </h3>
            <div className="mb-2">
              <p className="font-medium text-sm mb-1">Permissions :</p>
              {permissions.map((p: any) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newRole.permissionIds.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewRole({
                          ...newRole,
                          permissionIds: [...newRole.permissionIds, p.id],
                        });
                      } else {
                        setNewRole({
                          ...newRole,
                          permissionIds: newRole.permissionIds.filter(
                            (id) => id !== p.id,
                          ),
                        });
                      }
                    }}
                  />
                  {p.description || p.name}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>
              <button
                onClick={saveRole}
                className="px-4 py-2 bg-brand-green text-white rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {roles.map((role: any) => (
          <div
            key={role.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{role.name}</p>
              <p className="text-xs text-gray-500">{role.description}</p>
              <div className="flex gap-1 mt-1">
                {role.permissions?.map((rp: any) => (
                  <span
                    key={rp.permissionId}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs"
                  >
                    {rp.permission?.name ?? ""}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingRole(role);
                  setNewRole({
                    name: role.name,
                    description: role.description || "",
                    permissionIds: role.permissions?.map(
                      (p: any) => p.permissionId,
                    ),
                  });
                  setShowForm(true);
                }}
                className="text-blue-500"
              >
                Modifier
              </button>
              <button
                onClick={() => deleteRole(role.id)}
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
