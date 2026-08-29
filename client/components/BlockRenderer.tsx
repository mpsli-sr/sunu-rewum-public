"use client";
import React, { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function BlockRenderer({ page }: { page: string }) {
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    http
      .get<any[]>(`/api/content-blocks/${page}`)
      .then(setBlocks)
      .catch(() => setBlocks([]));
  }, [page]);

  if (!blocks.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {blocks.map((block) => (
        <div
          key={block.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
        >
          {block.imageUrl && (
            <img src={block.imageUrl} className="w-full h-40 object-cover" />
          )}
          <div className="p-4">
            {block.title && (
              <h3 className="font-bold text-lg mb-2">{block.title}</h3>
            )}
            <div
              className="prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
            {block.linkUrl && (
              <a
                href={block.linkUrl}
                target="_blank"
                className="text-brand-green hover:underline mt-2 inline-block"
              >
                En savoir plus
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
