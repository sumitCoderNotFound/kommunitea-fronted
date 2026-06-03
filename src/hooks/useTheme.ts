import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "kommunitea_theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

/** Light by default; choice persists across visits and re-themes the whole app. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try { return (localStorage.getItem(KEY) as Theme) || "light"; } catch { return "light"; }
  });

  useEffect(() => { apply(theme); }, [theme]);

  const setTheme = (t: Theme) => {
    try { localStorage.setItem(KEY, t); } catch { /* ignore */ }
    setThemeState(t);
  };
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggle };
}

/** Call once at app start to apply the saved theme before render (avoids flash). */
export function initTheme() {
  try {
    const saved = (localStorage.getItem(KEY) as Theme) || "light";
    apply(saved);
  } catch { /* ignore */ }
}
