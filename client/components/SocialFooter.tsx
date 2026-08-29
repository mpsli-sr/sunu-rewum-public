"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function SocialFooter() {
  const [links, setLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    http
      .get<Record<string, string>>("/api/public/integrations")
      .then((data) => setLinks(data || {}))
      .catch(() => {});
  }, []);

  // Ne rien afficher si aucun lien n'est renseigné
  if (
    !links.facebookUrl &&
    !links.xUrl &&
    !links.youtubeUrl &&
    !links.tiktokUrl
  )
    return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 py-6 px-4">
      <div className="max-w-4xl mx-auto flex justify-center gap-6 text-2xl">
        {links.facebookUrl && (
          <a
            href={links.facebookUrl}
            target="_blank"
            className="text-gray-600 dark:text-gray-300 hover:text-brand-green"
            title="Facebook"
          >
            📘
          </a>
        )}
        {links.xUrl && (
          <a
            href={links.xUrl}
            target="_blank"
            className="text-gray-600 dark:text-gray-300 hover:text-brand-green"
            title="X (Twitter)"
          >
            🐦
          </a>
        )}
        {links.youtubeUrl && (
          <a
            href={links.youtubeUrl}
            target="_blank"
            className="text-gray-600 dark:text-gray-300 hover:text-brand-green"
            title="YouTube"
          >
            📺
          </a>
        )}
        {links.tiktokUrl && (
          <a
            href={links.tiktokUrl}
            target="_blank"
            className="text-gray-600 dark:text-gray-300 hover:text-brand-green"
            title="TikTok"
          >
            🎵
          </a>
        )}
      </div>
    </div>
  );
}
