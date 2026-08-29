"use client";
import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { http } from "@/lib/api";

// Correction icônes Leaflet (problème webpack)
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Icône spéciale pour les grandes villes
const worldCityIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Régions du Sénégal (inchangé)
const regionCoords: Record<string, [number, number]> = {
  Dakar: [14.7167, -17.4677],
  Thiès: [14.7894, -16.9268],
  "Saint-Louis": [16.0179, -16.4892],
  Ziguinchor: [12.5833, -16.2719],
  Kaolack: [14.15, -16.0667],
  Diourbel: [14.65, -16.2333],
  Fatick: [14.3333, -16.4167],
  Louga: [15.6167, -16.2167],
  Tambacounda: [13.7667, -13.6833],
  Kolda: [12.8833, -14.9333],
  Matam: [15.6167, -13.3333],
  Sédhiou: [12.7081, -15.5561],
  Kaffrine: [14.1, -15.55],
  Kédougou: [12.55, -12.1833],
};

// Grandes villes du monde (coordonnées)
const worldCities: { name: string; coords: [number, number] }[] = [
  { name: "Paris", coords: [48.8566, 2.3522] },
  { name: "New York", coords: [40.7128, -74.006] },
  { name: "Tokyo", coords: [35.6895, 139.6917] },
  { name: "Londres", coords: [51.5074, -0.1278] },
  { name: "Moscou", coords: [55.7558, 37.6173] },
  { name: "Pékin", coords: [39.9042, 116.4074] },
  { name: "Le Caire", coords: [30.0444, 31.2357] },
  { name: "Brasília", coords: [-15.7975, -47.8919] },
  { name: "Canberra", coords: [-35.2809, 149.13] },
  { name: "Berlin", coords: [52.52, 13.405] },
  { name: "Madrid", coords: [40.4168, -3.7038] },
  { name: "Rome", coords: [41.9028, 12.4964] },
];

interface Member {
  id: string;
  firstName?: string;
  lastName?: string;
  region?: string;
}

// Composant de changement de vue
const ChangeView = ({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

export default function MapClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTarget, setSearchTarget] = useState<[number, number] | null>(
    null,
  );
  const [defaultView, setDefaultView] = useState(false);

  useEffect(() => {
    http
      .get<any[]>("/api/admin-users/list")
      .then((data) => setMembers(data.filter((u) => u.region)))
      .catch((err) => console.error("Erreur membres:", err));
  }, []);

  const membersByRegion: Record<string, Member[]> = {};
  members.forEach((m) => {
    if (m.region) {
      if (!membersByRegion[m.region]) membersByRegion[m.region] = [];
      membersByRegion[m.region].push(m);
    }
  });

  // Recherche
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase().trim();
    // Cherche d'abord dans les régions sénégalaises
    for (const [region, coords] of Object.entries(regionCoords)) {
      if (region.toLowerCase().includes(q)) {
        setSelectedRegion(region);
        setSearchTarget(coords);
        setDefaultView(false);
        return;
      }
    }
    // Puis dans les grandes villes
    for (const city of worldCities) {
      if (city.name.toLowerCase().includes(q)) {
        setSelectedRegion(null);
        setSearchTarget(city.coords);
        setDefaultView(false);
        return;
      }
    }
    alert(
      "Lieu non trouvé. Essayez une région du Sénégal ou une grande ville mondiale.",
    );
  }, [searchQuery]);

  // Retour à la vue par défaut
  const handleResetView = () => {
    setSelectedRegion(null);
    setSearchTarget(null);
    setSearchQuery("");
    setDefaultView(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded dark:bg-gray-700 dark:text-white w-64"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Rechercher
        </button>
        <button
          onClick={handleResetView}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Retour à la vue d'ensemble
        </button>
      </div>

      <MapContainer
        center={[14.5, -14.5]}
        zoom={7}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Grandes villes mondiales (bleues) */}
        {worldCities.map((city) => (
          <Marker key={city.name} position={city.coords} icon={worldCityIcon}>
            <Popup>{city.name}</Popup>
          </Marker>
        ))}

        {/* Régions du Sénégal */}
        {Object.entries(regionCoords).map(([region, coords]) => {
          const count = membersByRegion[region]?.length || 0;
          return (
            <Marker
              key={region}
              position={coords}
              eventHandlers={{
                click: () => {
                  setSelectedRegion(region);
                  setSearchTarget(coords);
                  setDefaultView(false);
                },
              }}
            >
              <Popup>
                <div>
                  <strong>{region}</strong>
                  <br />
                  {count > 0 ? (
                    <ul className="list-disc ml-4">
                      {membersByRegion[region].map((m) => (
                        <li key={m.id}>
                          {m?.firstName ?? ""} {m?.lastName ?? ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <em>Aucun membre</em>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Vue centrée sur la recherche ou la région sélectionnée */}
        {(selectedRegion || searchTarget) && !defaultView && (
          <ChangeView
            center={searchTarget || regionCoords[selectedRegion!]}
            zoom={10}
          />
        )}
        {defaultView && <ChangeView center={[14.5, -14.5]} zoom={7} />}
      </MapContainer>
    </div>
  );
}
