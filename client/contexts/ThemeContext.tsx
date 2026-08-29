"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { http } from "@/lib/api";

interface ThemeContextType {
  colors: { primary: string; secondary: string; accent: string };
  setColors: (c: any) => void;
  siteTitle: string;
  setSiteTitle: (t: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: { primary: "#008000", secondary: "#FFD700", accent: "#E31B23" },
  setColors: () => {},
  siteTitle: "SUNU REWUM",
  setSiteTitle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState({
    primary: "#008000",
    secondary: "#FFD700",
    accent: "#E31B23",
  });
  const [siteTitle, setSiteTitle] = useState("SUNU REWUM");

  useEffect(() => {
    http
      .get<any>("/api/site-settings")
      .then((s) => {
        if (s) {
          setColors({
            primary: s.primaryColor || "#008000",
            secondary: s.secondaryColor || "#FFD700",
            accent: s.accentColor || "#E31B23",
          });
          setSiteTitle(s.siteTitle || "SUNU REWUM");
          // Mettre à jour les variables CSS globales
          document.documentElement.style.setProperty(
            "--color-primary",
            s.primaryColor || "#008000",
          );
          document.documentElement.style.setProperty(
            "--color-secondary",
            s.secondaryColor || "#FFD700",
          );
          document.documentElement.style.setProperty(
            "--color-accent",
            s.accentColor || "#E31B23",
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <ThemeContext.Provider
      value={{ colors, setColors, siteTitle, setSiteTitle }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeColors = () => useContext(ThemeContext);
