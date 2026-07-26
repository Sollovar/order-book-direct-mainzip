import { Search, Star, X, Bell, BellPlus, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { PAIRS, type Pair } from "../lib/pairs";
import type { PriceAlert } from "../lib/alerts";
import { loadFavorites, saveFavorites } from "../lib/alerts";

interface PairSelectorPanelProps {
  open: boolean;
  onClose: () => void;
  alerts?: PriceAlert[];
  onAddAlert?: (symbol: string, direction: "above" | "below", price: number) => void;
  onRemoveAlert?: (id: string) => void;
}

// ─── Price Alert Sheet ────────────────────────────────────────────────────────

function PriceAlertSheet({
  pair,
  alerts,
  onAddAlert,
  onRemoveAlert,
  onClose,
}: {
  pair: Pair;
  alerts: PriceAlert[];
  onAddAlert: (symbol: string, direction: "above" | "below", price: number) => void;
  onRemoveAlert: (id: string) => void;
  onClose: () => void;
}) {
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState(pair.price.replace(/,/g, ""));

  const pairAlerts = alerts.filter((a) => a.symbol === pair.symbol);

  function handleAdd() {
    const num = parseFloat(targetPrice);
    if (!num) return;
    onAddAlert(pair.symbol, direction, num);
    setTargetPrice(pair.price.replace(/,/g, ""));
  }

  return (
    <div className="fixed inset-0 flex flex-col justify-end" style={{ zIndex: 200 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet — hamburger texture */}
      <div
        className="relative bg-trade-card rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: "85vh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="h-[4px] w-9 rounded-full bg-trade-text/20" />
        </div>

        {/* Scrollable body — keyboard-safe */}
        <div
          className="overflow-y-auto"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        >

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <div>
            <p className="text-[11px] text-trade-text-muted uppercase tracking-widest font-medium">
              Price Alert
            </p>
            <p className="text-[18px] font-bold text-trade-text leading-tight flex items-center gap-2">
              {pair.symbol}
              <span
                className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "rgba(239,207,167,0.12)", color: "#EFCFA7" }}
              >
                {pair.lev}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
            aria-label="Close"
          >
            <X className="h-[15px] w-[15px] text-trade-text/70" />
          </button>
        </div>

        {/* Current price pill */}
        <div className="px-5 mb-4">
          <div className="flex items-center gap-2 bg-trade-surface rounded-xl px-4 py-3">
            <span className="text-[12px] text-trade-text-muted">Current price</span>
            <span className="flex-1" />
            <span className="text-[15px] font-semibold text-trade-text">{pair.price}</span>
            <span
              className={`text-[12px] font-medium ${pair.up ? "text-trade-bid" : "text-trade-ask"}`}
            >
              {pair.change}
            </span>
          </div>
        </div>

        {/* Direction toggle */}
        <div className="px-5 mb-4">
          <p className="text-[11px] text-trade-text-muted uppercase tracking-widest font-medium mb-2">
            Alert when price goes
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDirection("above")}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition-all"
              style={{
                backgroundColor:
                  direction === "above"
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(128,128,128,0.08)",
                color: direction === "above" ? "#19D18A" : "rgba(128,128,128,0.6)",
                border:
                  direction === "above"
                    ? "1px solid rgba(34,197,94,0.25)"
                    : "1px solid transparent",
              }}
            >
              <ChevronUp className="h-4 w-4" />
              Above
            </button>
            <button
              onClick={() => setDirection("below")}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition-all"
              style={{
                backgroundColor:
                  direction === "below"
                    ? "rgba(239,68,68,0.12)"
                    : "rgba(128,128,128,0.08)",
                color: direction === "below" ? "#ef4444" : "rgba(128,128,128,0.6)",
                border:
                  direction === "below"
                    ? "1px solid rgba(239,68,68,0.25)"
                    : "1px solid transparent",
              }}
            >
              <ChevronDown className="h-4 w-4" />
              Below
            </button>
          </div>
        </div>

        {/* Target price input */}
        <div className="px-5 mb-5">
          <p className="text-[11px] text-trade-text-muted uppercase tracking-widest font-medium mb-2">
            Target price (USDT)
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-trade-surface border border-trade-text/10 px-4 py-3">
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); handleAdd(); } }}
              className="flex-1 bg-transparent text-trade-text outline-none text-[16px] font-semibold"
              placeholder="0.00"
              inputMode="decimal"
              enterKeyHint="done"
            />
            <span className="text-[12px] text-trade-text-muted font-medium">USDT</span>
          </div>
        </div>

        {/* Set Alert button */}
        <div className="px-5 mb-4">
          <button
            onPointerDown={(e) => {
              // Dismiss keyboard immediately so layout is stable before click fires
              e.preventDefault();
              (document.activeElement as HTMLElement | null)?.blur();
              handleAdd();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-bold transition-all active:scale-[0.98]"
            style={{ backgroundColor: "#EFCFA7", color: "#0A0A0B" }}
          >
            <BellPlus className="h-4 w-4" />
            Set Alert
          </button>
        </div>

        {/* Active alerts for this pair */}
        {pairAlerts.length > 0 && (
          <div className="px-5">
            <p className="text-[11px] text-trade-text-muted uppercase tracking-widest font-medium mb-2">
              Active alerts
            </p>
            <div className="divide-y divide-trade-text/5">
              {pairAlerts.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-3">
                  <Bell className="h-4 w-4 text-trade-text/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-trade-text">{a.symbol}</p>
                    <p className="text-[11px] text-trade-text-muted">
                      {a.direction === "above" ? "↑ Above" : "↓ Below"}{" "}
                      {a.price.toLocaleString()} USDT
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveAlert(a.id)}
                    className="h-7 w-7 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-trade-text/50" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// ─── Pair Row ─────────────────────────────────────────────────────────────────

function PairRow({
  p,
  hasAlert,
  isFavorite,
  onSelect,
  onLongPress,
  onToggleFavorite,
}: {
  p: Pair;
  hasAlert: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onLongPress: (pair: Pair) => void;
  onToggleFavorite: (symbol: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState(false);

  function startPress() {
    setPressing(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setPressing(false);
      onLongPress(p);
    }, 2000);
  }

  function cancelPress() {
    setPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return (
    <div
      className="relative flex items-center select-none"
      style={{ cursor: "pointer" }}
      onPointerDown={startPress}
      onPointerUp={() => {
        if (timerRef.current) {
          cancelPress();
          onSelect();
        }
      }}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
    >
      {/* Long-press fill progress */}
      {pressing && (
        <span
          className="absolute inset-0 origin-left bg-trade-text/8 z-0"
          style={{ animation: "lp-fill 2s linear forwards" }}
        />
      )}

      {/* ── Sticky symbol cell ── */}
      <div
        className="sticky left-0 z-10 flex items-center gap-2 bg-trade-card w-[148px] flex-shrink-0 px-4 py-3"
      >
        {/* Star / alert icon — tappable, stops row-select propagation */}
        <button
          className="flex-shrink-0 active:scale-110 transition-transform z-20 relative"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => {
            e.stopPropagation();
            onToggleFavorite(p.symbol);
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {hasAlert ? (
            <Bell className="h-3.5 w-3.5 text-[#EFCFA7]" />
          ) : isFavorite ? (
            <Star className="h-3.5 w-3.5 text-[#EFCFA7] fill-[#EFCFA7]" />
          ) : (
            <Star className="h-3.5 w-3.5 text-trade-text/30" />
          )}
        </button>
        <div
          className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
          style={{ backgroundColor: p.color }}
        >
          {p.base.slice(0, 2)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[12px] font-semibold text-trade-text leading-tight truncate">
            {p.symbol}
          </span>
          <span className="text-[9px] text-trade-text-muted bg-trade-surface rounded px-1 mt-0.5 w-fit">
            {p.lev}
          </span>
        </div>
      </div>

      {/* ── Scrollable data cells ── */}
      <div className="flex flex-col items-end text-right w-[108px] flex-shrink-0 py-3 pr-3">
        <span className="text-[12px] text-trade-text">{p.vol}</span>
        <span className="text-[11px] text-trade-text-muted">{p.oi}</span>
      </div>

      <div className="flex flex-col items-end text-right w-[90px] flex-shrink-0 py-3 pr-3">
        <span className="text-[12px] text-trade-text">{p.price}</span>
        <span className={`text-[11px] font-medium ${p.up ? "text-trade-bid" : "text-trade-ask"}`}>
          {p.change}
        </span>
      </div>

      <div className="flex flex-col items-end text-right w-[80px] flex-shrink-0 py-3 pr-3">
        <span className="text-[12px] text-trade-text">{p.liquidity}</span>
      </div>

      <div className="flex flex-col items-end text-right w-[80px] flex-shrink-0 py-3 pr-4">
        <span className="text-[12px] text-trade-text">{p.marketCap}</span>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function PairSelectorPanel({
  open,
  onClose,
  alerts = [],
  onAddAlert,
  onRemoveAlert,
}: PairSelectorPanelProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [alertPair, setAlertPair] = useState<Pair | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => { setIsMounted(true); }, []);

  // Load favorites from localStorage once mounted
  useEffect(() => {
    if (isMounted) setFavorites(loadFavorites());
  }, [isMounted]);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const next = prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol];
      saveFavorites(next);
      return next;
    });
  }, []);

  const FILTERS = ["All", "Favorites", "Gainers", "Losers", "Volume", "Trending"];

  function applyFilter(pairs: Pair[]) {
    switch (filter) {
      case "Favorites":
        return pairs.filter((p) => favorites.includes(p.symbol));
      case "Gainers":
        return [...pairs].filter((p) => p.up).sort((a, b) =>
          parseFloat(b.change) - parseFloat(a.change)
        );
      case "Losers":
        return [...pairs].filter((p) => !p.up).sort((a, b) =>
          parseFloat(a.change) - parseFloat(b.change)
        );
      case "Volume":
        return [...pairs].sort((a, b) =>
          parseFloat(b.vol.replace(/[^0-9.]/g, "")) - parseFloat(a.vol.replace(/[^0-9.]/g, ""))
        );
      case "Trending":
        return [...pairs].sort((a, b) =>
          parseFloat(b.change.replace("%", "").replace("+", "")) -
          parseFloat(a.change.replace("%", "").replace("+", ""))
        );
      default:
        return pairs;
    }
  }

  // iOS-safe body scroll lock: position:fixed prevents rubber-band bounce
  // from dragging fixed-position elements sideways on Safari.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowX = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open || !isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col justify-end overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet — overflow-x:hidden prevents inner wide content from shifting the sheet sideways */}
      <div className="relative bg-trade-card rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-x-hidden">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="h-[4px] w-9 rounded-full bg-trade-text/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-2 pb-3 flex-shrink-0">
          <span className="text-[11px] font-semibold tracking-widest text-trade-text-muted uppercase">
            Select Market
          </span>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
            aria-label="Close"
          >
            <X className="h-[15px] w-[15px] text-trade-text/70" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-xl bg-trade-surface border border-trade-text/8 px-3 py-2.5">
            <Search className="h-4 w-4 text-trade-text/40 flex-shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent text-trade-text placeholder:text-trade-text/30 outline-none"
              style={{ fontSize: "16px" }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-5 px-4 pb-3 overflow-x-auto no-scrollbar border-b border-trade-text/8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 pb-2.5 text-[13px] font-medium border-b-2 transition-colors ${
                filter === f
                  ? "border-[#EFCFA7] text-trade-text"
                  : "border-transparent text-trade-text-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Pairs list — horizontally scrollable, symbol column sticky */}
        <div className="flex-1 overflow-y-auto overflow-x-auto no-scrollbar" style={{ overscrollBehaviorX: "contain" }}>
          <div style={{ minWidth: 520 }}>

            {/* Hold-to-alert hint */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-trade-surface/50">
              <Bell className="h-3 w-3 text-trade-text/30 flex-shrink-0" />
              <span className="text-[11px] text-trade-text/30">
                Hold a pair for 2 seconds to set a price alert
              </span>
            </div>

            {/* Column headers */}
            <div className="flex items-end bg-trade-card">
              {/* Sticky symbol header */}
              <div
                className="sticky left-0 z-10 bg-trade-card w-[148px] flex-shrink-0 px-4 pb-2 pt-1"
              >
                <span className="text-[11px] text-trade-text-muted">Symbol</span>
              </div>
              <div className="w-[108px] flex-shrink-0 pr-3 pb-2 pt-1 text-right">
                <span className="text-[11px] text-trade-text-muted">Volume</span>
                <br />
                <span className="text-[11px] text-trade-text-muted">Open interest</span>
              </div>
              <div className="w-[90px] flex-shrink-0 pr-3 pb-2 pt-1 text-right">
                <span className="text-[11px] text-trade-text-muted">Price</span>
                <br />
                <span className="text-[11px] text-trade-text-muted">24h change</span>
              </div>
              <div className="w-[80px] flex-shrink-0 pr-3 pb-2 pt-1 text-right">
                <span className="text-[11px] text-trade-text-muted">Liquidity</span>
              </div>
              <div className="w-[80px] flex-shrink-0 pr-4 pb-2 pt-1 text-right">
                <span className="text-[11px] text-trade-text-muted">Mkt Cap</span>
              </div>
            </div>

            {/* Rows */}
            {applyFilter(
              PAIRS.filter(
                (p) =>
                  search === "" ||
                  p.symbol.toLowerCase().includes(search.toLowerCase()),
              )
            ).map((p) => (
              <PairRow
                key={p.symbol}
                p={p}
                hasAlert={alerts.some((a) => a.symbol === p.symbol)}
                isFavorite={favorites.includes(p.symbol)}
                onSelect={onClose}
                onLongPress={(pair) => setAlertPair(pair)}
                onToggleFavorite={toggleFavorite}
              />
            ))}

          </div>
        </div>
      </div>

      {/* Price alert sheet — fixed, full-screen overlay */}
      {alertPair && (
        <PriceAlertSheet
          pair={alertPair}
          alerts={alerts}
          onAddAlert={onAddAlert}
          onRemoveAlert={onRemoveAlert}
          onClose={() => setAlertPair(null)}
        />
      )}

      {/* Long-press fill keyframe + scrollbar hide */}
      <style>{`
        @keyframes lp-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>,
    document.body
  );
}
