"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function LatestPostsWidget() {
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => {
    http
      .get<any[]>("/api/posts")
      .then((data) => setPosts((data || []).slice(0, 3)))
      .catch(() => setPosts([]));
  }, []);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">📰 Dernières actualités</h2>
      {posts.length === 0 && (
        <p className="text-gray-500">Aucune publication récente.</p>
      )}
      {posts.map((post: any) => (
        <div
          key={post.id}
          className="border-b dark:border-gray-700 pb-2 last:border-0 mb-2"
        >
          <p className="font-medium">
            {post.user?.firstName ?? ""} {post.user?.lastName ?? ""}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {post.content}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(post.createdAt).toLocaleDateString("fr")}
          </p>
        </div>
      ))}
    </div>
  );
}
