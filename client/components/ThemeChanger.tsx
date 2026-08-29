"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeChanger() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Éviter le flash en attendant le montage
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-xs bg-white/10 rounded px-2 py-0.5 text-white"
      title="Changer le thème"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
