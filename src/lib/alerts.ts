export interface PriceAlert {
  id: string;
  symbol: string;
  direction: "above" | "below";
  price: number;
  createdAt: number;
}

const STORAGE_KEY = "asterdex-price-alerts";
const FAVORITES_KEY = "asterdex-favorites";

export function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(symbols: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(symbols));
}

export function loadAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PriceAlert[]) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: PriceAlert[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

// Three-note ascending ping using Web Audio API
export function playAlertSound(): void {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();

    const notes = [880, 1100, 1320];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.13;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  } catch {
    // AudioContext unavailable — silent fail
  }
}
