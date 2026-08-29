"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

const ALL_WIDGETS = ["stats", "memberChart", "events", "posts", "proposals"];

export default function DashboardConfigAdmin() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConfigs = () => {
    setLoading(true);
    http
      .get<any[]>("/api/dashboard-config/all")
      .then((data) => setConfigs(Array.isArray(data) ? data : []))
      .catch(() => setConfigs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const toggleWidget = async (widget: string) => {
    const existing = configs.find((c) => c.widget === widget);
    try {
      if (existing) {
        await http.put(`/api/dashboard-config/${existing.id}`, {
          enabled: !existing.enabled,
          roles: existing.roles,
          order: existing.order,
        });
      } else {
        await http.post("/api/dashboard-config", {
          widget,
          enabled: true,
          roles: "ADMIN,COORDINATOR,MEMBER,VISITOR",
          order: 0,
        });
      }
      loadConfigs();
    } catch (err) {
      console.error("Erreur toggleWidget:", err);
    }
  };

  const updateRoles = async (id: string, roles: string) => {
    const config = configs.find((c) => c.id === id);
    if (!config) return;
    try {
      await http.put(`/api/dashboard-config/${id}`, {
        roles,
        enabled: config.enabled,
        order: config.order,
      });
      loadConfigs();
    } catch (err) {
      console.error("Erreur updateRoles:", err);
    }
  };

  const updateOrder = async (id: string, order: number) => {
    const config = configs.find((c) => c.id === id);
    if (!config) return;
    try {
      await http.put(`/api/dashboard-config/${id}`, {
        order,
        enabled: config.enabled,
        roles: config.roles,
      });
      loadConfigs();
    } catch (err) {
      console.error("Erreur updateOrder:", err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Configurer le tableau de bord</h2>
      {loading && <p>Chargement...</p>}
      <div className="space-y-2">
        {ALL_WIDGETS.map((widget) => {
          const config = configs.find((c) => c.widget === widget) || {
            enabled: false,
            roles: "",
            order: 0,
            id: "",
          };
          return (
            <div
              key={widget}
              className="bg-white dark:bg-gray-800 p-3 rounded shadow flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={() => toggleWidget(widget)}
                />
                <span className="font-medium capitalize">{widget}</span>
                {config.enabled && (
                  <>
                    <input
                      className="p-1 border rounded text-xs"
                      value={config.roles}
                      onChange={(e) => updateRoles(config.id, e.target.value)}
                    />
                    <input
                      type="number"
                      className="p-1 border rounded w-16 text-xs"
                      value={config.order}
                      onChange={(e) =>
                        updateOrder(config.id, parseInt(e.target.value) || 0)
                      }
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
