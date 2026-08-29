"use client";
import { useEffect, useState } from "react";
import InlineEditor from "@/components/InlineEditor";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import DiasporaRepresentTab from "@/components/DiasporaRepresentTab";
import WysiwygEditor from "@/components/WysiwygEditor";
import { http } from "@/lib/api";

const DIASPORA_POSTES = [
  { value: "representant_diaspora_france", label: "Représentant Diaspora – France" },
  { value: "representant_diaspora_usa", label: "Représentant Diaspora – États‑Unis" },
  { value: "representant_diaspora_italie", label: "Représentant Diaspora – Italie" },
  { value: "delegue_diaspora_europe", label: "Délégué Diaspora – Europe" },
  { value: "delegue_diaspora_amerique", label: "Délégué Diaspora – Amériques" },
  { value: "delegue_diaspora_afrique", label: "Délégué Diaspora – Afrique (hors Sénégal)" },
  { value: "delegue_diaspora_asie", label: "Délégué Diaspora – Asie" },
  { value: "coordinateur", label: "Coordinateur (Sénégal)" },
  { value: "responsable_regional", label: "Responsable Régional (Sénégal)" },
  { value: "responsable_departemental", label: "Responsable Départemental (Sénégal)" },
  { value: "responsable_communal", label: "Responsable Communal (Sénégal)" },
];

const PAYS = [
  "Sénégal", "France", "États-Unis", "Italie", "Espagne", "Allemagne",
  "Royaume-Uni", "Canada", "Belgique", "Suisse", "Portugal",
  "Afrique du Sud", "Maroc", "Tunisie", "Mauritanie", "Mali",
  "Côte d'Ivoire", "Autre",
];

const REGIONS_SENEGAL = [
  "Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack", "Touba",
  "Diourbel", "Fatick", "Louga", "Tambacounda", "Kolda", "Matam",
  "Sédhiou", "Kaffrine", "Kédougou",
];

export default function DiasporaPage() {
  const [tab, setTab] = useState("return");
  const [user, setUser] = useState<any>(null);
  const [intents, setIntents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [ministries, setMinistries] = useState<any[]>([]);
  const [form, setForm] = useState({
    country: "",
    profession: "",
    intention: "",
    date: "",
    capital: "",
  });
  const [candidPoste, setCandidPoste] = useState("representant_diaspora_france");
  const [candidZone, setCandidZone] = useState("");
  const [candidMotivation, setCandidMotivation] = useState("");
  const [candidMsg, setCandidMsg] = useState("");
  const [candidLoading, setCandidLoading] = useState(false);
  const [mesCandidatures, setMesCandidatures] = useState<any[]>([]);
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [regionSelect, setRegionSelect] = useState("");
  const [customRegion, setCustomRegion] = useState("");
  const [editingMinistry, setEditingMinistry] = useState<any>(null);
  const [editingIntent, setEditingIntent] = useState<any>(null);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);

  const isDiasporaPoste = (posteValue: string) =>
    posteValue.startsWith("representant_diaspora") ||
    posteValue.startsWith("delegue_diaspora");

  const candidIsDiaspora = isDiasporaPoste(candidPoste);

  useEffect(() => {
    // Auth
    http
      .get<any>("/api/auth/me")
      .then((u) => {
        if (u) {
          setUser(u);
          setPhone(u.phone || "");
          const userRegion = u.region || "";
          if (PAYS.includes(userRegion)) {
            setRegionSelect(userRegion);
            setRegion(userRegion);
          } else if (userRegion) {
            setRegionSelect("other");
            setCustomRegion(userRegion);
            setRegion(userRegion);
          }
        }
      })
      .catch(() => setUser(null));

    // Intentions
    http
      .get<any[]>("/api/diaspora")
      .then((d) => setIntents(Array.isArray(d) ? d : []))
      .catch(() => setIntents([]));

    // Candidats
    http
      .get<any[]>("/api/diaspora-candidates")
      .then((d) => setCandidates(Array.isArray(d) ? d : []))
      .catch(() => setCandidates([]));

    // Ministères
    http
      .get<any[]>("/api/ministries")
      .then((d) => setMinistries(Array.isArray(d) ? d : []))
      .catch(() => setMinistries([]));

    // Mes candidatures
    http
      .get<any[]>("/api/candidatures/me")
      .then((d) => setMesCandidatures(d || []))
      .catch(() => setMesCandidatures([]));
  }, []);

  const addIntent = async () => {
    if (!form.country || !user) return;
    try {
      await http.post("/api/diaspora", {
        ...form,
        capital: parseFloat(form.capital) || null,
        userId: user.id,
      });
      setForm({ country: "", profession: "", intention: "", date: "", capital: "" });
      const res = await http.get<any[]>("/api/diaspora");
      setIntents(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Erreur addIntent:", err);
    }
  };

  const addCandidate = async (candidateData: any) => {
    if (!candidateData.name || !user || (user.role !== "ADMIN" && user.role !== "COORDINATOR")) return;
    const nameParts = candidateData.name.split(" ");
    const firstName = nameParts[0] || "Prénom";
    const lastName = nameParts.slice(1).join(" ") || "Nom";
    try {
      await http.post("/api/diaspora-candidates", {
        firstName,
        lastName,
        country: candidateData.country,
        theme: candidateData.theme,
        bio: candidateData.bio,
        userId: user.id,
      });
      const res = await http.get<any[]>("/api/diaspora-candidates");
      setCandidates(res);
    } catch (err) {
      console.error("Erreur addCandidate:", err);
    }
  };

  const toggleVote = async (candidateId: string) => {
    if (!user) return;
    try {
      await http.post("/api/diaspora-candidates/vote", { candidateId, userId: user.id });
      const res = await http.get<any[]>("/api/diaspora-candidates");
      setCandidates(res);
    } catch (err) {
      console.error("Erreur toggleVote:", err);
    }
  };

  const isAdmin =
    user &&
    (user.role === "ADMIN" ||
      user.role === "COORDINATOR" ||
      user.email === "mpsli_adm@proton.me");

  const submitDiasporaCandidature = async () => {
    if (!phone.trim()) { setCandidMsg("Veuillez renseigner votre téléphone."); return; }
    if (!region.trim()) {
      setCandidMsg(candidIsDiaspora ? "Veuillez renseigner votre pays de résidence." : "Veuillez renseigner votre région.");
      return;
    }
    if (!candidPoste || !candidMotivation) { setCandidMsg("Veuillez remplir tous les champs obligatoires."); return; }
    setCandidLoading(true);
    try {
      await http.put("/api/user/me", { phone, region });
      const res = await http.post<any>("/api/candidatures", {
        poste: candidPoste,
        zone: candidZone || null,
        motivation: candidMotivation,
      });
      if (res.ok) {
        setCandidMsg("✅ Candidature envoyée !");
        setCandidPoste("representant_diaspora_france");
        setCandidZone("");
        setCandidMotivation("");
        const myCand = await http.get<any[]>("/api/candidatures/me");
        setMesCandidatures(myCand || []);
      } else {
        setCandidMsg(res.message || "Erreur");
      }
    } catch (err: any) {
      setCandidMsg(err.message || "Erreur");
    } finally {
      setCandidLoading(false);
      setTimeout(() => setCandidMsg(""), 5000);
    }
  };

  const handleEditCandidate = async (candidate: any) => {
    const { id, name, country, theme, bio } = candidate;
    const nameParts = (name || "").split(" ");
    const firstName = nameParts[0] || "Prénom";
    const lastName = nameParts.slice(1).join(" ") || "Nom";
    try {
      await http.patch(`/api/diaspora-candidates/${id}`, { firstName, lastName, country, theme, bio });
      const res = await http.get<any[]>("/api/diaspora-candidates");
      setCandidates(res);
    } catch (err) { console.error("Erreur handleEditCandidate:", err); }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await http.put(`/api/diaspora-candidates/${id}/status`, { status });
      const res = await http.get<any[]>("/api/diaspora-candidates");
      setCandidates(res);
    } catch (err) { console.error("Erreur handleStatus:", err); }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm("Supprimer ce candidat ?")) return;
    try {
      await http.delete(`/api/diaspora-candidates/${id}`);
      const res = await http.get<any[]>("/api/diaspora-candidates");
      setCandidates(res);
    } catch (err) { console.error("Erreur handleDeleteCandidate:", err); }
  };

  const refreshMinistries = async () => {
    const res = await http.get<any[]>("/api/ministries");
    setMinistries(res);
  };

  const startAddMinistry = () => setEditingMinistry({ name: "", budget: "", description: "" });
  const startEditMinistry = (m: any) => setEditingMinistry({ ...m });

  const saveMinistry = async () => {
    if (!editingMinistry) return;
    const { id, name, budget, description } = editingMinistry;
    const body = { name, budget: parseFloat(budget) || 0, description };
    try {
      if (id) await http.put(`/api/ministries/${id}`, body);
      else await http.post("/api/ministries", body);
      setEditingMinistry(null);
      refreshMinistries();
    } catch (err) { console.error("Erreur saveMinistry:", err); }
  };

  const handleDeleteMinistry = async (id: string) => {
    if (!confirm("Supprimer ce ministère ?")) return;
    try {
      await http.delete(`/api/ministries/${id}`);
      refreshMinistries();
    } catch (err) { console.error("Erreur handleDeleteMinistry:", err); }
  };

  const handleAddDirector = async (ministryId: string) => {
    const name = prompt("Nom du directeur"); if (!name) return;
    const title = prompt("Titre") || "";
    const email = prompt("Email") || "";
    const phone = prompt("Téléphone") || "";
    try {
      await http.post(`/api/ministries/${ministryId}/directors`, { name, title, email, phone });
      refreshMinistries();
    } catch (err) { console.error("Erreur handleAddDirector:", err); }
  };

  const handleEditDirector = async (id: string, current: any) => {
    const name = prompt("Nom", current.name) || current.name;
    const title = prompt("Titre", current.title) || "";
    const email = prompt("Email", current.email) || "";
    const phone = prompt("Téléphone", current.phone) || "";
    try {
      await http.put(`/api/ministries/directors/${id}`, { name, title, email, phone });
      refreshMinistries();
    } catch (err) { console.error("Erreur handleEditDirector:", err); }
  };

  const handleDeleteDirector = async (id: string) => {
    if (!confirm("Supprimer ce directeur ?")) return;
    try {
      await http.delete(`/api/ministries/directors/${id}`);
      refreshMinistries();
    } catch (err) { console.error("Erreur handleDeleteDirector:", err); }
  };

  if (!user) return <div className="p-8">Chargement...</div>;

  const deleteIntent = async (id: string) => {
    if (!confirm("Supprimer cette intention ?")) return;
    try {
      await http.delete(`/api/diaspora/${id}`);
      const res = await http.get<any[]>("/api/diaspora");
      setIntents(Array.isArray(res) ? res : []);
    } catch (err) { console.error("Erreur deleteIntent:", err); }
  };

  const startEditIntent = (intent: any) => setEditingIntent(intent);

  const saveIntent = async () => {
    if (!editingIntent) return;
    const { id, country, profession, intention, date, capital } = editingIntent;
    try {
      await http.put(`/api/diaspora/${id}`, {
        country,
        profession,
        intention,
        date,
        capital: parseFloat(capital) || null,
      });
      setEditingIntent(null);
      const res = await http.get<any[]>("/api/diaspora");
      setIntents(Array.isArray(res) ? res : []);
    } catch (err) { console.error("Erreur saveIntent:", err); }
  };

  const startEditCandidate = (candidate: any) => setEditingCandidate(candidate);

  const saveCandidateEdit = async () => {
    if (!editingCandidate) return;
    const { id, name, country, theme, bio } = editingCandidate;
    const nameParts = (name || "").split(" ");
    const firstName = nameParts[0] || "Prénom";
    const lastName = nameParts.slice(1).join(" ") || "Nom";
    try {
      await http.patch(`/api/diaspora-candidates/${id}`, { firstName, lastName, country, theme, bio });
      setEditingCandidate(null);
      const res = await http.get<any[]>("/api/diaspora-candidates");
      setCandidates(res);
    } catch (err) { console.error("Erreur saveCandidateEdit:", err); }
  };

  return (
    <div>
      <InlineEditor
        initialContent="🌍 Portail Diaspora"
        onSave={async () => {}}
        role={user?.role}
        className="text-3xl font-bold mb-6"
        as="h1"
      />
      <p className="text-xs text-red-500">DEBUG - Rôle: {user?.role} | isAdmin: {String(isAdmin)}</p>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("return")} className={`px-4 py-2 rounded ${tab === "return" ? "bg-brand-green text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}>🏠 Je rentre</button>
        <button onClick={() => setTab("represent")} className={`px-4 py-2 rounded ${tab === "represent" ? "bg-brand-green text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}>🗳 Je représente</button>
        <button onClick={() => setTab("manage")} className={`px-4 py-2 rounded ${tab === "manage" ? "bg-brand-green text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}>⚙️ Je gère</button>
        <button onClick={() => setTab("candidater")} className={`px-4 py-2 rounded ${tab === "candidater" ? "bg-brand-green text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}>📝 Candidater</button>
      </div>

      {tab === "return" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-4">🏠 Exprimez votre retour</h2>
            <div className="space-y-3">
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Pays de résidence" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="Profession" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <textarea value={form.intention} onChange={(e) => setForm({ ...form, intention: e.target.value })} placeholder="Intention de retour" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-24" />
              <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <input type="number" value={form.capital} onChange={(e) => setForm({ ...form, capital: e.target.value })} placeholder="Capital estimé (€)" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <button onClick={addIntent} className="w-full bg-brand-green text-white px-4 py-2 rounded">Soumettre</button>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">📋 Intentions reçues</h2>
            <div className="space-y-3">
              {intents.map((i) => (
                <div key={i.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between items-center">
                  <div>
                    <p className="font-medium">{i.country} → Sénégal</p>
                    <p className="text-sm">{i.profession} - {i.intention}</p>
                    <p className="text-xs text-gray-500">Prévu : {i.date} • Capital : {i.capital}€</p>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <button onClick={() => startEditIntent(i)} className="text-blue-500 hover:underline text-xs">Modifier</button>
                      <button onClick={() => deleteIntent(i.id)} className="text-red-500 hover:underline text-xs">Supprimer</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editingIntent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg w-full space-y-4">
            <h3 className="font-bold text-lg">Modifier l'intention</h3>
            <input value={editingIntent.country} onChange={(e) => setEditingIntent({ ...editingIntent, country: e.target.value })} placeholder="Pays" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
            <input value={editingIntent.profession} onChange={(e) => setEditingIntent({ ...editingIntent, profession: e.target.value })} placeholder="Profession" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
            <textarea value={editingIntent.intention} onChange={(e) => setEditingIntent({ ...editingIntent, intention: e.target.value })} placeholder="Intention" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-24" />
            <input value={editingIntent.date} onChange={(e) => setEditingIntent({ ...editingIntent, date: e.target.value })} type="date" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
            <input value={editingIntent.capital} onChange={(e) => setEditingIntent({ ...editingIntent, capital: e.target.value })} type="number" placeholder="Capital" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingIntent(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Annuler</button>
              <button onClick={saveIntent} className="bg-brand-green text-white px-4 py-2 rounded">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {editingCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg w-full space-y-4">
            <h3 className="font-bold text-lg">Modifier le candidat</h3>
            <input value={editingCandidate.name} onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })} placeholder="Nom complet" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
            <input value={editingCandidate.country} onChange={(e) => setEditingCandidate({ ...editingCandidate, country: e.target.value })} placeholder="Pays" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
            <input value={editingCandidate.theme} onChange={(e) => setEditingCandidate({ ...editingCandidate, theme: e.target.value })} placeholder="Thème" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
            <div>
              <label className="block text-sm font-medium mb-1">Biographie</label>
              <WysiwygEditor value={editingCandidate.bio || ""} onChange={(val) => setEditingCandidate({ ...editingCandidate, bio: val })} />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingCandidate(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Annuler</button>
              <button onClick={saveCandidateEdit} className="bg-brand-green text-white px-4 py-2 rounded">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {tab === "represent" && (
        <DiasporaRepresentTab
          candidates={candidates}
          isAdmin={isAdmin}
          user={user}
          onVote={toggleVote}
          onEdit={handleEditCandidate}
          onStatus={handleStatus}
          onDelete={handleDeleteCandidate}
          onCreate={addCandidate}
        />
      )}

      {tab === "manage" && isAdmin && (
        <div>
          <h2 className="text-2xl font-bold mb-4">📋 Gestion des candidatures</h2>
          <div className="space-y-2 mb-8">
            {candidates.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune candidature à gérer.</p>
            ) : (
              candidates.map((c) => (
                <div key={c.id} className="bg-white dark:bg-gray-800 p-3 rounded shadow flex justify-between items-center">
                  <div>
                    <p className="font-medium">{c?.firstName ?? ""} {c?.lastName ?? ""} <span className="text-xs text-gray-500">({c.status})</span></p>
                    <p className="text-sm text-gray-500">{c.country} - {c.theme}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleStatus(c.id, "APPROVED")} className="text-green-700 bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium">Approuver</button>
                    <button onClick={() => handleStatus(c.id, "REJECTED")} className="text-red-700 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium">Rejeter</button>
                    <button onClick={() => handleStatus(c.id, "INVALIDATED")} className="text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs font-medium">Invalider</button>
                    <button onClick={() => startEditCandidate(c)} className="text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs font-medium">Modifier</button>
                    <button onClick={() => handleDeleteCandidate(c.id)} className="text-red-700 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium">Supprimer</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <h2 className="text-2xl font-bold mb-4">📋 Portefeuilles gouvernementaux à distance</h2>
          <p className="text-gray-500 mb-6">Consultez les attributions ministérielles et signez électroniquement.</p>

          {editingMinistry && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg w-full space-y-4">
                <h3 className="font-bold text-lg">{editingMinistry.id ? "Modifier" : "Ajouter"} un ministère</h3>
                <input value={editingMinistry.name} onChange={(e) => setEditingMinistry({ ...editingMinistry, name: e.target.value })} placeholder="Nom du ministère" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
                <input value={editingMinistry.budget} onChange={(e) => setEditingMinistry({ ...editingMinistry, budget: e.target.value })} type="number" placeholder="Budget" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <WysiwygEditor value={editingMinistry.description} onChange={(val) => setEditingMinistry({ ...editingMinistry, description: val })} />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingMinistry(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Annuler</button>
                  <button onClick={saveMinistry} className="bg-brand-green text-white px-4 py-2 rounded">Enregistrer</button>
                </div>
              </div>
            </div>
          )}

          {ministries.map((m) => (
            <div key={m.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{m.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => startEditMinistry(m)} className="text-blue-600 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs">Modifier</button>
                  <button onClick={() => handleDeleteMinistry(m.id)} className="text-red-600 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs">Supprimer</button>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-2" dangerouslySetInnerHTML={{ __html: m.description || "" }} />
              <p className="text-sm text-gray-500">Budget : {m.budget}</p>
              <div className="mt-2">
                <p className="text-sm font-medium">Directeurs :</p>
                {m.directors?.length > 0 ? (
                  <ul className="list-disc ml-6 text-sm">
                    {m.directors.map((d: any) => (
                      <li key={d.id} className="flex items-center justify-between">
                        <span>{d.name} – {d.title} ({d.email})</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditDirector(d.id, d)} className="text-blue-500 text-xs">Modifier</button>
                          <button onClick={() => handleDeleteDirector(d.id)} className="text-red-500 text-xs">Supprimer</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400">Aucun directeur</p>
                )}
                <button onClick={() => handleAddDirector(m.id)} className="mt-1 text-xs bg-blue-500 text-white px-2 py-1 rounded">+ Ajouter un directeur</button>
              </div>
            </div>
          ))}
          <button onClick={startAddMinistry} className="bg-brand-green text-white px-4 py-2 rounded mt-4">+ Ajouter un ministère</button>
        </div>
      )}
      {tab === "manage" && !isAdmin && <p className="text-gray-500">Accès réservé aux administrateurs.</p>}

      {tab === "candidater" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">📝 Candidater à un poste</h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mb-8">
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Téléphone *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+221 77 xxx xx xx" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block font-medium mb-1">Poste souhaité *</label>
                <select value={candidPoste} onChange={(e) => setCandidPoste(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
                  {DIASPORA_POSTES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              {candidIsDiaspora ? (
                <div>
                  <label className="block font-medium mb-1">Pays de résidence *</label>
                  <select value={regionSelect} onChange={(e) => { const val = e.target.value; setRegionSelect(val); if (val === "Sénégal") setRegion(""); else if (val === "other") setRegion(customRegion); else setRegion(val); }} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
                    <option value="">-- Choisir un pays --</option>
                    {PAYS.map((p) => <option key={p} value={p}>{p}</option>)}
                    <option value="other">🌍 Autre (précisez)</option>
                  </select>
                  {regionSelect === "Sénégal" && (
                    <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mt-2">
                      <option value="">-- Sélectionner votre région --</option>
                      {REGIONS_SENEGAL.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  )}
                  {regionSelect === "other" && (
                    <input type="text" value={customRegion} onChange={(e) => { setCustomRegion(e.target.value); setRegion(e.target.value); }} placeholder="Votre pays" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mt-2" />
                  )}
                </div>
              ) : (
                <div>
                  <label className="block font-medium mb-1">Région *</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white">
                    <option value="">-- Sélectionner votre région --</option>
                    {REGIONS_SENEGAL.map((r) => <option key={r} value={r}>{r}</option>)}
                    <option value="other">🌍 Hors Sénégal</option>
                  </select>
                  {region === "other" && (
                    <input type="text" value={customRegion} onChange={(e) => { setCustomRegion(e.target.value); setRegion(e.target.value); }} placeholder="Votre région" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mt-2" />
                  )}
                </div>
              )}
              <div>
                <label className="block font-medium mb-1">Zone (pays / région)</label>
                <input value={candidZone} onChange={(e) => setCandidZone(e.target.value)} placeholder="Ex: France, Europe, Dakar" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block font-medium mb-1">Motivation *</label>
                <textarea value={candidMotivation} onChange={(e) => setCandidMotivation(e.target.value)} placeholder="Pourquoi ce poste ?" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-24" />
              </div>
              <button onClick={submitDiasporaCandidature} disabled={candidLoading} className="bg-brand-green text-white px-6 py-2 rounded">{candidLoading ? "Envoi..." : "Envoyer ma candidature"}</button>
              {candidMsg && <p className="text-sm mt-2 text-blue-600">{candidMsg}</p>}
            </div>
          </div>
          <h2 className="text-xl font-bold mb-4">Mes candidatures</h2>
          {mesCandidatures.filter((c) => DIASPORA_POSTES.some((p) => p.value === c.poste)).length === 0 ? (
            <p className="text-gray-500">Aucune candidature enregistrée.</p>
          ) : (
            <div className="space-y-3">
              {mesCandidatures.filter((c) => DIASPORA_POSTES.some((p) => p.value === c.poste)).map((c) => (
                <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between items-center">
                  <div>
                    <p className="font-medium">{DIASPORA_POSTES.find((p) => p.value === c.poste)?.label}</p>
                    {c.zone && <p className="text-sm text-gray-500">Zone : {c.zone}</p>}
                    <p className="text-sm text-gray-500">Motivation : {c.motivation}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === "APPROVED" ? "bg-green-100 text-green-800" : c.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {c.status === "APPROVED" ? "Validée" : c.status === "REJECTED" ? "Rejetée" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <EditableBlockRenderer page="diaspora" />
    </div>
  );
}
