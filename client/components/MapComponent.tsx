"use client";
import { useEffect, useState, useRef } from "react";
import type { Map } from "leaflet";
import { http } from "@/lib/api";

interface Member {
  id: string;
  firstName?: string;
  lastName?: string;
  region?: string;
}

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

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [L, setL] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    http
      .get<any[]>("/api/admin-users/list")
      .then((data) => {
        setMembers(data.filter((u: any) => u.region));
      })
      .catch((err) => {
        console.error("Échec chargement membres:", err);
        setMembers([]);
      });
  }, []);

  useEffect(() => {
    if (!loaded || !L || !mapContainer.current) return;
    if (map) return;

    const instance = L.map(mapContainer.current, {
      center: [14.5, -14.5],
      zoom: 7,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(instance);

    setMap(instance);
  }, [loaded, L, map]);

  useEffect(() => {
    if (!map || !L || !members.length) return;

    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    members.forEach((member) => {
      const coord = regionCoords[member.region!] || [14.5, -14.5];
      L.marker(coord)
        .addTo(map)
        .bindPopup(
          `${member.firstName ?? ""} ${member.lastName ?? ""}<br/>${member.region}`,
        );
    });
  }, [members, map, L]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🗺️ Carte des membres</h1>
      <div ref={mapContainer} style={{ height: "80vh", width: "100%" }} />
    </div>
  );
}
