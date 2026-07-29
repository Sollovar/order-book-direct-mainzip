import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

// ── Order Book data ────────────────────────────────────────────────────────
const obBids = [
  { total: "167.34K", price: "64,838.1" },
  { total: "262.85K", price: "64,837.9" },
  { total: "282.95K", price: "64,837.2" },
  { total: "473.44K", price: "64,836.8" },
  { total: "498.40K", price: "64,836.6" },
  { total: "523.36K", price: "64,836.5" },
  { total: "543.46K", price: "64,835.9" },
  { total: "600.32K", price: "64,835.2" },
  { total: "620.42K", price: "64,835.0" },
  { total: "790.80K", price: "64,832.9" },
  { total: "813.62K", price: "64,831.5" },
  { total: "814.27K", price: "64,831.4" },
  { total: "886.23K", price: "64,830.9" },
  { total: "890.84K", price: "64,828.9" },
];
const obAsks = [
  { price: "64,838.2", total: "35.33K"  },
  { price: "64,839.8", total: "36.30K"  },
  { price: "64,840.8", total: "57.31K"  },
  { price: "64,840.9", total: "77.02K"  },
  { price: "64,841.0", total: "101.99K" },
  { price: "64,841.1", total: "126.95K" },
  { price: "64,841.6", total: "147.31K" },
  { price: "64,841.7", total: "196.72K" },
  { price: "64,841.8", total: "228.30K" },
  { price: "64,842.2", total: "435.73K" },
  { price: "64,843.3", total: "970.69K" },
  { price: "64,843.8", total: "1.16M"   },
  { price: "64,845.2", total: "1.19M"   },
  { price: "64,845.3", total: "1.21M"   },
];

// ── Trades data ────────────────────────────────────────────────────────────
const tradesData = [
  { price: "64,831.5", size: "3047.1", time: "18:10:39", side: "sell" },
  { price: "64,831.6", size: "259.4",  time: "18:10:39", side: "buy"  },
  { price: "64,831.5", size: "2398.8", time: "18:10:37", side: "sell" },
  { price: "64,831.6", size: "129.7",  time: "18:10:37", side: "buy"  },
  { price: "64,831.5", size: "2723.0", time: "18:10:35", side: "sell" },
  { price: "64,831.5", size: "2658.1", time: "18:10:33", side: "sell" },
  { price: "64,841.5", size: "129.7",  time: "18:10:32", side: "buy"  },
  { price: "64,841.4", size: "2593.7", time: "18:10:30", side: "sell" },
  { price: "64,843.8", size: "2399.3", time: "18:10:27", side: "buy"  },
  { price: "64,843.9", size: "129.7",  time: "18:10:27", side: "buy"  },
  { price: "64,835.0", size: "1296.7", time: "18:10:23", side: "buy"  },
  { price: "64,835.0", size: "1037.4", time: "18:10:22", side: "buy"  },
  { price: "64,835.1", size: "129.7",  time: "18:10:22", side: "buy"  },
];

// ── Depth chart data ───────────────────────────────────────────────────────
const depthData = [
  { price: 63271, bid: 30000000 },
  { price: 63400, bid: 29200000 },
  { price: 63550, bid: 28500000 },
  { price: 63700, bid: 27600000 },
  { price: 63850, bid: 26500000 },
  { price: 64000, bid: 24800000 },
  { price: 64150, bid: 23000000 },
  { price: 64300, bid: 21000000 },
  { price: 64450, bid: 18500000 },
  { price: 64580, bid: 15500000 },
  { price: 64680, bid: 12000000 },
  { price: 64760, bid: 8500000  },
  { price: 64810, bid: 4500000  },
  { price: 64831, bid: 0, ask: 0 },
  { price: 64855, ask: 9000000  },
  { price: 64900, ask: 19000000 },
  { price: 64950, ask: 23000000 },
  { price: 65050, ask: 26000000 },
  { price: 65200, ask: 27500000 },
  { price: 65400, ask: 28500000 },
  { price: 65600, ask: 29200000 },
  { price: 65800, ask: 29700000 },
  { price: 66000, ask: 30000000 },
  { price: 66200, ask: 30000000 },
  { price: 66392, ask: 30000000 },
];
import {
  ChevronDown,
  BarChart2,
  UserCircle,
  PieChart,
  Link2,
  Search,
  Menu,
  X,
  Check,
  LayoutList,
  TrendingUp,
  TrendingDown,
  CandlestickChart,
} from "lucide-react";
import { PairSelectorPanel } from "./PairSelectorPanel";
import { LadderHistoryPanel } from "./LadderOrderSheet";
import { WalletButton, MobileWalletMenu } from "./WalletButton";
import { PAIRS, type Pair } from "../lib/pairs";

/* ─── Precision helpers ─────────────────────────────────────────────────────── */

function getPrecisionOptions(priceStr: string): string[] {
  const clean = priceStr.replace(/[,\s]/g, "");
  const num = parseFloat(clean);
  if (!isFinite(num) || num <= 0) return ["0.1", "1", "10", "50", "100"];
  const dotIdx = clean.indexOf(".");
  const decimals = dotIdx === -1 ? 0 : clean.length - dotIdx - 1;
  const tick = decimals === 0 ? 1 : Math.pow(10, -decimals);
  return [1, 10, 100, 500, 1000].map((m) => {
    const val = tick * m;
    if (val >= 1) return String(Math.round(val));
    const dp = Math.max(0, Math.ceil(-Math.log10(val)));
    return val.toFixed(dp);
  });
}

function TickSizeSheet({
  current,
  options,
  onSelect,
  onClose,
  theme,
}: {
  current: string;
  options: string[];
  onSelect: (v: string) => void;
  onClose: () => void;
  theme: "light" | "dark";
}) {
  return (
    <div
      className={`fixed inset-0 flex flex-col justify-end ${theme === "dark" ? "dark" : ""}`}
      style={{ zIndex: 9999 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-trade-card rounded-t-3xl shadow-2xl"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-9 rounded-full bg-trade-text/20" />
        </div>
        <div className="flex items-center justify-between px-6 pt-2 pb-1">
          <div>
            <p className="text-[11px] text-trade-text-muted uppercase tracking-widest font-medium">Order Book</p>
            <p className="text-[18px] font-bold text-trade-text leading-tight">Precision</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
            aria-label="Close"
          >
            <X className="h-[15px] w-[15px] text-trade-text/70" />
          </button>
        </div>
        <div className="px-6 pt-2">
          {options.map((v, i) => (
            <button
              key={v}
              onClick={() => onSelect(v)}
              className={`w-full flex items-center justify-between py-4 text-left active:opacity-60 transition-opacity ${
                i < options.length - 1 ? "border-b border-trade-text/6" : ""
              }`}
            >
              <span className={`text-[17px] ${current === v ? "text-trade-text font-semibold" : "text-trade-text/70"}`}>
                {v}
              </span>
              {current === v && (
                <span className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f0b90b" }}>
                  <Check className="h-[13px] w-[13px] text-black" strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Seeded PRNG ────────────────────────────────────── */
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/* ─── Generate daily OHLC candles ───────────────────── */
type Candle = { t: number; o: number; h: number; l: number; c: number };

function generateCandles(): Candle[] {
  const rand = seededRand(42);
  const candles: Candle[] = [];
  const startMs = new Date("2024-05-01").getTime();
  let price = 60200;
  for (let i = 0; i < 90; i++) {
    const t = startMs + i * 86400_000;
    const move = (rand() - 0.46) * 1600;
    const open = price;
    const close = Math.max(55000, Math.min(70000, price + move));
    const high = Math.max(open, close) + rand() * 900;
    const low = Math.min(open, close) - rand() * 900;
    candles.push({ t, o: open, h: high, l: low, c: close });
    price = close;
  }
  return candles;
}

const ALL_CANDLES = generateCandles();

/* ─── Month labels for x-axis ───────────────────────── */
function monthLabels(candles: Candle[], chartW: number) {
  const cw = chartW / candles.length;
  const seen = new Set<string>();
  return candles.flatMap((c, i) => {
    const d = new Date(c.t);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ x: i * cw, label: d.toLocaleString("en", { month: "short" }) }];
  });
}

/* ─── Candlestick SVG chart ─────────────────────────── */
function CandleChart({ candles, currentPrice }: { candles: Candle[]; currentPrice: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 320, h: 300 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDims({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const PL = 4, PR = 64, PT = 30, PB = 30;
  const cW = dims.w - PL - PR;
  const cH = dims.h - PT - PB;

  const maxP = Math.max(...candles.map(c => c.h)) + 400;
  const minP = Math.min(...candles.map(c => c.l)) - 400;
  const range = maxP - minP;

  const toY = (p: number) => PT + ((maxP - p) / range) * cH;
  const candleW = cW / candles.length;
  const bodyW = Math.max(1.5, candleW * 0.55);

  // Price axis: 6 evenly spaced rounded labels
  const step = (maxP - minP) / 5;
  const priceAxis = Array.from({ length: 6 }, (_, i) =>
    Math.round((maxP - i * step) / 500) * 500
  );
  const months = monthLabels(candles, cW);
  const curY = toY(currentPrice);

  return (
    <div ref={ref} className="relative w-full h-full">
      <svg width={dims.w} height={dims.h} viewBox={`0 0 ${dims.w} ${dims.h}`} className="absolute inset-0">
        {/* Grid lines */}
        {priceAxis.map(p => (
          <line key={p} x1={PL} x2={dims.w - PR} y1={toY(p)} y2={toY(p)}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        ))}

        {/* Current price dashed line */}
        <line x1={PL} x2={dims.w - PR} y1={curY} y2={curY}
          stroke="#ef4444" strokeWidth={0.8} strokeDasharray="3 4" />

        {/* Candles */}
        {candles.map((c, i) => {
          const x = PL + i * candleW + candleW / 2;
          const up = c.c >= c.o;
          const col = up ? "#22c55e" : "#ef4444";
          const bTop = toY(Math.max(c.o, c.c));
          const bBot = toY(Math.min(c.o, c.c));
          const bH = Math.max(1, bBot - bTop);
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={toY(c.h)} y2={toY(c.l)} stroke={col} strokeWidth={0.8} />
              <rect x={x - bodyW / 2} y={bTop} width={bodyW} height={bH} fill={col} rx={0.5} />
            </g>
          );
        })}

        {/* Right axis price labels */}
        {priceAxis.map(p => (
          <text key={p} x={dims.w - PR + 5} y={toY(p) + 4}
            fill="rgba(255,255,255,0.32)" fontSize={9} fontFamily="monospace">
            {p.toLocaleString()}
          </text>
        ))}

        {/* Current price pill */}
        <rect x={dims.w - PR + 1} y={curY - 9} width={PR - 3} height={17} fill="#ef4444" rx={3} />
        <text x={dims.w - PR + 4} y={curY + 4}
          fill="white" fontSize={9} fontFamily="monospace" fontWeight="600">
          {currentPrice.toFixed(1)}
        </text>

        {/* Month labels */}
        {months.map(m => (
          <text key={m.label + m.x} x={PL + m.x + 4} y={dims.h - 8}
            fill="rgba(255,255,255,0.28)" fontSize={9} fontFamily="sans-serif">
            {m.label}
          </text>
        ))}

        {/* Chart watermark label top-left */}
        <text x={PL + 6} y={PT - 13} fill="rgba(255,255,255,0.45)" fontSize={10.5}
          fontFamily="sans-serif" fontWeight="600">
          BTCUSDT · 1D · Aster
        </text>
        <text x={PL + 6} y={PT - 1} fill="#22c55e" fontSize={9.5} fontFamily="monospace">
          {currentPrice.toFixed(1)}{"  0.0 (0.00%)"}
        </text>
      </svg>

      {/* TV watermark circle */}
      <div className="absolute left-4"
        style={{ bottom: 36, width: 36, height: 36, borderRadius: "50%",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700 }}>TV</span>
      </div>
    </div>
  );
}

/* ─── PairsView ──────────────────────────────────────
   Column headers live OUTSIDE the overflow-x-auto rows
   container so sticky top-0 isn't blocked by an overflow
   ancestor. Horizontal scroll is synced via refs.
─────────────────────────────────────────────────────── */
function PairsView({
  pairsSearch,
  setPairsSearch,
  filteredPairs,
  gainers,
  losers,
  activePair,
  onSelectPair,
}: {
  pairsSearch: string;
  setPairsSearch: (s: string) => void;
  filteredPairs: Pair[];
  gainers: Pair[];
  losers: Pair[];
  activePair: Pair;
  onSelectPair: (pair: Pair) => void;
}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  // Sync header horizontal scroll when rows are scrolled
  const onRowsScroll = useCallback(() => {
    if (headerRef.current && rowsRef.current) {
      headerRef.current.scrollLeft = rowsRef.current.scrollLeft;
    }
  }, []);

  const COL = { pair: 160, price: 96, change: 76, liquidity: 88, mktCap: 92 };
  const MIN_W = COL.pair + COL.price + COL.change + COL.liquidity + COL.mktCap + 16; // +16 for pr-4

  return (
    <div
      className="overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 190px)", scrollbarWidth: "none" }}
    >
      {/* Search bar */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 h-9 rounded-xl bg-trade-surface/60 border border-trade-text/8 px-3">
          <Search className="h-3.5 w-3.5 text-trade-text-muted flex-shrink-0" />
          <input
            value={pairsSearch}
            onChange={e => setPairsSearch(e.target.value)}
            placeholder="Search pairs…"
            className="flex-1 bg-transparent outline-none text-trade-text placeholder:text-trade-text-muted/60"
            style={{ fontSize: 16 }}
          />
          {pairsSearch && (
            <button onClick={() => setPairsSearch("")} className="flex-shrink-0 active:opacity-60">
              <X className="h-3.5 w-3.5 text-trade-text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Gainers & Losers — only shown when not searching */}
      {!pairsSearch && (
        <div className="flex-shrink-0">
          {/* Top Gainers */}
          <div className="px-3 pt-1 pb-2">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="h-5 w-5 rounded-md flex items-center justify-center" style={{ background: "rgba(240,185,11,0.12)" }}>
                <TrendingUp className="h-3 w-3 text-[#f0b90b]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#f0b90b]">Top Gainers</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {gainers.map(pair => (
                <button
                  key={pair.symbol}
                  onClick={() => onSelectPair(pair)}
                  className="flex-shrink-0 rounded-2xl p-3 text-left active:scale-[0.97] transition-transform"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 104 }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0" style={{ backgroundColor: pair.color }}>
                      {pair.base.charAt(0)}
                    </div>
                    <span className="text-[12px] font-bold text-trade-text leading-none">{pair.base}</span>
                  </div>
                  <div className="text-[11px] text-trade-text/60 mb-0.5 tabular-nums">{pair.price}</div>
                  <div className="text-[13px] font-bold tabular-nums text-trade-text/80">{pair.change}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="h-5 w-5 rounded-md flex items-center justify-center" style={{ background: "rgba(240,185,11,0.12)" }}>
                <TrendingDown className="h-3 w-3 text-[#f0b90b]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#f0b90b]">Top Losers</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {losers.map(pair => (
                <button
                  key={pair.symbol}
                  onClick={() => onSelectPair(pair)}
                  className="flex-shrink-0 rounded-2xl p-3 text-left active:scale-[0.97] transition-transform"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 104 }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0" style={{ backgroundColor: pair.color }}>
                      {pair.base.charAt(0)}
                    </div>
                    <span className="text-[12px] font-bold text-trade-text leading-none">{pair.base}</span>
                  </div>
                  <div className="text-[11px] text-trade-text/60 mb-0.5 tabular-nums">{pair.price}</div>
                  <div className="text-[13px] font-bold tabular-nums text-trade-text/80">{pair.change}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mx-3 mb-1" style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>
      )}

      {/* ── STICKY COLUMN HEADERS ──
          Outside the rows overflow-x-auto so sticky top-0 works.
          Scrolls horizontally in sync with the rows via JS ref.     */}
      <div
        ref={headerRef}
        className="sticky top-0 z-20 overflow-x-hidden flex-shrink-0 bg-trade-card border-b border-trade-text/8"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex items-center" style={{ minWidth: MIN_W }}>
          <div
            className="flex-shrink-0 px-4 py-2 text-[10px] uppercase tracking-wider text-trade-text-muted/60 font-semibold"
            style={{ minWidth: COL.pair }}
          >
            Pair
          </div>
          <span className="text-right text-[10px] uppercase tracking-wider text-trade-text-muted/60 font-semibold" style={{ minWidth: COL.price }}>Price</span>
          <span className="text-right text-[10px] uppercase tracking-wider text-trade-text-muted/60 font-semibold" style={{ minWidth: COL.change }}>24h</span>
          <span className="text-right text-[10px] uppercase tracking-wider text-[#f0b90b]/70 font-semibold" style={{ minWidth: COL.liquidity }}>Liquidity</span>
          <span className="text-right text-[10px] uppercase tracking-wider text-trade-text-muted/60 font-semibold pr-4" style={{ minWidth: COL.mktCap }}>Mkt Cap</span>
        </div>
      </div>

      {/* ── SCROLLABLE ROWS ── */}
      <div
        ref={rowsRef}
        className="overflow-x-auto pb-3"
        style={{ scrollbarWidth: "none" }}
        onScroll={onRowsScroll}
      >
        <div style={{ minWidth: MIN_W }}>
          {filteredPairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Search className="h-7 w-7 text-trade-text/20" />
              <span className="text-[13px] text-trade-text-muted">No pairs found</span>
            </div>
          ) : filteredPairs.map((pair, i) => (
            <button
              key={pair.symbol}
              onClick={() => onSelectPair(pair)}
              className={`w-full flex items-center active:bg-trade-text/5 transition-colors text-left ${
                activePair.symbol === pair.symbol ? "bg-trade-text/5" : ""
              } ${i > 0 ? "border-t border-trade-text/5" : ""}`}
            >
              {/* Pair cell — sticky left so it stays visible on horizontal scroll */}
              <div
                className="sticky left-0 z-10 flex-shrink-0 flex items-center gap-2.5 px-4 py-3"
                style={{
                  minWidth: COL.pair,
                  background: activePair.symbol === pair.symbol
                    ? "color-mix(in srgb, var(--trade-card, #141418) 90%, white 10%)"
                    : "var(--trade-card, #141418)",
                }}
              >
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0 shadow-sm" style={{ backgroundColor: pair.color }}>
                  {pair.base.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-trade-text leading-tight">{pair.base}</span>
                    <span className="text-[9px] px-1 py-px rounded font-bold text-trade-text-muted/70" style={{ background: "rgba(255,255,255,0.07)" }}>{pair.lev}</span>
                    {activePair.symbol === pair.symbol && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f0b90b] flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-trade-text-muted/60 truncate block">{pair.symbol}</span>
                </div>
              </div>
              {/* Price */}
              <span className="text-[12px] font-medium text-trade-text tabular-nums text-right" style={{ minWidth: COL.price }}>{pair.price}</span>
              {/* 24h change */}
              <span className="text-[12px] font-bold tabular-nums text-right" style={{ minWidth: COL.change, color: pair.up ? "#00c076" : "#f04f5a" }}>{pair.change}</span>
              {/* Liquidity */}
              <span className="text-[12px] font-medium text-trade-text/70 tabular-nums text-right" style={{ minWidth: COL.liquidity }}>{pair.liquidity}</span>
              {/* Market Cap */}
              <span className="text-[12px] font-medium text-trade-text/70 tabular-nums text-right pr-4" style={{ minWidth: COL.mktCap }}>{pair.marketCap}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Props ─────────────────────────────────────────── */
export interface ChartOverlayProps {
  open: boolean;
  theme: "light" | "dark";
  countdown: number;
  navTab: string;
  setNavTab: (t: string) => void;
  onOpenChart: () => void;
  onOpenMenu: () => void;
  /** Currently selected trading pair (synced with the trade page) */
  selectedPair?: Pair;
  /** Called when the user picks a different pair from within this overlay */
  onSelectPair?: (pair: Pair) => void;
}

/* ─── Main component ────────────────────────────────── */
export function ChartOverlay({
  open,
  theme,
  countdown,
  navTab,
  setNavTab,
  onOpenChart,
  onOpenMenu,
  selectedPair: externalPair,
  onSelectPair,
}: ChartOverlayProps) {
  const activePair = externalPair ?? PAIRS[0];

  const [chartTab, setChartTab] = useState("Chart");
  const [timeframe, setTimeframe] = useState("1D");
  const [bottomTab, setBottomTab] = useState("Open Orders");
  const [pairsOpen, setPairsOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chart" | "pairs">("chart");
  const [pairsSearch, setPairsSearch] = useState("");
  const currentPrice = 63934.3;

  // Compute top gainers & losers from the PAIRS list
  const gainers = [...PAIRS]
    .filter(p => p.up)
    .sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
    .slice(0, 5);
  const losers = [...PAIRS]
    .filter(p => !p.up)
    .sort((a, b) => parseFloat(a.change) - parseFloat(b.change))
    .slice(0, 5);
  const filteredPairs = PAIRS.filter(p =>
    p.symbol.toLowerCase().includes(pairsSearch.toLowerCase()) ||
    p.base.toLowerCase().includes(pairsSearch.toLowerCase())
  );

  // Precision / tick-size state — derived from the active pair's price
  const precisionOptions = getPrecisionOptions(activePair.price);
  const [tickSize, setTickSize] = useState(() => getPrecisionOptions(activePair.price)[0]);
  const [tickSheetOpen, setTickSheetOpen] = useState(false);

  // When the pair changes, reset tickSize to the finest option for that pair
  useEffect(() => {
    const opts = getPrecisionOptions(activePair.price);
    setTickSize((prev) => (opts.includes(prev) ? prev : opts[0]));
  }, [activePair.price]);

  const fmtCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  if (!open) return null;

  const chartTabs = ["Chart", "Order Book", "Trades", "Depth", "Details"];
  const timeframes = ["5m", "1H", "1D"];
  const bottomTabs = ["Open Orders", "Ladder History", "Order History", "Trade History"];

  return (
    <div
      className={`fixed inset-0 z-[70] flex flex-col bg-trade-bg text-trade-text font-sans text-[13px] overflow-y-auto pb-20 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      {/* ── TOP NAV — identical to trade page ── */}
      <header className="flex items-center justify-between px-3 pt-4 pb-3 flex-shrink-0">
        <img src="https://ndgywsfyfxrixhkfrtia.supabase.co/storage/v1/object/public/My%20logod/IMG_8707.png" alt="Logo" className="h-8 w-8 object-contain" />
        <div className="flex items-center gap-2">
          {/* Connect / wallet — handled by Privy */}
          <WalletButton />
          {/* Hamburger */}
          <button
            onClick={onOpenMenu}
            className="h-8 w-8 flex items-center justify-center active:opacity-60 transition-opacity"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5 text-trade-text/80" />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT — tiny side gap ── */}
      <div className="flex-1 px-1 flex flex-col gap-1">

        {/* ── CHART CARD — tiny side gap, slight rounding ── */}
        <div className={`rounded-3xl bg-trade-card shadow-2xl ${viewMode === "chart" ? "overflow-hidden" : "overflow-visible"}`}>

          {/* Pair header */}
          <div className="px-3 pt-3 pb-2.5 bg-trade-surface/30">
            {/* Row 1: symbol (hidden in pairs mode) + view-mode toggle */}
            <div className="flex items-center justify-between mb-2">
              {viewMode === "chart" ? (
                <button
                  onClick={() => setPairsOpen(true)}
                  className="flex items-center gap-2 active:opacity-70 transition-opacity"
                >
                  <span className="text-trade-text font-bold text-[17px] tracking-tight">{activePair.symbol}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-trade-text/40" />
                  <span className="text-trade-ask text-[13px] font-medium">-1.32%</span>
                </button>
              ) : (
                <div />
              )}
              {/* Chart / Pairs icon toggle */}
              <div className="flex items-center gap-0.5 rounded-lg bg-trade-surface/70 p-0.5">
                <button
                  onClick={() => setViewMode("chart")}
                  className={`h-7 w-7 flex items-center justify-center rounded-md transition-all duration-150 ${
                    viewMode === "chart"
                      ? "bg-[#f0b90b]/15 text-[#f0b90b]"
                      : "text-trade-text/35 hover:text-trade-text/60"
                  }`}
                  aria-label="Chart view"
                >
                  <CandlestickChart className="h-[15px] w-[15px]" />
                </button>
                <button
                  onClick={() => { setViewMode("pairs"); setPairsSearch(""); }}
                  className={`h-7 w-7 flex items-center justify-center rounded-md transition-all duration-150 ${
                    viewMode === "pairs"
                      ? "bg-[#f0b90b]/15 text-[#f0b90b]"
                      : "text-trade-text/35 hover:text-trade-text/60"
                  }`}
                  aria-label="Pairs list"
                >
                  <LayoutList className="h-[15px] w-[15px]" />
                </button>
              </div>
            </div>

            {/* Row 2: price + stats — hidden in pairs mode */}
            {viewMode === "chart" && (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-trade-text-muted text-[11px]">Index price</span>
                    <ChevronDown className="h-2.5 w-2.5 text-trade-text/30" />
                  </div>
                  <div className="text-trade-text font-bold text-[26px] leading-none tracking-tight">
                    {currentPrice.toLocaleString("en", { minimumFractionDigits: 1 })}
                  </div>
                  <div className="text-trade-text-muted text-[11px] mt-1.5">
                    Last price 63,911.9
                  </div>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="flex gap-3 justify-end text-[9px] text-trade-text-muted">
                    <span>24h Vol (USDT)</span>
                    <span>OI (USDT)</span>
                  </div>
                  <div className="flex gap-4 justify-end text-[10px]">
                    <span className="text-trade-text/80 font-medium">850.72M</span>
                    <span className="text-trade-text/80 font-medium">768.73M</span>
                  </div>
                  <div className="text-[9px] text-trade-text-muted">Funding (8h) / Countdown</div>
                  <div className="text-[10px] text-trade-text/80 font-medium">
                    0.0076% / {fmtCountdown(countdown)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── CHART VIEW ── */}
          {viewMode === "chart" && <>
            {/* Chart tab bar */}
            <div className="flex items-center gap-1 px-3 pt-2.5 pb-0 overflow-x-auto bg-trade-surface/30">
              {chartTabs.map(t => (
                <button
                  key={t}
                  onClick={() => setChartTab(t)}
                  className={`flex-shrink-0 text-[13px] font-medium pb-2.5 px-2 transition-colors border-b-2 ${
                    chartTab === t
                      ? "text-trade-text border-trade-text"
                      : "text-trade-text-muted border-transparent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Timeframe row — only visible on Chart tab */}
            {chartTab === "Chart" && <div className="flex items-center justify-between px-3 py-2 bg-trade-surface/30">
              <div className="flex items-center gap-4">
                {timeframes.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`text-[13px] font-medium transition-colors ${
                      timeframe === tf ? "text-trade-text" : "text-trade-text-muted"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
                <button className="text-trade-text-muted">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <div className="w-px h-4 bg-trade-text/10 mx-1" />
                <button className="text-trade-text-muted">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </button>
                <button className="text-trade-text-muted">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="5" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
                    <line x1="4.5" y1="2" x2="4.5" y2="5" stroke="currentColor" strokeWidth="1.3" />
                    <line x1="4.5" y1="11" x2="4.5" y2="14" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="10" y="4" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
                    <line x1="11.5" y1="1" x2="11.5" y2="4" stroke="currentColor" strokeWidth="1.3" />
                    <line x1="11.5" y1="10" x2="11.5" y2="13" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </button>
              </div>
            </div>}

            {/* Chart area */}
            {chartTab === "Chart" && (
              <div className="relative bg-trade-surface/30" style={{ height: 310 }}>
                <CandleChart candles={ALL_CANDLES.slice(-60)} currentPrice={currentPrice} />
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 text-[10px] bg-trade-surface/30">
                  <span className="font-mono text-trade-text-muted">
                    {new Date().toLocaleTimeString("en-GB", {
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                    })}{" "}UTC+1
                  </span>
                  <div className="flex items-center gap-3 text-trade-text-muted">
                    <span>%</span>
                    <span>log</span>
                    <span className="text-trade-text font-medium">auto</span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Book */}
            {chartTab === "Order Book" && (
              <div className="px-3 pb-4">
                <div className="flex items-center justify-between py-2">
                  <button className="flex flex-col gap-[3px]" aria-label="Book view">
                    <div className="flex gap-[3px]">
                      <div className="h-[4px] w-[4px] rounded-[1px] bg-[#00c076]" />
                      <div className="h-[4px] w-[4px] rounded-[1px] bg-[#f04f5a]" />
                    </div>
                    <div className="flex gap-[3px]">
                      <div className="h-[4px] w-[4px] rounded-[1px] bg-[#00c076]" />
                      <div className="h-[4px] w-[4px] rounded-[1px] bg-[#f04f5a]" />
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5 text-[12px] text-trade-text/70">
                    <button onClick={() => setTickSheetOpen(true)} className="flex items-center gap-1 active:opacity-60 transition-opacity">
                      {tickSize} <span className="text-[8px] leading-none">▼</span>
                    </button>
                    <span className="text-trade-text-muted ml-1">USDT</span>
                    <span className="text-[8px] leading-none">▼</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 text-[11px] text-trade-text-muted pb-1.5 border-b border-trade-text/8">
                  <span className="text-left">Total (USDT)</span>
                  <span className="text-right">Price (USDT)</span>
                  <span className="text-left pl-3">Price (USDT)</span>
                  <span className="text-right">Total (USDT)</span>
                </div>
                <div className="mt-[3px] space-y-[3px]">
                  {obBids.map((bid, i) => {
                    const ask = obAsks[i];
                    return (
                      <div key={i} className="grid grid-cols-4 text-[12px] leading-[19px]">
                        <span className="text-trade-text/65 text-left">{bid.total}</span>
                        <span className="text-[#00c076] text-right">{bid.price}</span>
                        <span className="text-[#f04f5a] text-left pl-3">{ask.price}</span>
                        <span className="text-trade-text/65 text-right">{ask.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Trades */}
            {chartTab === "Trades" && (
              <div className="px-3 pb-4">
                <div className="grid grid-cols-3 text-[11px] text-trade-text-muted py-2 border-b border-trade-text/8">
                  <span className="text-left">Price(USDT)</span>
                  <span className="text-center">Size(USDT)</span>
                  <span className="text-right">Time</span>
                </div>
                <div className="mt-[3px] space-y-[3px]">
                  {tradesData.map((tr, i) => (
                    <div key={i} className="grid grid-cols-3 text-[12px] leading-[20px]">
                      <span className={tr.side === "buy" ? "text-[#00c076]" : "text-[#f04f5a]"}>{tr.price}</span>
                      <span className="text-center text-trade-text/80">{tr.size}</span>
                      <span className="text-right text-trade-text-muted">{tr.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Depth */}
            {chartTab === "Depth" && (
              <div className="pb-2 pt-1">
                <ResponsiveContainer width="100%" height={310}>
                  <AreaChart data={depthData} margin={{ top: 8, right: 48, bottom: 4, left: 0 }}>
                    <defs>
                      <linearGradient id="mktBidFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00c076" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#00c076" stopOpacity={0.06} />
                      </linearGradient>
                      <linearGradient id="mktAskFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f04f5a" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#f04f5a" stopOpacity={0.06} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="price" type="number" domain={[63271, 66392]}
                      ticks={[63271, 64831, 66392]}
                      tickFormatter={(v: number) => v === 63271 ? "63,270.8" : v === 64831 ? "64,831.5" : "66,392.3"}
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} scale="linear" />
                    <YAxis orientation="right" tickFormatter={(v: number) => `${Math.round(v / 1_000_000)}M`}
                      ticks={[10_000_000, 20_000_000, 30_000_000, 40_000_000, 50_000_000]} domain={[0, 52_000_000]}
                      tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} width={38} />
                    <Area type="stepBefore" dataKey="bid" stroke="#00c076" strokeWidth={1.5} fill="url(#mktBidFill)" connectNulls={false} isAnimationActive={false} />
                    <Area type="stepAfter" dataKey="ask" stroke="#f04f5a" strokeWidth={1.5} fill="url(#mktAskFill)" connectNulls={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Details */}
            {chartTab === "Details" && (
              <div className="flex items-center justify-center py-14">
                <span className="text-trade-text-muted text-[13px]">Coming soon</span>
              </div>
            )}
          </>}

          {/* ── PAIRS VIEW ── */}
          {viewMode === "pairs" && (
            <PairsView
              pairsSearch={pairsSearch}
              setPairsSearch={setPairsSearch}
              filteredPairs={filteredPairs}
              gainers={gainers}
              losers={losers}
              activePair={activePair}
              onSelectPair={(pair) => { onSelectPair?.(pair); setViewMode("chart"); }}
            />
          )}

        </div>

        {/* ── OPEN ORDERS — only shown in chart view ── */}
        {viewMode === "chart" && <section className="rounded-3xl bg-trade-card shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-trade-text/5 px-3">
            <div className="flex items-center justify-between flex-1">
              {bottomTabs.map(t => (
                <button
                  key={t}
                  onClick={() => setBottomTab(t)}
                  className={`py-3 text-[13px] whitespace-nowrap ${
                    bottomTab === t
                      ? "text-trade-text border-b-2 border-trade-text -mb-px"
                      : "text-trade-text-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {bottomTab === "Ladder History" ? (
            <LadderHistoryPanel />
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="h-14 w-14 rounded-lg bg-trade-surface flex items-center justify-center relative">
                <Link2 className="h-6 w-6 text-trade-text/40" />
                <Search className="h-3.5 w-3.5 text-trade-text/60 absolute bottom-2 right-2" />
              </div>
              <div className="text-trade-text-muted text-[13px]">Please connect a wallet first</div>
            </div>
          )}
        </section>}

      </div>

      {/* ── BOTTOM NAV — identical to trade page ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-trade-card border-t border-trade-text/5 flex items-center justify-around px-8 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        {[
          {
            label: "Markets",
            icon: (active: boolean) => (
              <BarChart2 className={`h-[18px] w-[18px] ${active ? "text-[#f0b90b]" : "text-trade-text/40"}`} />
            ),
          },
          {
            label: "Trade",
            icon: (active: boolean) => (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
                <circle cx="6.5" cy="9" r="5.5" fill="currentColor" className={active ? "text-[#f0b90b]" : "text-trade-text/40"} />
                <circle cx="11.5" cy="9" r="5.5" fill="currentColor" fillOpacity="0.65" className={active ? "text-[#f0b90b]" : "text-trade-text/40"} />
              </svg>
            ),
          },
          {
            label: "Portfolio",
            icon: (active: boolean) => (
              <PieChart className={`h-[18px] w-[18px] ${active ? "text-[#f0b90b]" : "text-trade-text/40"}`} />
            ),
          },
          {
            label: "Account",
            icon: (active: boolean) => (
              <UserCircle className={`h-[18px] w-[18px] ${active ? "text-[#f0b90b]" : "text-trade-text/40"}`} />
            ),
          },
        ].map(({ label, icon }) => {
          const active = navTab === label;
          return (
            <button
              key={label}
              onClick={() => {
                if (label === "Account") { setWalletMenuOpen(true); return; }
                setNavTab(label);
                if (label === "Markets") onOpenChart();
              }}
              className="flex items-center gap-2 transition-opacity active:opacity-60"
            >
              {icon(active)}
              <span className={`text-[14px] font-medium tracking-tight ${active ? "text-[#f0b90b]" : "text-trade-text/40"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Pair selector panel */}
      <PairSelectorPanel
        open={pairsOpen}
        onClose={() => setPairsOpen(false)}
        onSelect={(pair) => {
          if (onSelectPair) onSelectPair(pair);
          setPairsOpen(false);
        }}
      />

      {/* Mobile wallet menu — triggered by Account tab */}
      <MobileWalletMenu open={walletMenuOpen} onClose={() => setWalletMenuOpen(false)} />

      {/* Tick Size Bottom Sheet */}
      {tickSheetOpen && typeof document !== "undefined" && createPortal(
        <TickSizeSheet
          current={tickSize}
          options={precisionOptions}
          onSelect={(v) => { setTickSize(v); setTickSheetOpen(false); }}
          onClose={() => setTickSheetOpen(false)}
          theme={theme}
        />,
        document.body
      )}

    </div>
  );
}
