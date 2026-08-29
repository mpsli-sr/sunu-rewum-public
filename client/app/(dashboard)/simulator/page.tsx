"use client";
import { useEffect, useState } from "react";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { http } from "@/lib/api";

export default function SimulatorPage() {
  const [user, setUser] = useState<any>(null);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [result, setResult] = useState<any>(null);
  const [editingMinistry, setEditingMinistry] = useState<any>(null);
  const [verifyMode, setVerifyMode] = useState(false);

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
    http
      .get<any[]>("/api/simulator/ministries")
      .then(setMinistries)
      .catch(() => setMinistries([]));
    http
      .get<any[]>("/api/simulator")
      .then(setScenarios)
      .catch(() => setScenarios([]));
  }, []);

  const isAdmin = user && user.role === "ADMIN";

  const addMinistry = async () => {
    if (!name || !isAdmin) return;
    try {
      await http.post("/api/simulator/ministries", {
        name,
        budget: parseFloat(budget) || 0,
      });
      setName("");
      setBudget("");
      const res = await http.get<any[]>("/api/simulator/ministries");
      setMinistries(res);
    } catch (err) {
      console.error("Erreur ajout ministère:", err);
    }
  };

  const deleteMinistry = async (id: string) => {
    try {
      await http.delete(`/api/simulator/ministries/${id}`);
      setMinistries(ministries.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const startEdit = (m: any) => {
    setEditingMinistry(m);
    setName(m.name);
    setBudget(m.budget.toString());
  };

  const updateMinistry = async () => {
    if (!editingMinistry || !isAdmin) return;
    try {
      await http.put(
        `/api/simulator/ministries/${editingMinistry.id}`,
        { name, budget: parseFloat(budget) || 0 },
      );
      setEditingMinistry(null);
      setName("");
      setBudget("");
      const res = await http.get<any[]>("/api/simulator/ministries");
      setMinistries(res);
    } catch (err) {
      console.error("Erreur modification:", err);
    }
  };

  const simulate = async () => {
    const actions = ministries.map((m) => ({ id: m.id, budget: m.budget }));
    try {
      const data = await http.post<any>("/api/simulator", {
        actions,
        userId: user.id,
      });
      setResult(data);
      const res = await http.get<any[]>("/api/simulator");
      setScenarios(res);
    } catch (err) {
      console.error("Erreur simulation:", err);
    }
  };

  const deleteScenario = async (id: string) => {
    if (!confirm("Supprimer ce scénario ?")) return;
    try {
      await http.delete(`/api/simulator/${id}`);
      const res = await http.get<any[]>("/api/simulator");
      setScenarios(res);
    } catch (err) {
      console.error("Erreur suppression scénario:", err);
    }
  };

  const exportCSV = () => {
    const csv = ["Ministère,Budget (Mrd FCFA)"]
      .concat(ministries.map((m) => `${m.name},${m.budget}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simulateur.csv";
    a.click();
  };

  const verifyBudgets = () => {
    const total = ministries.reduce((s, m) => s + m.budget, 0);
    alert(
      `Budget total : ${total} Mrd FCFA\n${
        total > 3000
          ? "Budget dépassant les prévisions"
          : "Budget acceptable"
      }`,
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🏛️ Simulateur Ministériel</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Portefeuilles</h2>
          <div className="space-y-2 mb-4">
            {ministries.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-gray-800 p-3 rounded shadow flex justify-between items-center"
              >
                {editingMinistry?.id === m.id ? (
                  <>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border p-1 rounded flex-1 mr-2"
                    />
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-20 border p-1 rounded mr-2"
                    />
                    <button
                      onClick={updateMinistry}
                      className="text-green-500"
                    >
                      ✔
                    </button>
                    <button
                      onClick={() => setEditingMinistry(null)}
                      className="text-red-500"
                    >
                      ✘
                    </button>
                  </>
                ) : (
                  <>
                    <span>{m.name}</span>
                    <span className="text-sm">{m.budget} Mrd FCFA</span>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(m)}
                          className="text-blue-500"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteMinistry(m.id)}
                          className="text-red-500"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mb-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom ministère"
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Budget"
              className="w-24 p-2 border rounded"
            />
            <button
              onClick={addMinistry}
              className="bg-brand-green text-white px-3 py-2 rounded"
            >
              Ajouter
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={simulate}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Simuler
            </button>
            <button
              onClick={exportCSV}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Exporter CSV
            </button>
            <button
              onClick={verifyBudgets}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Vérifier budget
            </button>
          </div>
          {result && (
            <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <p>
                Budget optimisé estimé :{" "}
                <strong>{result.optimizedBudget} Mrd FCFA</strong>
              </p>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">📋 Scénarios enregistrés</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {scenarios.map((s: any) => (
              <div
                key={s.id}
                className="bg-white dark:bg-gray-800 p-3 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString("fr")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      alert(
                        "Détail : " +
                          JSON.stringify(JSON.parse(s.actions), null, 2),
                      )
                    }
                    className="text-blue-500 text-sm"
                  >
                    Voir
                  </button>
                  <button
                    onClick={() => deleteScenario(s.id)}
                    className="text-red-500 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <EditableBlockRenderer page="simulator" />
    </div>
  );
}
