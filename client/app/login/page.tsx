"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { http } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("member");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await http.post<any>("/api/auth/login", { email, password });
      if (res) {
        const me = await http.get<any>("/api/auth/me");
        if (me) {
          switch (profile) {
            case "visitor":
              router.push("/discover");
              break;
            case "member":
              router.push("/feed");
              break;
            case "adherent":
              router.push("/donations");
              break;
            case "admin":
              router.push("/dashboard");
              break;
            default:
              router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-brand-green text-center mb-6">
          SUNU REWUM
        </h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profil</label>
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="visitor">Visiteur</option>
              <option value="member">Membre</option>
              <option value="adherent">Adhérent</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-green text-white py-2 rounded hover:bg-green-700"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          <Link href="/register" className="text-brand-green hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
