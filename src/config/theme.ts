/**
 * Theme registry. Palettes must have a matching [data-palette] block in
 * src/styles/global.css. `swatch` is only used for the picker UI.
 */
export const palettes = [
  { id: "forest", label: "Forest", swatch: "oklch(0.6 0.14 152)" },
  { id: "ocean", label: "Ocean", swatch: "oklch(0.58 0.15 245)" },
  { id: "sunset", label: "Sunset", swatch: "oklch(0.68 0.16 45)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.6 0.18 10)" },
  { id: "violet", label: "Violet", swatch: "oklch(0.56 0.18 290)" },
  { id: "neutral", label: "Neutral", swatch: "oklch(0.4 0 0)" },
] as const;

export type PaletteId = (typeof palettes)[number]["id"];
export type ThemeMode = "light" | "dark" | "system";

export const themeDefaults = {
  mode: "system" as ThemeMode,
  palette: "forest" as PaletteId,
  storageKeys: { mode: "theme-mode", palette: "theme-palette" },
};
