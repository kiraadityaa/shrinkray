// Catppuccin flavour state: "auto" follows the OS (Latte on light,
// Mocha on dark); explicit choices are persisted and forced via a
// flavour class on <html> (see @catppuccin/tailwindcss).

export type Flavour = "auto" | "latte" | "mocha";
export type ResolvedFlavour = "latte" | "mocha";

export const FLAVOUR_KEY = "shrinkray-flavour";
const FLAVOUR_CLASSES: ResolvedFlavour[] = ["latte", "mocha"];

export function getStoredFlavour(): Flavour {
  if (typeof window === "undefined") return "auto";
  const raw = window.localStorage.getItem(FLAVOUR_KEY);
  return raw === "latte" || raw === "mocha" || raw === "auto" ? raw : "auto";
}

export function resolveFlavour(flavour: Flavour): ResolvedFlavour {
  if (flavour !== "auto") return flavour;
  if (typeof window === "undefined") return "mocha";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "mocha" : "latte";
}

export function applyFlavour(flavour: Flavour): ResolvedFlavour {
  const resolved = resolveFlavour(flavour);
  const root = document.documentElement;
  root.classList.remove(...FLAVOUR_CLASSES);
  root.classList.add(resolved);
  root.style.colorScheme = resolved === "mocha" ? "dark" : "light";
  return resolved;
}
