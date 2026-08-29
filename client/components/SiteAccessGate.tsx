"use client";
import { useEffect, useState } from "react";

const ACCESS_KEY = "sunu_rewum_access";
const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_ACCESS_PASSWORD || "";

export default function SiteAccessGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(ACCESS_KEY);
    setAccessGranted(stored === "true");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (SITE_PASSWORD && password === SITE_PASSWORD) {
      sessionStorage.setItem(ACCESS_KEY, "true");
      setAccessGranted(true);
    } else {
      setError("Mot de passe incorrect ou non configuré");
    }
  };

  if (accessGranted === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-center mb-4">SUNU REWUM</h1>
          <p className="text-center text-gray-600 mb-6">Accès restreint</p>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full p-2 border rounded mb-4"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-brand-green text-white py-2 rounded"
          >
            Entrer
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
