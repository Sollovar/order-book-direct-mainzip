/**
 * Shared theme hook — single source of truth across all mobile pages.
 *
 * - Reads initial value from localStorage / system preference
 * - Writes changes to localStorage AND document.documentElement.classList
 * - Uses MutationObserver so any component calling this hook stays in sync
 *   when another component (e.g. ChartOverlay's menu) changes the theme
 */
import { useEffect, useState } from "react";

const STORAGE_KEY = "asterdex-theme";

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.style.backgroundColor = "#0A0A0B";
    document.body.style.backgroundColor = "#0A0A0B";
  } else {
    root.classList.remove("dark");
    root.style.backgroundColor = "#F3F3F3";
    document.body.style.backgroundColor = "#F3F3F3";
  }
  localStorage.setItem(STORAGE_KEY, theme);
}

export function useTheme() {
  // Always start dark (matches SSR default) — client syncs in first useEffect
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // On first client mount, sync from localStorage / system preference
  useEffect(() => {
    const real = getInitialTheme();
    setTheme(real);
    applyTheme(real);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply to DOM whenever state changes (skips the initial render to avoid double-apply)
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Watch DOM for changes made by any other component / effect
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme((prev) => {
        const next = isDark ? "dark" : "light";
        return prev === next ? prev : next;
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
}
