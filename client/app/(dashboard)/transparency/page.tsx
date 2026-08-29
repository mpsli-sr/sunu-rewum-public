"use client";
import WysiwygEditor from "@/components/WysiwygEditor";
import { useEffect, useState } from "react";
import InlineEditor from "@/components/InlineEditor";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import { http } from "@/lib/api";

export default function TransparencyPage() {
  const [data, setData] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("corruption");
  const [reportMsg, setReportMsg] = useState("");

  useEffect(() => {
    http
      .get<any>("/api/transparency")
      .then(setData)
      .catch((err) => console.warn("Erreur fetch:", err));
    http
      .get<any>("/api/auth/me")
      .then(setUser)
      .catch((err) => console.warn("Erreur fetch:", err));
  }, []);

  const submitReport = async () => {
    if (!desc) return;
    try {
      await http.post("/api/reports", {
        description: desc,
        category,
        anonymous: true,
      });
      setDesc("");
      setCategory("corruption");
      setReportMsg("Signalement envoyé. Merci.");
      setTimeout(() => setReportMsg(""), 5000);
    } catch (err) {
      console.error("Erreur signalement:", err);
    }
  };

  return (
    <div>
      <InlineEditor
        initialContent="🛡️ Transparence & Lutte contre la corruption"
        onSave={async () => {}}
        role={user?.role}
        className="text-3xl font-bold mb-6"
        as="h1"
      />
      <button
        onClick={() =>
          window.open(
            "https://sunu-rewum.onrender.com/api/export-pdf/transparency",
          )
        }
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm mb-4"
      >
        📄 Exporter en PDF
      </button>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-green-600">
            {data.totalDonations
              ? (data.totalDonations / 1000000).toFixed(1) + " M"
              : "0"}{" "}
            FCFA
          </p>
          <p className="text-gray-500">Dons collectés</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-red-600">
            {data.totalExpenses
              ? (data.totalExpenses / 1000000).toFixed(1) + " M"
              : "0"}{" "}
            FCFA
          </p>
          <p className="text-gray-500">Dépenses</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {data.reportsCount || 0}
          </p>
          <p className="text-gray-500">Signalements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">📢 Signaler un abus</h2>
          <p className="text-sm text-gray-500 mb-4">
            Votre anonymat est préservé.
          </p>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Décrivez les faits..."
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mb-2"
            rows={4}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mb-2"
          >
            <option value="corruption">Corruption</option>
            <option value="abus">Abus de pouvoir</option>
            <option value="autre">Autre</option>
          </select>
          <button
            onClick={submitReport}
            className="bg-brand-green text-white px-4 py-2 rounded"
          >
            Envoyer
          </button>
          {reportMsg && <p className="text-green-600 mt-2">{reportMsg}</p>}
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">📊 Comptes publics</h2>
          <p className="text-sm text-gray-500">
            Rapports téléchargeables (PDF) à venir.
          </p>
        </div>
      </div>
      <EditableBlockRenderer page="transparency" />
    </div>
  );
}
