"use client";
import CandidaturesManager from "@/components/admin/CandidaturesManager";
import IntegrationsManager from "@/components/admin/IntegrationsManager";
import VisibilityManager from "@/components/admin/VisibilityManager";
import { useEffect, useState } from "react";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import MenusManagement from "@/components/admin/MenusManagement";
import DashboardConfigAdmin from "@/components/admin/DashboardConfigAdmin";
import RoleManager from "@/components/admin/RoleManager";
import FileUploader from "@/components/FileUploader";
import { http } from "@/lib/api";

const resources = [
  { key: "users", label: "👥 Utilisateurs" },
  { key: "articles", label: "📰 Articles" },
  { key: "events", label: "📅 Événements" },
  { key: "jobs", label: "💼 Emplois" },
  { key: "media", label: "📸 Médias" },
  { key: "proposals", label: "💡 Propositions" },
  { key: "sponsorships", label: "✍️ Parrainages" },
  { key: "votes", label: "🗳️ Votes" },
  { key: "ideologies", label: "📌 Idéologies" },
  { key: "blocks", label: "🧩 Contenus modulables" },
  { key: "drafts", label: "📝 Brouillons à valider" },
  { key: "appearance", label: "🎨 Apparence" },
  { key: "tools", label: "🔧 Outils admin" },
  { key: "payments", label: "💳 Paiement" },
  { key: "menus", label: "📋 Menus" },
  { key: "dashboardConfig", label: "📊 Dashboard" },
  { key: "integrations", label: "🔌 Réseaux & Services" },
  { key: "visibility", label: "👁️ Visibilité" },
  { key: "candidatures", label: "🗳️ Candidatures" },
  { key: "backup", label: "💾 Sauvegarde" },
];

export default function AdminPage() {
  const [active, setActive] = useState("users");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [filterRegion, setFilterRegion] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [voteType, setVoteType] = useState("proposal");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [newItem, setNewItem] = useState<any>({});

  useEffect(() => {
    if (active === "appearance") {
      http
        .get<any>("/api/site-settings")
        .then((s) => setSiteSettings(s))
        .catch(() => setSiteSettings({}));
      return;
    }
    setLoading(true);
    let url = "";
    const params = new URLSearchParams();
    switch (active) {
      case "users":
        url = "/api/admin/users";
        break;
      case "articles":
        url = "/api/articles";
        break;
      case "events":
        url = "/api/events";
        break;
      case "jobs":
        url = "/api/admin-jobs";
        break;
      case "media":
        url = "/api/admin-media";
        break;
      case "proposals":
        url = "/api/proposals";
        break;
      case "sponsorships":
        url = "/api/admin-sponsorship";
        if (filterRegion) params.append("region", filterRegion);
        if (filterStatus) params.append("status", filterStatus);
        break;
      case "votes":
        url = "/api/admin-votes";
        params.append("type", voteType);
        break;
      case "ideologies":
        url = "/api/admin-ideology";
        break;
      case "blocks":
        url = "/api/content-blocks";
        break;
      case "drafts":
        url = "/api/content-blocks";
        params.append("status", "draft");
        break;
      case "payments":
        url = "/api/payment-methods";
        break;
      case "menus":
        url = "/api/menus";
        break;
      case "dashboardConfig":
        url = "/api/dashboard-config/all";
        break;
      case "customFields":
        url = "/api/custom-fields";
        break;
      case "integrations":
        break; // pas d'API à appeler
      case "candidatures":
        break;
      case "roles":
        break; // pas d'API à appeler
      case "visibility":
        break; // pas d'API à appeler
      default:
        break;
    }
    if (params.toString()) url += "?" + params.toString();
    if (url) {
      http
        .get<any[]>(url)
        .then((json) => setData(Array.isArray(json) ? json : []))
        .catch(() => setData([]));
    }
    setLoading(false);
  }, [active, filterRegion, filterStatus, voteType]);

  const saveSiteSettings = async () => {
    try {
      await http.put("/api/site-settings", siteSettings);
      alert("Paramètres du site mis à jour !");
      document.documentElement.style.setProperty(
        "--color-primary",
        siteSettings.primaryColor,
      );
      document.documentElement.style.setProperty(
        "--color-secondary",
        siteSettings.secondaryColor,
      );
      document.documentElement.style.setProperty(
        "--color-accent",
        siteSettings.accentColor,
      );
    } catch (err) {
      console.error("Erreur sauvegarde réglages:", err);
    }
  };

  const deleteItem = async (endpoint: string) => {
    if (!confirm("Supprimer ?")) return;
    try {
      await http.delete(endpoint);
      setActive(active);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const changeRole = async (userId: string, role: string) => {
    try {
      await http.put(`/api/admin-actions/user/${userId}/role`, { role });
      setActive(active);
    } catch (err) {
      console.error("Erreur changement rôle:", err);
    }
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setNewItem({ ...item });
    setShowModal(true);
  };

  const saveEdit = async () => {
    let endpoint = "";
    switch (active) {
      case "users":
        endpoint = `/api/admin-users/${editItem.id}`;
        break;
      case "articles":
        endpoint = `/api/articles/${editItem.id}`;
        break;
      case "events":
        endpoint = `/api/events/${editItem.id}`;
        break;
      case "jobs":
        endpoint = `/api/admin-jobs/${editItem.id}`;
        break;
      case "media":
        endpoint = `/api/admin-media/${editItem.id}`;
        break;
      case "ideologies":
        endpoint = `/api/admin-ideology/${editItem.slug || newItem.slug}`;
        break;
      case "blocks":
      case "drafts":
        endpoint = `/api/content-blocks/${editItem.id}`;
        break;
      case "payments":
        endpoint = `/api/payment-methods/${editItem.id}`;
        break;
      default:
        return;
    }
    try {
      await http.put(endpoint, newItem);
      setShowModal(false);
      setEditItem(null);
      setNewItem({});
      setActive(active);
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
    }
  };

  const createItem = async () => {
    let endpoint = "";
    switch (active) {
      case "users":
        endpoint = "/api/admin-users";
        break;
      case "articles":
        endpoint = "/api/articles";
        break;
      case "events":
        endpoint = "/api/events";
        break;
      case "jobs":
        endpoint = "/api/recruitment";
        break;
      case "media":
        endpoint = "/api/media";
        break;
      case "proposals":
        endpoint = "/api/proposals";
        break;
      case "payments":
        endpoint = "/api/payment-methods";
        break;
      default:
        alert("Ajout non supporté pour cette section");
        return;
    }
    try {
      await http.post(endpoint, newItem);
      setShowModal(false);
      setEditItem(null);
      setNewItem({});
      setActive(active);
    } catch (err) {
      console.error("Erreur création:", err);
    }
  };

  const backupNow = async () => {
    try {
      const data = await http.post<any>("/api/admin-backup");
      alert(data.message || "Sauvegarde effectuée.");
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
    }
  };

  const reset = async (target: string) => {
    if (!confirm("Remettre à zéro ?")) return;
    try {
      await http.post("/api/admin-reset", { target });
      setActive(active);
    } catch (err) {
      console.error("Erreur reset:", err);
    }
  };

  const validateSponsor = async (id: string) => {
    try {
      await http.put(`/api/admin-sponsorship/${id}/validate`);
      setActive(active);
    } catch (err) {
      console.error("Erreur validation:", err);
    }
  };

  const invalidateSponsor = async (id: string) => {
    try {
      await http.put(`/api/admin-sponsorship/${id}/invalidate`);
      setActive(active);
    } catch (err) {
      console.error("Erreur invalidation:", err);
    }
  };

  const deleteVote = async (id: string, type: string) => {
    const endpoint =
      type === "diaspora"
        ? `/api/admin-votes/diaspora/${id}`
        : `/api/admin-votes/proposal/${id}`;
    try {
      await http.delete(endpoint);
      setActive(active);
    } catch (err) {
      console.error("Erreur suppression vote:", err);
    }
  };

  const updateProposalStatus = async (id: string, status: string) => {
    try {
      await http.patch(`/api/admin-actions/proposal/${id}/status`, { status });
      setActive(active);
    } catch (err) {
      console.error("Erreur statut proposition:", err);
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-56 bg-white dark:bg-gray-800 rounded-xl shadow p-4 h-fit sticky top-4">
        <h2 className="text-lg font-bold mb-4">Ressources</h2>
        <nav className="space-y-1">
          {resources.map((r) => (
            <button
              key={r.key}
              onClick={() => setActive(r.key)}
              className={`w-full text-left px-3 py-2 rounded text-sm ${active === r.key ? "bg-brand-green text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              {r.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">⚙️ Administration</h1>
          {active !== "sponsorships" &&
            active !== "votes" &&
            active !== "backup" &&
            active !== "appearance" &&
            active !== "tools" && (
              <button
                onClick={() => {
                  setEditItem(null);
                  setNewItem({});
                  setShowModal(true);
                }}
                className="bg-brand-green text-white px-4 py-2 rounded"
              >
                + Ajouter
              </button>
            )}
        </div>

        {active === "appearance" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Personnalisation du site</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Couleur principale</label>
                <input
                  type="color"
                  value={siteSettings.primaryColor || "#008000"}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      primaryColor: e.target.value,
                    })
                  }
                  className="w-full h-10"
                />
              </div>
              <div>
                <label>Couleur secondaire</label>
                <input
                  type="color"
                  value={siteSettings.secondaryColor || "#FFD700"}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      secondaryColor: e.target.value,
                    })
                  }
                  className="w-full h-10"
                />
              </div>
              <div>
                <label>Couleur accent</label>
                <input
                  type="color"
                  value={siteSettings.accentColor || "#E31B23"}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      accentColor: e.target.value,
                    })
                  }
                  className="w-full h-10"
                />
              </div>
              <div>
                <label>Titre du site</label>
                <input
                  type="text"
                  value={siteSettings.siteTitle || "SUNU REWUM"}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      siteTitle: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label>URL du favicon</label>
                <input
                  type="text"
                  value={siteSettings.faviconUrl || "/icon-192.png"}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      faviconUrl: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              onClick={saveSiteSettings}
              className="bg-brand-green text-white px-6 py-2 rounded"
            >
              Enregistrer
            </button>
          </div>
        )}

        {active === "tools" && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => reset("sponsorships-pending")}
              className="bg-red-500 text-white p-4 rounded-xl"
            >
              Supprimer parrainages en attente
            </button>
            <button
              onClick={() => reset("sponsorships-all")}
              className="bg-red-500 text-white p-4 rounded-xl"
            >
              Supprimer tous les parrainages
            </button>
            <button
              onClick={() => reset("votes-proposals")}
              className="bg-red-500 text-white p-4 rounded-xl"
            >
              Supprimer votes propositions
            </button>
            <button
              onClick={() => reset("votes-diaspora")}
              className="bg-red-500 text-white p-4 rounded-xl"
            >
              Supprimer votes diaspora
            </button>
            <button
              onClick={backupNow}
              className="bg-blue-500 text-white p-4 rounded-xl"
            >
              Sauvegarde rapide
            </button>
            <button
              onClick={() => {
                if (confirm("Réinitialiser TOUS les posts ?")) reset("posts");
              }}
              className="bg-red-700 text-white p-4 rounded-xl"
            >
              Supprimer tous les posts
            </button>
          </div>
        )}

        {active === "backup" && (
          <div className="mb-6 space-y-4">
            <button
              onClick={backupNow}
              className="bg-blue-500 text-white p-4 rounded-xl w-full"
            >
              💾 Sauvegarder maintenant
            </button>
          </div>
        )}

        {loading && <p>Chargement...</p>}

        {active === "users" && (
          <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow">
            <thead>
              <tr>
                <th className="p-3">Nom</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rôle</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">
                    {u?.firstName ?? ""} {u?.lastName ?? ""}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="border rounded p-1"
                    >
                      <option>VISITOR</option>
                      <option>MEMBER</option>
                      <option>COORDINATOR</option>
                      <option>ADMIN</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openEdit(u)}
                      className="text-blue-500 mr-2"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        const newPwd = prompt(
                          "Nouveau mot de passe pour " + u.email,
                        );
                        if (newPwd) {
                          http
                            .put(`/api/admin-users/${u.id}`, { password: newPwd })
                            .then(() => alert("Mot de passe mis à jour"))
                            .catch((err) =>
                              console.error("Erreur mot de passe:", err),
                            );
                        }
                      }}
                      className="text-yellow-500 mr-2"
                      title="Réinitialiser le mot de passe"
                    >
                      🔑
                    </button>
                    <button
                      onClick={() =>
                        deleteItem("/api/admin-actions/user/" + u.id)
                      }
                      className="text-red-500"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {[
          "articles",
          "events",
          "jobs",
          "media",
          "proposals",
          "ideologies",
          "blocks",
          "drafts",
          "payments",
        ].includes(active) && (
          <div className="space-y-3">
            {data.map((item: any) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between"
              >
                <div>
                  <p className="font-bold">
                    {item.title || item.name || item.slug || item.page}
                  </p>
                  {item.summary && <p className="text-sm">{item.summary}</p>}
                  {item.description && (
                    <p className="text-sm">{item.description}</p>
                  )}
                  {active === "payments" && (
                    <span>
                      {item.icon} {item.enabled ? "✅" : "❌"}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-blue-500"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() =>
                      deleteItem(
                        `/${active === "blocks" || active === "drafts" ? "api/content-blocks/" + item.id : active === "payments" ? "api/payment-methods/" + item.id : "api/" + active + "/" + item.id}`,
                      )
                    }
                    className="text-red-500"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {active === "sponsorships" && (
          <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow">
            <thead>
              <tr>
                <th className="p-3">Utilisateur</th>
                <th className="p-3">CNI</th>
                <th className="p-3">Région</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s: any) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">
                    {s.user?.firstName ?? ""} {s.user?.lastName ?? ""}
                  </td>
                  <td className="p-3">{s.cniNumber}</td>
                  <td className="p-3">{s.region}</td>
                  <td className="p-3">
                    {s.verified ? "✅ Validé" : "⏳ En attente"}
                  </td>
                  <td className="p-3">
                    {!s.verified ? (
                      <button
                        onClick={() => validateSponsor(s.id)}
                        className="text-green-500 mr-2"
                      >
                        Valider
                      </button>
                    ) : (
                      <button
                        onClick={() => invalidateSponsor(s.id)}
                        className="text-yellow-500 mr-2"
                      >
                        Invalider
                      </button>
                    )}
                    <button
                      onClick={() =>
                        deleteItem("/api/admin-sponsorship/" + s.id)
                      }
                      className="text-red-500"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {active === "votes" && (
          <div className="space-y-2">
            {data.map((v: any) => (
              <div
                key={v.id}
                className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow flex justify-between"
              >
                <span>
                  {v.user?.firstName ?? ""} {v.user?.lastName ?? ""} → {v.target}
                </span>
                <button
                  onClick={() => deleteVote(v.id, v.type)}
                  className="text-red-500"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale d'ajout/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editItem ? "Modifier" : "Ajouter"}
            </h3>
            {active === "users" && (
              <div className="space-y-3">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Prénom"
                  value={newItem.firstName || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, firstName: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Nom"
                  value={newItem.lastName || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, lastName: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Email"
                  value={newItem.email || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, email: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Pays"
                  value={newItem.country || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, country: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Région"
                  value={newItem.region || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, region: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Département"
                  value={newItem.departement || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, departement: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Commune"
                  value={newItem.commune || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, commune: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Adresse"
                  value={newItem.adresse || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, adresse: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Téléphone"
                  value={newItem.phone || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, phone: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="CNI"
                  value={newItem.cni || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, cni: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Carte électeur"
                  value={newItem.carteElecteur || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, carteElecteur: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  type="password"
                  placeholder="Nouveau mot de passe (laisser vide pour ne pas changer)"
                  value={newItem.password || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, password: e.target.value })
                  }
                />
              </div>
            )}
            {active === "articles" && (
              <div className="space-y-3">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Titre"
                  value={newItem.title || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Résumé"
                  value={newItem.summary || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, summary: e.target.value })
                  }
                  rows={2}
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Contenu"
                  value={newItem.content || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, content: e.target.value })
                  }
                  rows={5}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newItem.isPublished || false}
                    onChange={(e) =>
                      setNewItem({ ...newItem, isPublished: e.target.checked })
                    }
                  />{" "}
                  Publié
                </label>
              </div>
            )}
            {active === "events" && (
              <div className="space-y-3">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Titre"
                  value={newItem.title || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Description"
                  value={newItem.description || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                />
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={newItem.date?.substring(0, 10) || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, date: e.target.value })
                  }
                />
                <select
                  value={newItem.type || "MEETING"}
                  onChange={(e) =>
                    setNewItem({ ...newItem, type: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option>VIRTUAL</option>
                  <option>PHYSICAL</option>
                  <option>MEETING</option>
                </select>
              </div>
            )}
            {active === "jobs" && (
              <div className="space-y-3">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Titre"
                  value={newItem.title || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Description"
                  value={newItem.description || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Département"
                  value={newItem.department || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, department: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Lieu"
                  value={newItem.location || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, location: e.target.value })
                  }
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newItem.remote || false}
                    onChange={(e) =>
                      setNewItem({ ...newItem, remote: e.target.checked })
                    }
                  />{" "}
                  Télétravail
                </label>
              </div>
            )}
            {active === "media" && (
              <div className="space-y-3">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Titre"
                  value={newItem.title || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="URL"
                  value={newItem.url || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, url: e.target.value })
                  }
                />
                <select
                  value={newItem.type || "image"}
                  onChange={(e) =>
                    setNewItem({ ...newItem, type: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option>image</option>
                  <option>video</option>
                </select>
                <FileUploader
                  onUpload={(url) => setNewItem({ ...newItem, url })}
                  accept="image/*,video/*"
                  label="Upload image/vidéo"
                />
              </div>
            )}
            {active === "ideologies" && (
              <div className="space-y-3">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Slug"
                  value={newItem.slug || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, slug: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Titre"
                  value={newItem.title || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Contenu"
                  value={newItem.content || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, content: e.target.value })
                  }
                  rows={5}
                />
              </div>
            )}
            {active === "proposals" && editItem && (
              <div className="space-y-3">
                <p className="font-bold">{editItem.title}</p>
                <select
                  value={newItem.status || editItem.status}
                  onChange={(e) =>
                    setNewItem({ ...newItem, status: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option>PENDING</option>
                  <option>APPROVED</option>
                  <option>REJECTED</option>
                </select>
              </div>
            )}
            {(active === "blocks" || active === "drafts") && (
              <div className="space-y-3">
                <select
                  value={newItem.page || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, page: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Page --</option>
                  <option value="home">Accueil</option>
                  <option value="neutralite-active">Neutralité</option>
                  <option value="parite">Parité</option>
                </select>
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Titre"
                  value={newItem.title || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, title: e.target.value })
                  }
                />
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Contenu"
                  value={newItem.content || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, content: e.target.value })
                  }
                  rows={4}
                />
                <select
                  value={newItem.status || "draft"}
                  onChange={(e) =>
                    setNewItem({ ...newItem, status: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </select>
              </div>
            )}
            {active === "payments" && (
              <div className="space-y-3">
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Nom (ex: Orange Money)"
                  value={newItem.name || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
                <input
                  className="w-full p-2 border rounded"
                  placeholder="Icône (emoji)"
                  value={newItem.icon || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, icon: e.target.value })
                  }
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newItem.enabled !== false}
                    onChange={(e) =>
                      setNewItem({ ...newItem, enabled: e.target.checked })
                    }
                  />{" "}
                  Actif
                </label>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>
              {editItem ? (
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-brand-green text-white rounded"
                >
                  Enregistrer
                </button>
              ) : (
                <button
                  onClick={createItem}
                  className="px-4 py-2 bg-brand-green text-white rounded"
                >
                  Créer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {active === "menus" && <MenusManagement />}
      {active === "dashboardConfig" && <DashboardConfigAdmin />}
      {active === "roles" && <RoleManager />}
      {active === "visibility" && <VisibilityManager />}
      {active === "integrations" && <IntegrationsManager />}
      {active === "candidatures" && <CandidaturesManager />}
      <EditableBlockRenderer page="admin" />
    </div>
  );
}
