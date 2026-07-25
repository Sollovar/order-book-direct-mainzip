import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Star,
  ChevronDown,
  Sun,
  Moon,
  BarChart2,
  UserCircle,
  PieChart,
  Link2,
  Search,
  Wallet,
  Bell,
  Settings,
  Menu,
} from "lucide-react";
import { PairSelectorPanel } from "./PairSelectorPanel";
import { LadderHistoryPanel } from "./LadderOrderSheet";
import { WalletButton } from "./WalletButton";
import { NotificationsSheet } from "./NotificationsSheet";
import { SettingsSheet } from "./SettingsSheet";

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

/* ─── Props ─────────────────────────────────────────── */
export interface ChartOverlayProps {
  open: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  countdown: number;
  navTab: string;
  setNavTab: (t: string) => void;
  onOpenChart: () => void;
  onOpenMenu: () => void;
}

/* ─── Main component ────────────────────────────────── */
export function ChartOverlay({
  open,
  theme,
  toggleTheme,
  countdown,
  navTab,
  setNavTab,
  onOpenChart,
  onOpenMenu,
}: ChartOverlayProps) {
  const [chartTab, setChartTab] = useState("Chart");
  const [timeframe, setTimeframe] = useState("1D");
  const [bottomTab, setBottomTab] = useState("Open Orders");
  const [pairsOpen, setPairsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentPrice = 63934.3;

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
        <div className="h-8 w-8 rounded-full border border-trade-text/15 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full border-2 border-trade-text/70 border-t-transparent rotate-45" />
        </div>
        <div className="flex items-center gap-2">
          {/* Connect / wallet — handled by Privy */}
          <WalletButton />
          {/* Notification */}
          <button
            className="h-8 w-8 rounded-full border border-trade-text/15 bg-trade-surface/50 flex items-center justify-center active:bg-trade-surface transition-colors"
            aria-label="Notifications"
            onClick={() => setNotifOpen(true)}
          >
            <Bell className="h-[15px] w-[15px] text-trade-text/70" />
          </button>
          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="h-8 w-8 rounded-full border border-trade-text/15 bg-trade-surface/50 flex items-center justify-center active:bg-trade-surface transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-[15px] w-[15px] text-trade-text/70" />
          </button>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="h-8 w-8 rounded-full border border-trade-text/15 bg-trade-surface/50 flex items-center justify-center active:bg-trade-surface transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-[15px] w-[15px] text-trade-text/70" />
            ) : (
              <Moon className="h-[15px] w-[15px] text-trade-text/70" />
            )}
          </button>
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
        <div className="rounded-3xl bg-trade-card shadow-2xl overflow-hidden">

          {/* Pair header */}
          <div className="px-3 pt-3 pb-2.5 bg-trade-surface/30">
            {/* Row 1: symbol + star */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setPairsOpen(true)}
                className="flex items-center gap-2 active:opacity-70 transition-opacity"
              >
                <span className="text-trade-text font-bold text-[17px] tracking-tight">BTCUSDT</span>
                <ChevronDown className="h-3.5 w-3.5 text-trade-text/40" />
                <span className="text-trade-ask text-[13px] font-medium">-1.32%</span>
              </button>
              <Star className="h-4.5 w-4.5 text-trade-text/25" />
            </div>

            {/* Row 2: price + stats */}
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
          </div>

          {/* Chart tab bar — "Chart" has filled pill style */}
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

          {/* Timeframe row */}
          <div className="flex items-center justify-between px-3 py-2 bg-trade-surface/30">
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
              {/* Layout icon */}
              <button className="text-trade-text-muted">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
              {/* Candle icon */}
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
          </div>

          {/* Chart area — slightly darker surface, clipped by card's rounded corners */}
          <div className="relative bg-trade-surface/30" style={{ height: 310 }}>
            {chartTab === "Chart" ? (
              <CandleChart candles={ALL_CANDLES.slice(-60)} currentPrice={currentPrice} />
            ) : (
              <div className="flex items-center justify-center h-full text-trade-text-muted text-[13px]">
                {chartTab} view
              </div>
            )}

            {/* Time bar pinned to bottom of chart */}
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
        </div>

        {/* ── OPEN ORDERS — tiny side gap, slight rounding ── */}
        <section className="rounded-3xl bg-trade-card shadow-2xl overflow-hidden">
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
        </section>

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
      <PairSelectorPanel open={pairsOpen} onClose={() => setPairsOpen(false)} />

      {/* Notifications Sheet */}
      {notifOpen && typeof document !== "undefined" && createPortal(
        <NotificationsSheet onClose={() => setNotifOpen(false)} theme={theme} />,
        document.body
      )}

      {/* Settings Sheet */}
      {settingsOpen && typeof document !== "undefined" && createPortal(
        <SettingsSheet onClose={() => setSettingsOpen(false)} theme={theme} toggleTheme={toggleTheme} />,
        document.body
      )}
    </div>
  );
}
