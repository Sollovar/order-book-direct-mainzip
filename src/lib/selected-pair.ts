import { PAIRS, type Pair } from "./pairs";

const STORAGE_KEY = "asterdex-selected-pair";

export function loadSelectedPair(): Pair {
  if (typeof window === "undefined") return PAIRS[0];
  const symbol = localStorage.getItem(STORAGE_KEY);
  if (!symbol) return PAIRS[0];
  return PAIRS.find((p) => p.symbol === symbol) ?? PAIRS[0];
}

export function saveSelectedPair(pair: Pair) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, pair.symbol);
  }
}
