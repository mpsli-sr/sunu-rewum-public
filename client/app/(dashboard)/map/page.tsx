"use client";
import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/components/MapClient"), {
  ssr: false,
  loading: () => <p>Chargement de la carte...</p>,
});

export default function MapPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🗺️ Carte des membres</h1>
      <MapClient />
    </div>
  );
}
