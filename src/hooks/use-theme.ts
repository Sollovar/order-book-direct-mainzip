/**
 * Shared theme hook — single source of truth across all mobile pages.
 *
 * - Reads initial value from localStorage / system preference on mount
 * - toggleTheme writes to localStorage + document.documentElement immediately
 * - MutationObserver keeps any component using this hook in sync if
 *   something else touches document.documentElement.classList externally
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
  // On the client (including client-side navigation), read localStorage
  // immediately so there is zero flicker. On the server, fall back to "dark"
  // and let suppressHydrationWarning absorb the mismatch.
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  // Apply the correct DOM state once on mount (covers both first SSR hydration
  // and client-side navigations where the DOM may still be from the prev page).
  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch for external DOM changes (e.g. another component toggling the class).
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme((prev) => {
        const next: "light" | "dark" = isDark ? "dark" : "light";
        return prev === next ? prev : next;
      });
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Toggle: apply to DOM + localStorage immediately, then update React state.
  // Calling applyTheme inside the updater is safe because applyTheme is a
  // pure DOM side-effect — it doesn't read React state.
  const toggleTheme = () => {
    setTheme((prev) => {
      const next: "light" | "dark" = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  };

  return { theme, toggleTheme };
}
