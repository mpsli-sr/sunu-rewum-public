"use client";
import { useEffect, useState } from "react";
import FileUploader from "@/components/FileUploader";
import { http } from "@/lib/api";

const REGIONS_SENEGAL = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Ziguinchor",
  "Kaolack",
  "Touba",
  "Diourbel",
  "Fatick",
  "Louga",
  "Tambacounda",
  "Kolda",
  "Matam",
  "Sédhiou",
  "Kaffrine",
  "Kédougou",
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [regionSelect, setRegionSelect] = useState("");
  const [customRegion, setCustomRegion] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    http
      .get<any>("/api/auth/me")
      .then((u) => {
        if (u) {
          setUser(u);
          const r = u.region || "";
          if (REGIONS_SENEGAL.includes(r)) {
            setRegionSelect(r);
          } else if (r) {
            setRegionSelect("other");
            setCustomRegion(r);
          } else {
            setRegionSelect("");
          }
          setProfileImage(u.profileImage || "");
        }
      })
      .catch(() => setUser(null));
  }, []);

  const handleChange = (field: string, value: string) => {
    setUser((prev: any) => ({ ...prev, [field]: value }));
  };

  const saveAll = async () => {
    const payload: any = {
      phone: user.phone,
      region: regionSelect === "other" ? customRegion : regionSelect,
      departement: user.departement,
      commune: user.commune,
      adresse: user.adresse,
      cni: user.cni,
      carteElecteur: user.carteElecteur,
      profileImage: profileImage,
    };

    try {
      await http.put("/api/user/me", payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Erreur sauvegarde profil:", err);
    }
  };

  if (!user) return <div className="p-8">Chargement...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">👤 Mon profil</h1>
      {saved && <p className="text-green-600 mb-4">✅ Profil enregistré.</p>}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow max-w-lg space-y-4">
        {/* Photo de profil */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mb-2">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                👤
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="URL de votre photo"
              className="p-2 border rounded dark:bg-gray-700 dark:text-white text-sm"
            />
            <FileUploader
              onUpload={(url) => setProfileImage(url)}
              accept="image/*"
              label="Upload"
            />
          </div>
        </div>

        <p>
          <strong>Nom :</strong> {user?.firstName ?? ""} {user?.lastName ?? ""}
        </p>
        <p>
          <strong>Email :</strong> {user.email}
        </p>

        <div>
          <label className="block font-medium">Téléphone</label>
          <input
            type="text"
            value={user.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-medium">Région / Pays</label>
          <select
            value={regionSelect}
            onChange={(e) => setRegionSelect(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white mb-2"
          >
            <option value="">-- Sélectionner --</option>
            {REGIONS_SENEGAL.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            <option value="other">🌍 Hors Sénégal / Autre pays</option>
          </select>
          {regionSelect === "other" && (
            <input
              type="text"
              value={customRegion}
              onChange={(e) => setCustomRegion(e.target.value)}
              placeholder="Votre pays ou région"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            />
          )}
        </div>

        <div>
          <label className="block font-medium">Département</label>
          <input
            type="text"
            value={user.departement || ""}
            onChange={(e) => handleChange("departement", e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-medium">Commune</label>
          <input
            type="text"
            value={user.commune || ""}
            onChange={(e) => handleChange("commune", e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-medium">Adresse</label>
          <input
            type="text"
            value={user.adresse || ""}
            onChange={(e) => handleChange("adresse", e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-medium">Numéro CNI</label>
          <input
            type="text"
            value={user.cni || ""}
            onChange={(e) => handleChange("cni", e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-medium">Carte d'électeur</label>
          <input
            type="text"
            value={user.carteElecteur || ""}
            onChange={(e) => handleChange("carteElecteur", e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          />
        </div>

        <button
          onClick={saveAll}
          className="mt-4 bg-brand-green text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
