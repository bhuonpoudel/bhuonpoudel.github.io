import { useEffect } from "react";

/** Pause Lenis smooth scrolling while an overlay (dialog, sheet…) is open. */
export function useLenisLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    window.__lenis?.stop();
    return () => window.__lenis?.start();
  }, [locked]);
}
