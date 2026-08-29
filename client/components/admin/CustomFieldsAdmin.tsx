"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function CustomFieldsAdmin() {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editField, setEditField] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    label: "",
    fieldType: "text",
    options: "",
    required: false,
    visibleAtRegistration: false,
    order: 0,
    enabled: true,
  });

  const loadFields = () => {
    setLoading(true);
    http
      .get<any[]>("/api/custom-fields")
      .then((data) => setFields(Array.isArray(data) ? data : []))
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleSave = async () => {
    try {
      if (editField) {
        await http.put(`/api/custom-fields/${editField.id}`, form);
      } else {
        await http.post("/api/custom-fields", form);
      }
      setShowForm(false);
      setEditField(null);
      setForm({
        name: "",
        label: "",
        fieldType: "text",
        options: "",
        required: false,
        visibleAtRegistration: false,
        order: 0,
        enabled: true,
      });
      loadFields();
    } catch (err) {
      console.error("Erreur champ personnalisé:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Supprimer ce champ ? Toutes les valeurs associées seront perdues.",
      )
    )
      return;
    try {
      await http.delete(`/api/custom-fields/${id}`);
      loadFields();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const startEdit = (field: any) => {
    setEditField(field);
    setForm(field);
    setShowForm(true);
  };

  const startNew = () => {
    setEditField(null);
    setForm({
      name: "",
      label: "",
      fieldType: "text",
      options: "",
      required: false,
      visibleAtRegistration: false,
      order: 0,
      enabled: true,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Champs personnalisés du profil</h2>
        <button
          onClick={startNew}
          className="bg-brand-green text-white px-4 py-2 rounded"
        >
          + Ajouter un champ
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">
              {editField ? "Modifier le champ" : "Nouveau champ"}
            </h3>
            <div className="space-y-3">
              <select
                className="w-full p-2 border rounded"
                value={form.fieldType}
                onChange={(e) =>
                  setForm({ ...form, fieldType: e.target.value })
                }
              >
                <option value="text">Texte</option>
                <option value="number">Nombre</option>
                <option value="date">Date</option>
                <option value="select">Liste déroulante</option>
                <option value="checkbox">Case à cocher</option>
                <option value="textarea">Zone de texte</option>
              </select>
              {form.fieldType === "select" && (
                <input
                  type="text"
                  value={form.options}
                  onChange={(e) =>
                    setForm({ ...form, options: e.target.value })
                  }
                  placeholder="Options séparées par des virgules"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                />
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.required}
                  onChange={(e) =>
                    setForm({ ...form, required: e.target.checked })
                  }
                />{" "}
                Obligatoire
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.visibleAtRegistration}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      visibleAtRegistration: e.target.checked,
                    })
                  }
                />{" "}
                Visible à l'inscription
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) =>
                    setForm({ ...form, enabled: e.target.checked })
                  }
                />{" "}
                Activé
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-brand-green text-white rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <p>Chargement...</p>}
      <div className="space-y-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <span className="font-medium">{field.label}</span>{" "}
              <span className="text-xs text-gray-500">({field.fieldType})</span>
              <span className="text-xs ml-2">
                {field.required ? "⚠️ Obligatoire" : ""}
              </span>
              <span className="text-xs ml-2">
                {field.enabled ? "✅" : "❌"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(field)}
                className="text-blue-500"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(field.id)}
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
