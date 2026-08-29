"use client";
import { useEffect, useState } from "react";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import InlineEdit from "@/components/InlineEdit";
import { http } from "@/lib/api";

export default function OrganizationPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [editUnit, setEditUnit] = useState<any>(null);
  const [newUnit, setNewUnit] = useState({
    name: "",
    type: "local",
    parentId: "",
  });
  const [pageTitle, setPageTitle] = useState("🏗 Organisation du mouvement");
  const [showPositionForm, setShowPositionForm] = useState(false);
  const [editPosition, setEditPosition] = useState<any>(null);
  const [newPosition, setNewPosition] = useState({
    title: "",
    memberId: "",
    unitId: "",
  });
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
    fetchUnits();
    fetchMembers();
  }, []);

  const fetchUnits = () => {
    http
      .get<any[]>("/api/organization")
      .then(setUnits)
      .catch(() => setUnits([]));
  };

  const fetchMembers = () => {
    http
      .get<any[]>("/api/admin-users/list")
      .then(setAvailableMembers)
      .catch(() => setAvailableMembers([]));
  };

  const isAdmin =
    user && (user.role === "ADMIN" || user.role === "COORDINATOR");

  const addOrUpdateUnit = async () => {
    try {
      if (editUnit) {
        await http.put(`/api/organization/${editUnit.id}`, newUnit);
      } else {
        await http.post("/api/organization", newUnit);
      }
      setShowUnitForm(false);
      setEditUnit(null);
      setNewUnit({ name: "", type: "local", parentId: "" });
      fetchUnits();
    } catch (err) {
      console.error("Erreur unité:", err);
    }
  };

  const deleteUnit = async (id: string) => {
    if (!confirm("Supprimer cette unité et ses postes ?")) return;
    try {
      await http.delete(`/api/organization/${id}`);
      fetchUnits();
    } catch (err) {
      console.error("Erreur suppression unité:", err);
    }
  };

  const openEditUnit = (unit: any) => {
    setEditUnit(unit);
    setNewUnit({
      name: unit.name,
      type: unit.type,
      parentId: unit.parentId || "",
    });
    setShowUnitForm(true);
  };

  const addOrUpdatePosition = async () => {
    if (!newPosition.title || !newPosition.unitId) return;
    const body = {
      title: newPosition.title,
      memberId: newPosition.memberId || null,
    };
    try {
      if (editPosition) {
        await http.put(
          `/api/organization/positions/${editPosition.id}`,
          body,
        );
      } else {
        await http.post(
          `/api/organization/${newPosition.unitId}/positions`,
          body,
        );
      }
      setShowPositionForm(false);
      setEditPosition(null);
      setNewPosition({ title: "", memberId: "", unitId: "" });
      fetchUnits();
    } catch (err) {
      console.error("Erreur poste:", err);
    }
  };

  const deletePosition = async (id: string) => {
    if (!confirm("Supprimer ce poste ?")) return;
    try {
      await http.delete(`/api/organization/positions/${id}`);
      fetchUnits();
    } catch (err) {
      console.error("Erreur suppression poste:", err);
    }
  };

  const openEditPosition = (pos: any) => {
    setEditPosition(pos);
    setNewPosition({
      title: pos.title,
      memberId: pos.memberId || "",
      unitId: pos.unitId,
    });
    setShowPositionForm(true);
  };

  // Regrouper par type
  const national = units.filter((u) => u.type === "national");
  const regionals = units.filter((u) => u.type === "regional");
  const departementaux = units.filter((u) => u.type === "departemental");
  const communales = units.filter((u) => u.type === "communal");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {isAdmin ? (
          <InlineEdit
            value={pageTitle}
            onSave={setPageTitle}
            className="text-3xl font-bold"
          />
        ) : (
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
        )}
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditUnit(null);
                setNewUnit({ name: "", type: "local", parentId: "" });
                setShowUnitForm(true);
              }}
              className="bg-brand-green text-white px-4 py-2 rounded"
            >
              + Unité
            </button>
            <button
              onClick={() => {
                setEditPosition(null);
                setNewPosition({ title: "", memberId: "", unitId: "" });
                setShowPositionForm(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              + Poste
            </button>
          </div>
        )}
      </div>

      {/* Formulaire unité */}
      {showUnitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editUnit ? "Modifier" : "Ajouter"} une unité
            </h3>
            <div className="space-y-3">
              <input
                placeholder="Nom"
                value={newUnit.name}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, name: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              />
              <select
                value={newUnit.type}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, type: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="national">National</option>
                <option value="regional">Régional</option>
                <option value="departemental">Départemental</option>
                <option value="communal">Communal</option>
              </select>
              <select
                value={newUnit.parentId}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, parentId: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Sans parent --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowUnitForm(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>
              <button
                onClick={addOrUpdateUnit}
                className="px-4 py-2 bg-brand-green text-white rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire poste avec liste déroulante */}
      {showPositionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editPosition ? "Modifier" : "Ajouter"} un poste
            </h3>
            <div className="space-y-3">
              <select
                value={newPosition.title}
                onChange={(e) =>
                  setNewPosition({ ...newPosition, title: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Choisir un titre --</option>
                <option value="Coordinateur">Coordinateur</option>
                <option value="Responsable">Responsable</option>
                <option value="Suppléant">Suppléant</option>
                <option value="Secrétaire Général">Secrétaire Général</option>
                <option value="Autre">Autre (précisez)</option>
              </select>
              {newPosition.title === "Autre" && (
                <input
                  placeholder="Titre personnalisé"
                  onChange={(e) =>
                    setNewPosition({ ...newPosition, title: e.target.value })
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
              )}
              <select
                value={newPosition.unitId}
                onChange={(e) =>
                  setNewPosition({ ...newPosition, unitId: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Choisir l'unité --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.type})
                  </option>
                ))}
              </select>
              <select
                value={newPosition.memberId}
                onChange={(e) =>
                  setNewPosition({ ...newPosition, memberId: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Assigner un membre (optionnel) --</option>
                {availableMembers.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m?.firstName ?? ""} {m?.lastName ?? ""} ({m.region || "N/A"})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowPositionForm(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>
              <button
                onClick={addOrUpdatePosition}
                className="px-4 py-2 bg-brand-green text-white rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Affichage hiérarchique */}
      <div className="space-y-6">
        {/* National */}
        {national.map((n) => (
          <div
            key={n.id}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{n.name} (National)</h2>
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditUnit(n)}
                    className="text-blue-500 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteUnit(n.id)}
                    className="text-red-500 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {n.positions?.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm flex items-center gap-2"
                >
                  <span>{p.title} :</span>
                  {p.member ? (
                    <span className="font-medium">
                      {p.member?.firstName ?? ""} {p.member?.lastName ?? ""}
                    </span>
                  ) : (
                    <span className="text-gray-400">(vacant)</span>
                  )}
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEditPosition(p)}
                        className="text-blue-500 ml-1 text-xs"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deletePosition(p.id)}
                        className="text-red-500 ml-1 text-xs"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Régions */}
        <h3 className="text-lg font-bold mt-4">Régions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionals.map((reg) => (
            <div
              key={reg.id}
              className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl shadow"
            >
              <div className="flex justify-between items-center">
                <p className="font-bold">{reg.name}</p>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditUnit(reg)}
                      className="text-blue-500 text-xs"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteUnit(reg.id)}
                      className="text-red-500 text-xs"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {reg.positions?.map((p: any) => (
                  <div
                    key={p.id}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    {p.title}{" "}
                    {p.member
                      ? `- ${p.member?.firstName ?? ""} ${p.member?.lastName ?? ""}`
                      : ""}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditPosition(p)}
                          className="text-blue-500"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deletePosition(p.id)}
                          className="text-red-500"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Départements */}
        <h3 className="text-lg font-bold mt-4">Départements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {departementaux.map((dep) => (
            <div
              key={dep.id}
              className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl shadow"
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">{dep.name}</p>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditUnit(dep)}
                      className="text-blue-500 text-xs"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteUnit(dep.id)}
                      className="text-red-500 text-xs"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {dep.positions?.map((p: any) => (
                  <div
                    key={p.id}
                    className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    {p.title}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditPosition(p)}
                          className="text-blue-500"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deletePosition(p.id)}
                          className="text-red-500"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Communes */}
        <h3 className="text-lg font-bold mt-4">Communes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {communales.map((com) => (
            <div
              key={com.id}
              className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-xl shadow"
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-sm">{com.name}</p>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditUnit(com)}
                      className="text-blue-500 text-xs"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteUnit(com.id)}
                      className="text-red-500 text-xs"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {com.positions?.map((p: any) => (
                  <div
                    key={p.id}
                    className="bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    {p.title}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditPosition(p)}
                          className="text-blue-500"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deletePosition(p.id)}
                          className="text-red-500"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditableBlockRenderer page="organization" />
    </div>
  );
}
