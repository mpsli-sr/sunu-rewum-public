"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function BackgroundWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bgImage, setBgImage] = useState("");

  useEffect(() => {
    http
      .get<any>("/api/site-settings")
      .then((s) => {
        if (s?.backgroundImage) setBgImage(s.backgroundImage);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={
        bgImage
          ? {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : {}
      }
      className="min-h-screen"
    >
      {children}
    </div>
  );
}
