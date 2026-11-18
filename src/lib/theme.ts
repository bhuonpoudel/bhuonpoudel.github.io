/** Client-side theme controller (mode + palette), shared by every theme UI. */
import { themeDefaults, type PaletteId, type ThemeMode } from "@/config/theme";

const { storageKeys } = themeDefaults;
const media = () => window.matchMedia("(prefers-color-scheme: dark)");

function read<T extends string>(key: string, fallback: T): T {
  try {
    return (localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable – theme still applies for this page view */
  }
}

export const getMode = () => read<ThemeMode>(storageKeys.mode, themeDefaults.mode);
export const getPalette = () => read<PaletteId>(storageKeys.palette, themeDefaults.palette);

export function resolveDark(mode: ThemeMode) {
  return mode === "dark" || (mode === "system" && media().matches);
}

type Origin = { x: number; y: number } | undefined;

/** Runs `apply` inside a View Transition with a circular reveal from `origin`. */
function transition(apply: () => void, origin?: Origin) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) return apply();

  const vt = document.startViewTransition(apply);
  if (!origin) return;
  vt.ready.then(() => {
    const { x, y } = origin;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 550, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

function emit() {
  window.dispatchEvent(new CustomEvent("themechange", { detail: { mode: getMode(), palette: getPalette() } }));
}

export function setMode(mode: ThemeMode, origin?: Origin) {
  write(storageKeys.mode, mode);
  const dark = resolveDark(mode);
  if (dark === document.documentElement.classList.contains("dark")) return emit();
  transition(() => document.documentElement.classList.toggle("dark", dark), origin);
  emit();
}

export function setPalette(palette: PaletteId, origin?: Origin) {
  write(storageKeys.palette, palette);
  transition(() => (document.documentElement.dataset.palette = palette), origin);
  emit();
}

/** Keep "system" mode in sync with the OS. Call once per page. */
export function watchSystemTheme() {
  media().addEventListener("change", () => {
    if (getMode() === "system") document.documentElement.classList.toggle("dark", media().matches);
  });
}
