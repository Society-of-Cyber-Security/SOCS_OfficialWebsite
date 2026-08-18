"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface SiteTheme {
  primary: string;    // e.g. "#0284C7"
  secondary: string;  // e.g. "#6366F1"
  background: string; // e.g. "#F8FAFC"
  font: string;
}

export const FONT_PRESETS: Record<string, { label: string; cssVar: string }> = {
  jakarta:    { label: "Plus Jakarta Sans (default)", cssVar: "var(--font-jakarta)" },
  grotesk:    { label: "Space Grotesk",               cssVar: "var(--font-space-grotesk)" },
  inter:      { label: "Inter",                       cssVar: "var(--font-inter)" },
  jetbrains:  { label: "JetBrains Mono",              cssVar: "var(--font-jetbrains)" },
};

export const DEFAULT_THEME: SiteTheme = {
  primary:    "#0284C7",
  secondary:  "#6366F1",
  background: "#F8FAFC",
  font:       "var(--font-jakarta)",
};

interface ThemeContextValue {
  theme: SiteTheme;
  setThemePrimary:    (color: string) => string | null;
  setThemeSecondary:  (color: string) => string | null;
  setThemeBackground: (color: string) => string | null;
  setThemeFont:       (fontKey: string) => string | null;
  resetTheme:         () => void;
  FONT_PRESETS: typeof FONT_PRESETS;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const LS_KEY = "socs-theme-v2";
const OVERRIDE_STYLE_ID = "socs-theme-override";

function isValidColor(raw: string): boolean {
  if (typeof window === "undefined") return true;
  const s = new Option().style;
  s.color = raw;
  return s.color !== "";
}

function applyThemeToDom(t: SiteTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.style.setProperty("--color-primary",    t.primary);
  root.style.setProperty("--color-secondary",  t.secondary);
  root.style.setProperty("--color-background", t.background);
  root.style.setProperty("--background",       t.background);
  document.body.style.setProperty("background-color", t.background);
}

function loadThemeFromStorage(): SiteTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);

  useEffect(() => {
    const saved = loadThemeFromStorage();
    setTheme(saved);
    applyThemeToDom(saved);
  }, []);

  const updateField = useCallback(
    (patch: Partial<SiteTheme>) => {
      setTheme((prev) => {
        const next = { ...prev, ...patch };
        applyThemeToDom(next);
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const setThemePrimary = useCallback(
    (color: string): string | null => {
      if (!isValidColor(color)) return `invalid color: "${color}"`;
      updateField({ primary: color });
      return null;
    },
    [updateField]
  );

  const setThemeSecondary = useCallback(
    (color: string): string | null => {
      if (!isValidColor(color)) return `invalid color: "${color}"`;
      updateField({ secondary: color });
      return null;
    },
    [updateField]
  );

  const setThemeBackground = useCallback(
    (color: string): string | null => {
      if (!isValidColor(color)) return `invalid color: "${color}"`;
      updateField({ background: color });
      return null;
    },
    [updateField]
  );

  const setThemeFont = useCallback(
    (fontKey: string): string | null => {
      const preset = FONT_PRESETS[fontKey.toLowerCase()];
      if (!preset) {
        return `unknown font "${fontKey}". available: ${Object.keys(FONT_PRESETS).join(", ")}`;
      }
      updateField({ font: preset.cssVar });
      return null;
    },
    [updateField]
  );

  const resetTheme = useCallback(() => {
    updateField(DEFAULT_THEME);
  }, [updateField]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setThemePrimary,
        setThemeSecondary,
        setThemeBackground,
        setThemeFont,
        resetTheme,
        FONT_PRESETS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
