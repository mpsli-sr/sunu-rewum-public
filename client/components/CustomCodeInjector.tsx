"use client";
import { useEffect, useState } from "react";
import { http } from "@/lib/api";

export default function CustomCodeInjector() {
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");

  useEffect(() => {
    http
      .get<any>("/api/site-settings")
      .then((s) => {
        if (s) {
          if (s.customCSS) setCss(s.customCSS);
          if (s.customJS) setJs(s.customJS);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (css) {
      const style = document.createElement("style");
      style.id = "custom-css";
      style.textContent = css;
      document.head.appendChild(style);
      return () => {
        document.getElementById("custom-css")?.remove();
      };
    }
  }, [css]);

  useEffect(() => {
    if (js) {
      const script = document.createElement("script");
      script.id = "custom-js";
      script.textContent = js;
      document.body.appendChild(script);
      return () => {
        document.getElementById("custom-js")?.remove();
      };
    }
  }, [js]);

  return null;
}
