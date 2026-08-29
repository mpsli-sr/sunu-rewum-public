"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

const FIELD_TEMPLATES: Record<string, string> = {
  "Orange Money":
    '[{"name":"phone","label":"Numéro Orange Money","type":"text","required":true}]',
  Wave: '[{"name":"phone","label":"Numéro Wave","type":"text","required":true}]',
  "Carte Bancaire":
    '[{"name":"cardNumber","label":"Numéro de carte","type":"text","required":true},{"name":"expiry","label":"Date d\'expiration (MM/AA)","type":"text","required":true},{"name":"cvv","label":"CVV","type":"text","required":true}]',
  "Virement Bancaire":
    '[{"name":"iban","label":"IBAN","type":"text","required":true},{"name":"bic","label":"BIC","type":"text","required":false}]',
  Crypto:
    '[{"name":"wallet","label":"Adresse de portefeuille","type":"text","required":true},{"name":"network","label":"Réseau","type":"text","required":true}]',
};

export default function PaymentMethodsManager() {
  const [methods, setMethods] = useState<any[]>([]);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    icon: "",
    enabled: true,
    instructions: "",
    fields: [],
    recipientPhone: "",
  });
  const [fieldsText, setFieldsText] = useState("");

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = () => {
    http
      .get<any[]>("/api/payment-methods/admin")
      .then(setMethods)
      .catch(() => setMethods([]));
  };

  const openNew = () => {
    setEditingMethod(null);
    setForm({
      name: "",
      icon: "",
      enabled: true,
      instructions: "",
      fields: [],
      recipientPhone: "",
    });
    setFieldsText("");
    setShowForm(true);
  };

  const openEdit = (method: any) => {
    setEditingMethod(method);
    const fields =
      typeof method.fields === "string"
        ? JSON.parse(method.fields || "[]")
        : method.fields || [];
    setForm({
      ...method,
      fields,
      recipientPhone: method.recipientPhone || "",
    });
    setFieldsText(JSON.stringify(fields, null, 2));
    setShowForm(true);
  };

  const handleFieldsChange = (text: string) => {
    setFieldsText(text);
    try {
      setForm({ ...form, fields: JSON.parse(text) });
    } catch {}
  };

  const applyTemplate = (templateKey: string) => {
    const template = FIELD_TEMPLATES[templateKey];
    if (template) {
      setFieldsText(template);
      try {
        setForm({ ...form, fields: JSON.parse(template) });
      } catch {}
    }
  };

  const save = async () => {
    const payload = {
      name: form.name,
      icon: form.icon,
      enabled: form.enabled,
      instructions: form.instructions,
      fields: form.fields,
      recipientPhone: form.recipientPhone,
    };
    try {
      if (editingMethod) {
        await http.put(`/api/payment-methods/${editingMethod.id}`, payload);
      } else {
        await http.post("/api/payment-methods", payload);
      }
      setShowForm(false);
      loadMethods();
    } catch (err) {
      console.error("Erreur moyen de paiement:", err);
    }
  };

  const deleteMethod = async (id: string) => {
    if (!confirm("Supprimer ?")) return;
    try {
      await http.delete(`/api/payment-methods/${id}`);
      loadMethods();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestion des moyens de paiement</h2>
        <button
          onClick={openNew}
          className="bg-brand-green text-white px-4 py-2 rounded"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingMethod ? "Modifier" : "Ajouter"} un moyen
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nom *</label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="ex: Orange Money"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Icône (emoji)
                </label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="ex: 📱"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) =>
                    setForm({ ...form, enabled: e.target.checked })
                  }
                />
                Actif
              </label>
              <div>
                <label className="block text-sm font-medium">
                  Instructions pour l'utilisateur
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Expliquez comment procéder..."
                  value={form.instructions}
                  onChange={(e) =>
                    setForm({ ...form, instructions: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Numéro de téléphone (bénéficiaire)
                </label>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="ex: +221 77 345 38 89"
                  value={form.recipientPhone || ""}
                  onChange={(e) =>
                    setForm({ ...form, recipientPhone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Champs personnalisés (JSON)
                </label>
                <textarea
                  className="w-full p-2 border rounded font-mono text-sm"
                  placeholder='[{"name":"phone","label":"Numéro","type":"text","required":true}]'
                  value={fieldsText}
                  onChange={(e) => handleFieldsChange(e.target.value)}
                  rows={6}
                />
                <p className="text-xs text-gray-500">
                  Format : tableau d'objets avec name, label, type, required.
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500 mr-2">Modèles :</span>
                  {Object.keys(FIELD_TEMPLATES).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyTemplate(key)}
                      className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>
              <button
                onClick={save}
                className="px-4 py-2 bg-brand-green text-white rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {methods.map((m) => (
          <div
            key={m.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <span className="font-medium">
                {m.icon} {m.name}
              </span>
              <span className="text-xs ml-2">{m.enabled ? "✅" : "❌"}</span>
              {m.recipientPhone && (
                <p className="text-xs text-gray-500">📱 {m.recipientPhone}</p>
              )}
              {m.instructions && (
                <p className="text-xs text-gray-500">
                  {m.instructions.substring(0, 80)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(m)} className="text-blue-500">
                Modifier
              </button>
              <button
                onClick={() => deleteMethod(m.id)}
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
