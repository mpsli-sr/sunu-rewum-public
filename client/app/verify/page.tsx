"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { http } from "@/lib/api";

function VerifyContent() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Vérification en cours…");
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError(true);
      setMessage("Token manquant");
      return;
    }
    http
      .get(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(() => {
        setMessage("Email vérifié ✅ Vous pouvez vous connecter.");
      })
      .catch(() => {
        setError(true);
        setMessage("Vérification impossible");
      });
  }, [params]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>
        {error ? "❌ Erreur de vérification" : "Vérification de votre email"}
      </h1>
      <p>{message}</p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
