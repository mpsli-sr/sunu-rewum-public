"use client";
import { useEffect, useState } from "react";
import EditableBlockRenderer from "@/components/EditableBlockRenderer";
import MenusManagement from "@/components/admin/MenusManagement";
import DashboardConfigAdmin from "@/components/admin/DashboardConfigAdmin";
import RoleManager from "@/components/admin/RoleManager";
import VisibilityManager from "@/components/admin/VisibilityManager";
import IntegrationsManager from "@/components/admin/IntegrationsManager";
import CandidaturesManager from "@/components/admin/CandidaturesManager";
import RubriquesManager from "@/components/admin/RubriquesManager";
import CustomFieldsAdmin from "@/components/admin/CustomFieldsAdmin";
import PaymentMethodsManager from "@/components/admin/PaymentMethodsManager";
import SiteVisibilityAdmin from "@/components/admin/SiteVisibilityAdmin";
import FileUploader from "@/components/FileUploader";
import { http } from "@/lib/api";

// Catégories ergonomiques
const CATEGORIES = [
  {
    title: "Contenu",
    icon: "📄",
    modules: [
      { key: "articles", label: "Articles", icon: "📰" },
      { key: "events", label: "Événements", icon: "📅" },
      { key: "jobs", label: "Emplois", icon: "💼" },
      { key: "media", label: "Médias", icon: "📸" },
      { key: "proposals", label: "Propositions", icon: "💡" },
      { key: "blocks", label: "Blocs", icon: "🧩" },
      { key: "drafts", label: "Brouillons", icon: "📝" },
      { key: "rubriques", label: "Rubriques", icon: "📂" },
    ],
  },
  {
    title: "Utilisateurs & Rôles",
    icon: "👥",
    modules: [
      { key: "users", label: "Utilisateurs", icon: "👤" },
      { key: "roles", label: "Rôles", icon: "🔐" },
      { key: "candidatures", label: "Candidatures", icon: "🗳️" },
      { key: "sponsorships", label: "Parrainages", icon: "✍️" },
      { key: "votes", label: "Votes", icon: "🗳️" },
    ],
  },
  {
    title: "Apparence & Configuration",
    icon: "🎨",
    modules: [
      { key: "appearance", label: "Apparence", icon: "🎨" },
      { key: "menus", label: "Menus", icon: "📋" },
      { key: "dashboardConfig", label: "Dashboard", icon: "📊" },
      { key: "visibility", label: "Visibilité", icon: "👁️" },
      { key: "integrations", label: "Réseaux & Services", icon: "🔌" },
      { key: "payments", label: "Paiements", icon: "💳" },
      { key: "customFields", label: "Champs personnalisés", icon: "🔧" },
    ],
  },
  {
    title: "Système",
    icon: "⚙️",
    modules: [
      { key: "tools", label: "Outils", icon: "🔧" },
      { key: "backup", label: "Sauvegarde", icon: "💾" },
    ],
  },
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
        .then(setSiteSettings)
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
      alert("Paramètres enregistrés");
    } catch (err) {
      console.error(err);
    }
  };
  const deleteItem = async (endpoint: string) => {
    if (!confirm("Supprimer ?")) return;
    await http.delete(endpoint);
    setActive(active);
  };
  const changeRole = async (userId: string, role: string) => {
    await http.put(`/api/admin-actions/user/${userId}/role`, { role });
    setActive(active);
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
    await http.put(endpoint, newItem);
    setShowModal(false);
    setEditItem(null);
    setNewItem({});
    setActive(active);
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
      case "payments":
        endpoint = "/api/payment-methods";
        break;
      default:
        alert("Ajout non supporté");
        return;
    }
    await http.post(endpoint, newItem);
    setShowModal(false);
    setEditItem(null);
    setNewItem({});
    setActive(active);
  };
  const backupNow = async () => {
    const data = await http.post<any>("/api/admin-backup");
    alert(data.message || "Sauvegarde effectuée");
  };
  const reset = async (target: string) => {
    if (!confirm("Remettre à zéro ?")) return;
    await http.post("/api/admin-reset", { target });
    setActive(active);
  };
  const validateSponsor = async (id: string) => {
    await http.put(`/api/admin-sponsorship/${id}/validate`);
    setActive(active);
  };
  const invalidateSponsor = async (id: string) => {
    await http.put(`/api/admin-sponsorship/${id}/invalidate`);
    setActive(active);
  };
  const deleteVote = async (id: string, type: string) => {
    const endpoint =
      type === "diaspora"
        ? `/api/admin-votes/diaspora/${id}`
        : `/api/admin-votes/proposal/${id}`;
    await http.delete(endpoint);
    setActive(active);
  };
  const updateProposalStatus = async (id: string, status: string) => {
    await http.patch(`/api/admin-actions/proposal/${id}/status`, { status });
    setActive(active);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">⚙️ Administration</h1>

      {/* Grille de cartes ergonomique */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
          >
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span>{cat.icon}</span> {cat.title}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {cat.modules.map((mod) => (
                <button
                  key={mod.key}
                  onClick={() => setActive(mod.key)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    active === mod.key
                      ? "bg-brand-green text-white"
                      : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span className="mr-1">{mod.icon}</span> {mod.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contenu du module actif */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        {loading && <p>Chargement...</p>}

        {active === "users" && (
          <table className="w-full">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u: any) => (
                <tr key={u.id} className="border-t">
                  <td>
                    {u?.firstName ?? ""} {u?.lastName ?? ""}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      <option>VISITOR</option>
                      <option>MEMBER</option>
                      <option>COORDINATOR</option>
                      <option>ADMIN</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => openEdit(u)}
                      className="text-blue-500 mr-2"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() =>
                        deleteItem(`/api/admin-actions/user/${u.id}`)
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
          "blocks",
          "drafts",
          "payments",
        ].includes(active) && (
          <div className="space-y-3">
            {data.map((item: any) => (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-bold">
                    {item.title || item.name || item.slug || item.page}
                  </p>
                  {item.summary && <p className="text-sm">{item.summary}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-blue-500"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteItem(`/api/${active}/${item.id}`)}
                    className="text-red-500"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {active === "menus" && <MenusManagement />}
        {active === "dashboardConfig" && <DashboardConfigAdmin />}
        {active === "roles" && <RoleManager />}
        {active === "visibility" && <VisibilityManager />}
        {active === "integrations" && <IntegrationsManager />}
        {active === "candidatures" && <CandidaturesManager />}
        {active === "rubriques" && <RubriquesManager />}
        {active === "customFields" && <CustomFieldsAdmin />}
        {active === "payments" && <PaymentMethodsManager />}
        {active === "appearance" && (
          <div className="space-y-4">
            <h2>Personnalisation</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Couleur primaire</label>
                <input
                  type="color"
                  value={siteSettings.primaryColor || "#008000"}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      primaryColor: e.target.value,
                    })
                  }
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
              onClick={() => reset("sponsorships-all")}
              className="bg-red-500 text-white p-4 rounded"
            >
              Supprimer tous les parrainages
            </button>
            <button
              onClick={() => reset("votes-proposals")}
              className="bg-red-500 text-white p-4 rounded"
            >
              Supprimer votes propositions
            </button>
            <button
              onClick={backupNow}
              className="bg-blue-500 text-white p-4 rounded"
            >
              Sauvegarde
            </button>
          </div>
        )}
        {active === "backup" && (
          <button
            onClick={backupNow}
            className="bg-blue-500 text-white p-4 rounded"
          >
            Sauvegarder maintenant
          </button>
        )}
      </div>

      <EditableBlockRenderer page="admin" />
    </div>
  );
}
