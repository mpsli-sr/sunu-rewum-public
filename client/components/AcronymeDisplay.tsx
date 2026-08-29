"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function AcronymeDisplay() {
  const [definition, setDefinition] = useState("");

  useEffect(() => {
    http
      .get<any>("/api/public/integrations")
      .then((data) => {
        if (data?.acronymDefinition) setDefinition(data.acronymDefinition);
      })
      .catch(() => {});
  }, []);

  if (!definition) return null;

  return (
    <p className="text-sm text-white/80 mt-2 italic">
      M.P.S.L.I – {definition}
    </p>
  );
}
