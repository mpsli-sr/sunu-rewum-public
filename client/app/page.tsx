import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "SUNU REWUM — Travail, Dignité, Souveraineté, Solidarité",
  description:
    "Plateforme officielle du mouvement politique COTHIE AK M.P.S.L.I",
  openGraph: {
    title: "SUNU REWUM",
    description: "Plateforme officielle",
    url: "https://sunu-rewum.vercel.app/",
    siteName: "SUNU REWUM",
    locale: "fr_FR",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main>
      <HomeClient />
    </main>
  );
}
