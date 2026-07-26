import { useEffect, useRef, useState } from "react";
import { WalletButton } from "../WalletButton";
import {
  ChevronDown,
  Star,
  Maximize2,
  Settings,
  Globe,
  Grid3x3,
  ArrowLeftRight,
  Twitter,
  MessageCircle,
  BarChart3,
  LineChart,
  Type,
  Pencil,
  Ruler,
  Smile,
  Magnet,
  Lock,
  ZoomIn,
  ListOrdered,
  Layers,
  Cog,
  Sun,
  Moon,
  Search,
  Wallet,
  Bell,
} from "lucide-react";

/* -------------------- Mock data -------------------- */

const asks = [
  { p: "61,208.0", s: "16.89K", t: "601.60K" },
  { p: "61,207.4", s: "299.91K", t: "584.70K" },
  { p: "61,207.3", s: "175.05K", t: "284.79K" },
  { p: "61,206.6", s: "24.97K", t: "109.73K" },
  { p: "61,205.0", s: "122.41", t: "84.76K" },
  { p: "61,204.7", s: "16.89K", t: "84.64K" },
  { p: "61,204.4", s: "1.04K", t: "61.57K" },
  { p: "61,204.0", s: "3.73K", t: "60.53K" },
  { p: "61,203.7", s: "56.79K", t: "56.79K" },
];

const bids = [
  { p: "61,195.3", s: "24.96K", t: "24.96K" },
  { p: "61,195.2", s: "673.15", t: "25.64K" },
  { p: "61,194.4", s: "673.14", t: "26.31K" },
  { p: "61,192.1", s: "9.97K", t: "36.28K" },
  { p: "61,191.3", s: "16.88K", t: "53.17K" },
  { p: "61,190.1", s: "183.57", t: "53.36K" },
  { p: "61,189.5", s: "183.57", t: "53.54K" },
  { p: "61,189.3", s: "51.03K", t: "104.57K" },
  { p: "61,189.1", s: "79.97K", t: "184.54K" },
];

/* -------------------- Layout -------------------- */

export function TradingPage() {
  const [dark, setDark] = useState(true);
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleArrowDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      if (event.key !== "ArrowDown" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isTyping) {
        return;
      }

      event.preventDefault();
      activityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    window.addEventListener("keydown", handleArrowDown);
    return () => window.removeEventListener("keydown", handleArrowDown);
  }, []);

  return (
    <div className={`aster-desktop ${dark ? "dark" : ""} h-screen w-screen flex flex-col bg-background text-foreground text-[12px] overflow-hidden`}>
      <TopNav dark={dark} onToggle={() => setDark((d) => !d)} />
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hidden">
        <div className="h-[calc(100vh-4.5rem)] min-h-0 shrink-0 grid grid-cols-[minmax(0,1fr)_23vw_23vw] gap-1 p-1">
          <div className="min-h-0 min-w-0 flex flex-col gap-1">
            <Panel className="relative z-40 !overflow-visible"><MarketBar /></Panel>
            <Panel className="flex-1"><ChartPanel /></Panel>
          </div>
          <Panel><OrderBookPanel /></Panel>
          <Panel><OrderFormPanel /></Panel>
        </div>
        <div ref={activityRef} className="grid grid-cols-[minmax(0,1fr)_23vw_23vw] gap-1 px-1 pb-1 scroll-mt-0">
          <div className="col-span-2 min-w-0">
            <ActivityPanel />
          </div>
        </div>
      </div>
      <TickerBar />
    </div>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`min-h-0 min-w-0 rounded-xl border border-border/70 bg-card overflow-hidden flex flex-col shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_10px_28px_-16px_rgba(0,0,0,0.55)] ${className}`}>
      {children}
    </div>
  );
}

/* -------------------- Top nav -------------------- */

function TopNav({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const items = ["Trade", "Portfolio", "More"];
  return (
    <header className="h-11 shrink-0 flex items-center justify-between px-3 border-b border-border/70 bg-background">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">✱</span>
          </div>
          <span className="font-bold text-[13px] tracking-wide">ASTER</span>
        </div>
        <nav className="flex items-center gap-0.5">
          {items.map((it) => (
            <button
              key={it}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-accent text-foreground/90 text-[11px] font-medium transition-colors"
            >
              {it}
              {it === "More" && <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <WalletButton />
        <button className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

/* -------------------- Market bar -------------------- */

const pairOptions = [
  { symbol: "ASTERUSDT", price: "0.6189", change: "-0.74%", funding: "0.0056%", volume: "$41,245,701", interest: "$208,986,555", high: "0.6341", low: "0.6102", icon: "✦", iconClass: "bg-amber-400" },
  { symbol: "BTCUSDT", price: "61,387.6", change: "-0.77%", funding: "-0.0031%", volume: "$1,012,394,618", interest: "$688,253,799", high: "62,817.6", low: "60,705.4", icon: "₿", iconClass: "bg-[#f7931a]" },
  { symbol: "ETHUSDT", price: "1,617.86", change: "-1.77%", funding: "-0.0043%", volume: "$554,611,662", interest: "$290,348,591", high: "1,652.40", low: "1,598.10", icon: "◆", iconClass: "bg-blue-500" },
  { symbol: "BNBUSDT", price: "585.45", change: "-1.61%", funding: "0.0000%", volume: "$22,620,158", interest: "$10,861,659", high: "598.30", low: "579.20", icon: "◆", iconClass: "bg-yellow-400" },
  { symbol: "SOLUSDT", price: "62.84", change: "-3.56%", funding: "-0.0042%", volume: "$87,235,575", interest: "$203,877,105", high: "65.91", low: "62.01", icon: "≋", iconClass: "bg-purple-500" },
  { symbol: "XRPUSDT", price: "1.0954", change: "-3.79%", funding: "-0.0041%", volume: "$17,568,366", interest: "$54,680,519", high: "1.1420", low: "1.0788", icon: "×", iconClass: "bg-slate-500" },
  { symbol: "DOGEUSDT", price: "0.08242", change: "-3.01%", funding: "0.0035%", volume: "$13,702,600", interest: "$6,639,693", high: "0.08521", low: "0.08190", icon: "Ð", iconClass: "bg-yellow-500" },
  { symbol: "HYPEUSDT", price: "53.469", change: "-7.65%", funding: "0.0050%", volume: "$106,385,236", interest: "$14,050,088", high: "58.120", low: "52.840", icon: "H", iconClass: "bg-cyan-400" },
];

function MarketBar() {
  const [selectedPair, setSelectedPair] = useState(pairOptions[1]);
  const [isPairSelectorOpen, setIsPairSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showPairInfo, setShowPairInfo] = useState(false);
  const isNeg = selectedPair.change.startsWith("-");

  const visiblePairs = pairOptions.filter((pair) =>
    pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative h-13 shrink-0 flex items-center gap-5 px-3">
      <div
        className="relative h-full flex items-center"
        onMouseEnter={() => setIsPairSelectorOpen(true)}
        onMouseLeave={() => setIsPairSelectorOpen(false)}
      >
        <button
          className="flex items-center gap-2 pr-4 border-r border-border"
          aria-expanded={isPairSelectorOpen}
          aria-label="Choose trading pair"
        >
          <div className={`w-7 h-7 rounded-full ${selectedPair.iconClass} flex items-center justify-center text-white text-xs font-bold`}>
            {selectedPair.icon}
          </div>
          <div className="flex flex-col items-start leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px]">{selectedPair.symbol}</span>
              <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isPairSelectorOpen ? "rotate-180" : ""}`} />
            </div>
            <span className="text-[color:var(--ask)] text-[11px]">{selectedPair.price} {selectedPair.change}</span>
          </div>
        </button>

        {isPairSelectorOpen && (
          <div
            className="absolute left-0 top-[calc(100%-1px)] w-[min(650px,calc(100vw-1rem))] rounded-b-xl border border-border/80 bg-card shadow-[0_18px_45px_rgba(0,0,0,0.28)] overflow-hidden text-foreground"
          >
          <div className="p-4 pb-3">
            <div className="flex items-center gap-2 h-9 rounded-lg border border-border bg-background/70 px-3">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search"
                className="w-full bg-transparent outline-none text-[12px] placeholder:text-muted-foreground/70"
                aria-label="Search trading pairs"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 px-4 h-9 border-b border-border text-[11px]">
            <button className="text-muted-foreground hover:text-foreground">Favorites</button>
            <button className="h-full border-b-2 border-primary text-foreground font-semibold">Futures</button>
            <button className="text-muted-foreground hover:text-foreground">Spot</button>
            <button className="text-muted-foreground hover:text-foreground flex items-center gap-1">Prediction <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /></button>
          </div>

          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border overflow-x-auto scrollbar-hidden text-[10px] text-muted-foreground">
            {["All markets", "Top", "New", "Meme", "AI", "Pre-launch", "Stocks", "Commodities", "ETF", "Semiconductor", "Listing Vote"].map((category, index) => (
              <button
                key={category}
                className={`shrink-0 rounded px-2 py-1 ${index === 0 ? "bg-accent text-foreground font-semibold" : "hover:bg-accent/70"}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[1.4fr_0.85fr_0.8fr_0.9fr_1.1fr_1.1fr] gap-2 px-4 py-2 text-[10px] text-muted-foreground">
            <span>Symbols</span>
            <span className="text-right">Last price</span>
            <span className="text-right">24h change</span>
            <span className="text-right">Funding Rate</span>
            <span className="text-right">Volume</span>
            <span className="text-right">Open interest</span>
          </div>

          <div className="max-h-72 overflow-y-auto scrollbar-hidden px-2 pb-2">
            {visiblePairs.map((pair) => (
              <button
                key={pair.symbol}
                onClick={() => {
                  setSelectedPair(pair);
                  setIsPairSelectorOpen(false);
                  setSearchTerm("");
                }}
                className={`w-full grid grid-cols-[1.4fr_0.85fr_0.8fr_0.9fr_1.1fr_1.1fr] gap-2 items-center rounded-md px-2 py-2 text-[11px] text-left hover:bg-accent/70 ${
                  selectedPair.symbol === pair.symbol ? "bg-accent/50" : ""
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-muted-foreground text-[15px]">☆</span>
                  <span className={`w-5 h-5 rounded-full ${pair.iconClass} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{pair.icon}</span>
                  <span className="truncate">
                    <span className="block font-medium">{pair.symbol}</span>
                    <span className="block text-[9px] text-muted-foreground">200x</span>
                  </span>
                </span>
                <span className="text-right">{pair.price}</span>
                <span className="text-right text-[color:var(--ask)]">{pair.change}</span>
                <span className="text-right">{pair.funding}</span>
                <span className="text-right">{pair.volume}</span>
                <span className="text-right">{pair.interest}</span>
              </button>
            ))}
            {visiblePairs.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-[11px]">No pairs found</div>
            )}
          </div>
          </div>
        )}
      </div>
      {/* Exchange Price */}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-muted-foreground">Exchange Price</span>
        <span className="text-[12px] font-semibold">
          {selectedPair.price}
          <span className={`ml-1.5 text-[11px] font-medium ${isNeg ? "text-[color:var(--ask)]" : "text-[color:var(--bid)]"}`}>
            {selectedPair.change}
          </span>
        </span>
      </div>

      {/* 24h High */}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-muted-foreground">24h High</span>
        <span className="text-[12px] text-[color:var(--bid)]">{selectedPair.high}</span>
      </div>

      {/* 24h Low */}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-muted-foreground">24h Low</span>
        <span className="text-[12px] text-[color:var(--ask)]">{selectedPair.low}</span>
      </div>

      {/* 24h Volume */}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-muted-foreground">24h Volume (USDT)</span>
        <span className="text-[12px]">{selectedPair.volume.replace("$", "")}</span>
      </div>

      {/* Liquidity */}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-muted-foreground">Liquidity</span>
        <span className="text-[12px]">{selectedPair.interest.replace("$", "")}</span>
      </div>

      {/* Info button */}
      <div className="ml-auto flex items-center pr-2">
        <div className="relative flex items-center">
          <button
            onClick={() => setShowPairInfo((v) => !v)}
            className="w-6 h-6 rounded-full border border-border/70 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border hover:bg-accent transition-colors text-[11px] font-bold"
            title="Pair info"
          >
            i
          </button>
          {showPairInfo && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-64 rounded-xl border border-border/80 bg-card shadow-[0_18px_45px_rgba(0,0,0,0.35)] p-3 z-50 text-[11px] space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-border">
                <span className="font-bold text-[13px]">{selectedPair.symbol}</span>
                <span className="text-[10px] px-1.5 py-px rounded bg-accent text-muted-foreground font-semibold">Perp</span>
              </div>
              {[
                ["Funding Rate (8h)", selectedPair.funding],
                ["24h Volume", selectedPair.volume],
                ["Liquidity", selectedPair.interest],
                ["24h High", selectedPair.high],
                ["24h Low", selectedPair.low],
                ["Max Leverage", "200x"],
                ["Contract Type", "Linear USDT"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Chart -------------------- */

function ChartPanel() {
  const tools = [ListOrdered, LineChart, Layers, Pencil, Type, BarChart3, Smile, Ruler, ZoomIn, Magnet, Pencil, Lock];
  return (
    <div className="flex flex-1 min-h-0">
      {/* Vertical toolbar */}
      <div className="w-10 border-r border-border flex flex-col items-center py-1.5 gap-1.5 shrink-0">
        {tools.map((Icon, i) => (
          <button key={i} className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent">
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Chart controls */}
        <div className="h-8 shrink-0 flex items-center justify-between px-2 border-b border-border text-[10px]">
          <div className="flex items-center gap-3">
            {["5m", "15m", "1H", "4H"].map((t) => (
              <button key={t} className="text-muted-foreground hover:text-foreground">{t}</button>
            ))}
            <button className="text-foreground font-semibold">1D</button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">1W <ChevronDown className="w-3 h-3" /></button>
            <div className="w-px h-4 bg-border mx-2" />
            <button className="text-muted-foreground hover:text-foreground"><Settings className="w-3.5 h-3.5" /></button>
            <button className="text-muted-foreground hover:text-foreground">⇋</button>
            <button className="text-muted-foreground hover:text-foreground">≣</button>
            <button className="text-muted-foreground hover:text-foreground"><Cog className="w-3.5 h-3.5" /></button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">Last Price <ChevronDown className="w-3 h-3" /></button>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <button className="text-foreground">Chart</button>
            <button className="hover:text-foreground">Depth</button>
            <button className="hover:text-foreground">Details</button>
            <button className="hover:text-foreground"><Maximize2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <ChartCanvas />
      </div>
    </div>
  );
}

function ChartCanvas() {
  return (
    <div className="flex-1 min-h-0 relative overflow-hidden">
      <div className="absolute top-2 left-3 text-[10px] space-y-0.5 z-10 pointer-events-none">
        <div className="text-muted-foreground">
          O<span className="text-foreground ml-1">61697.8</span>
          <span className="ml-3">H</span><span className="text-foreground ml-1">62817.6</span>
          <span className="ml-3">L</span><span className="text-foreground ml-1">60705.4</span>
          <span className="ml-3">C</span><span className="text-foreground ml-1">61203.6</span>
          <span className="text-[color:var(--ask)] ml-2">-494.2 (-0.80%)</span>
        </div>
        <div className="text-muted-foreground">MA 7 close 0 SMA 9 <span className="text-[#a855f7]">62140.6</span></div>
        <div className="text-muted-foreground">MA 30 close 0 SMA 9 <span className="text-[#eab308]">72427.8</span></div>
        <div className="text-muted-foreground">MA 99 close 0 SMA 9 <span className="text-[#3b82f6]">72891.9</span></div>
      </div>

      <svg viewBox="0 0 900 520" preserveAspectRatio="none" className="w-full h-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1="0" x2="900" y1={i * 65 + 30} y2={i * 65 + 30} stroke="currentColor" className="text-border" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`v${i}`} y1="0" y2="520" x1={i * 150 + 60} x2={i * 150 + 60} stroke="currentColor" className="text-border" strokeWidth="0.5" />
        ))}

        <path d="M0,320 C100,300 180,240 260,200 S420,140 520,180 620,260 720,300 820,340 900,360" fill="none" stroke="#a855f7" strokeWidth="1.4" />
        <path d="M0,360 C120,340 220,300 320,280 S500,240 620,260 780,300 900,320" fill="none" stroke="#eab308" strokeWidth="1.4" />
        <path d="M0,380 C150,370 300,340 450,320 S700,280 900,290" fill="none" stroke="#3b82f6" strokeWidth="1.4" />

        <Candles />
      </svg>

      {/* Volume section overlay */}
      <div className="absolute bottom-6 left-0 right-0 h-24 border-t border-border">
        <div className="absolute top-1 left-3 text-[10px] text-muted-foreground">
          Volume SMA 9 <span className="text-[color:var(--ask)] ml-1">15.721K</span>
        </div>
        <svg viewBox="0 0 900 120" preserveAspectRatio="none" className="w-full h-full">
          {volumeBars.map((v, i) => (
            <rect key={i} x={i * 10 + 5} y={120 - v.h} width="7" height={v.h} fill={v.up ? "var(--bid)" : "var(--ask)"} opacity="0.85" />
          ))}
        </svg>
      </div>

      {/* Right price axis */}
      <div className="absolute top-0 right-0 h-full w-10 border-l border-border bg-background/40 text-[9px] text-muted-foreground flex flex-col justify-between py-3 pl-1.5">
        {["84000.0", "82810.3", "80000.0", "76000.0", "72000.0", "68000.0", "64000.0"].map((p) => (
          <span key={p}>{p}</span>
        ))}
      </div>
      <div className="absolute right-0 top-[62%] -translate-y-1/2 bg-[color:var(--ask)] text-white text-[9px] px-1 py-0.5 rounded-sm">
        61203.6
      </div>
      <div className="absolute right-0 top-[70%] bg-accent text-foreground text-[9px] px-1 py-0.5 rounded-sm">
        59101.0
      </div>

      {/* Bottom time axis */}
      <div className="absolute bottom-0 left-10 right-14 h-6 border-t border-border flex items-center justify-between px-3 text-[10px] text-muted-foreground">
        <span>Apr</span><span>15</span><span>May</span><span>15</span><span>Jun</span>
      </div>

      <div className="absolute bottom-8 right-16 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span>15:07:02 (UTC-7)</span>
        <button className="hover:text-foreground">%</button>
        <button className="hover:text-foreground">log</button>
        <button className="text-foreground font-semibold">auto</button>
      </div>

      <div className="absolute bottom-32 left-3 w-6 h-6 rounded-full bg-accent border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground">TV</div>
    </div>
  );
}

const volumeBars = Array.from({ length: 85 }).map((_, i) => {
  const h = 15 + Math.abs(Math.sin(i * 0.6) * 40) + (i > 70 ? Math.random() * 60 : Math.random() * 25);
  return { h, up: Math.sin(i * 0.9) > -0.2 };
});

function Candles() {
  const candles = Array.from({ length: 85 }).map((_, i) => {
    const base = 320 + Math.sin(i * 0.25) * 60 + (i > 65 ? (i - 65) * 8 : 0);
    const wick = 12 + Math.random() * 14;
    const body = 4 + Math.random() * 18;
    const up = Math.sin(i * 0.7) > 0;
    const x = i * 10 + 6;
    return { x, y: base - body / 2, body, wick, up, cy: base };
  });
  return (
    <g>
      {candles.map((c, i) => (
        <g key={i}>
          <line x1={c.x + 3.5} x2={c.x + 3.5} y1={c.cy - c.wick} y2={c.cy + c.wick} stroke={c.up ? "var(--bid)" : "var(--ask)"} strokeWidth="1" />
          <rect x={c.x} y={c.y} width="7" height={c.body} fill={c.up ? "var(--bid)" : "var(--ask)"} />
        </g>
      ))}
    </g>
  );
}

/* -------------------- Order book -------------------- */

type BookView = "both" | "bids" | "asks";

const PRECISION_OPTIONS = ["0.1", "1", "10", "50", "100"];

function BookViewIcon({ view }: { view: BookView }) {
  const bidColor = "var(--bid)";
  const askColor = "var(--ask)";
  // Each icon is a 14×14 viewBox with 3 stacked mini-bars
  if (view === "both") {
    return (
      <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
        <rect x="2" y="1"  width="10" height="2" rx="0.5" fill={askColor} />
        <rect x="2" y="4"  width="7"  height="2" rx="0.5" fill={askColor} />
        <rect x="2" y="7"  width="9"  height="2" rx="0.5" fill={bidColor} />
        <rect x="2" y="10" width="6"  height="2" rx="0.5" fill={bidColor} />
      </svg>
    );
  }
  if (view === "bids") {
    return (
      <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
        <rect x="2" y="1"  width="10" height="2" rx="0.5" fill={bidColor} />
        <rect x="2" y="4"  width="7"  height="2" rx="0.5" fill={bidColor} />
        <rect x="2" y="7"  width="9"  height="2" rx="0.5" fill={bidColor} />
        <rect x="2" y="10" width="6"  height="2" rx="0.5" fill={bidColor} />
      </svg>
    );
  }
  // asks
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
      <rect x="2" y="1"  width="10" height="2" rx="0.5" fill={askColor} />
      <rect x="2" y="4"  width="7"  height="2" rx="0.5" fill={askColor} />
      <rect x="2" y="7"  width="9"  height="2" rx="0.5" fill={askColor} />
      <rect x="2" y="10" width="6"  height="2" rx="0.5" fill={askColor} />
    </svg>
  );
}

function OrderBookPanel() {
  const [bookView, setBookView] = useState<BookView>("both");
  const [precision, setPrecision] = useState("0.1");
  const [precisionOpen, setPrecisionOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Order Book / Trades — segmented control, flush to panel */}
      <div className="pt-2 shrink-0">
        <div className="flex items-center text-[12.5px] gap-0.5">
          <button className="flex-1 p-0 rounded-none bg-transparent text-foreground font-bold shadow-none transition-colors">Order Book</button>
          <button className="flex-1 p-0 rounded-none bg-transparent text-muted-foreground hover:text-foreground font-semibold transition-colors">Trades</button>
        </div>
      </div>

      {/* Filter controls — view toggle buttons on left, dropdowns on right */}
      <div className="flex items-center justify-between px-2 py-1 shrink-0">
        <div className="flex items-center gap-0.5">
          {(["both", "bids", "asks"] as BookView[]).map((v) => (
            <button
              key={v}
              onClick={() => setBookView(v)}
              className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                bookView === v ? "bg-accent" : "hover:bg-accent/60"
              }`}
              title={v === "both" ? "Both" : v === "bids" ? "Bids only" : "Asks only"}
            >
              <BookViewIcon view={v} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[11px] leading-none">
          {/* Precision dropdown */}
          <div className="relative">
            <button
              onClick={() => setPrecisionOpen((v) => !v)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-card font-semibold hover:text-foreground transition-colors"
            >
              {precision} <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${precisionOpen ? "rotate-180" : ""}`} />
            </button>
            {precisionOpen && (
              <>
                {/* backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setPrecisionOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-28 rounded-xl border border-border/60 bg-card shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="px-3 pt-2.5 pb-1 text-[9px] uppercase tracking-widest text-muted-foreground/60 font-semibold select-none">
                    Precision
                  </div>
                  {PRECISION_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setPrecision(opt); setPrecisionOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-[12px] font-medium transition-colors hover:bg-accent/70 ${
                        opt === precision ? "text-primary" : "text-foreground/80"
                      }`}
                    >
                      {opt}
                      {opt === precision && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                  <div className="h-1.5" />
                </div>
              </>
            )}
          </div>
          <button className="flex items-center gap-0.5 p-0 rounded-none bg-transparent font-semibold hover:text-foreground transition-colors">USDT <ChevronDown className="w-3 h-3" /></button>
        </div>
      </div>

      {/* Column headers — flush */}
      <div className="grid grid-cols-3 px-2 py-1 text-[10px] text-muted-foreground font-medium shrink-0">
        <span>Price (USDT)</span>
        <span className="text-right">Size (USDT)</span>
        <span className="text-right">Total (USDT)</span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {/* Asks */}
        {bookView !== "bids" && (
          <div className="flex-1 min-h-0 flex flex-col-reverse overflow-hidden">
            {asks.map((row, i) => (
              <BookRow key={i} row={row} side="ask" depth={(i + 1) * 9} />
            ))}
          </div>
        )}

        {/* Spread — only when both sides visible */}
        {bookView === "both" && (
          <div className="px-2 py-1.5 flex items-center gap-2 shrink-0">
            <span className="text-[color:var(--ask)] font-bold text-[15px]">61,203.6</span>
            <span className="text-[color:var(--ask)]">↓</span>
            <span className="text-muted-foreground text-[11px] font-medium">61,207.5</span>
          </div>
        )}

        {/* Bids */}
        {bookView !== "asks" && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {bids.map((row, i) => (
              <BookRow key={i} row={row} side="bid" depth={100 - i * 9} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookRow({ row, side, depth }: { row: { p: string; s: string; t: string }; side: "bid" | "ask"; depth: number }) {
  const color = side === "bid" ? "text-[color:var(--bid)]" : "text-[color:var(--ask)]";
  const bg = side === "bid" ? "var(--bid-bg)" : "var(--ask-bg)";
  return (
    <div className="relative grid grid-cols-3 px-2 py-[3px] text-[11.5px] hover:bg-accent/40 cursor-pointer">
      <div
        className="absolute inset-y-0 right-0 pointer-events-none"
        style={{ width: `${depth}%`, background: bg }}
      />
      <span className={`relative font-semibold ${color}`}>{row.p}</span>
      <span className="relative text-right font-medium text-foreground/90">{row.s}</span>
      <span className="relative text-right font-medium text-foreground/90">{row.t}</span>
    </div>
  );
}

/* -------------------- Order form -------------------- */

type OrderTab = "market" | "limit" | "ladder";

function OrderFormPanel() {
  const [tab, setTab] = useState<OrderTab>("limit");
  const [levels, setLevels] = useState(10);
  const [tpsl, setTpsl] = useState(false);
  const [expiry, setExpiry] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState<string>("60");

  const showPrice = tab === "limit";
  const showLadder = tab === "ladder";

  return (
    <div className="flex flex-col flex-1 min-h-0 p-2 gap-2 overflow-hidden">
      {/* Order type tabs */}
      <div className="flex items-center text-[11px] shrink-0 gap-0.5">
        <button
          onClick={() => setTab("market")}
          className={`flex-1 px-1.5 py-1 rounded-sm font-semibold transition-colors ${tab === "market" ? "text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Market
        </button>
        <button
          onClick={() => setTab("limit")}
          className={`flex-1 px-1.5 py-1 rounded-sm font-bold transition-colors ${tab === "limit" ? "text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Limit
        </button>
        <button
          onClick={() => setTab("ladder")}
          className={`flex-1 px-1.5 py-1 rounded-sm font-semibold transition-colors ${tab === "ladder" ? "text-foreground" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Ladder Order
        </button>
      </div>

      {/* Available balance */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground font-medium">
          Avbl <span className="text-foreground font-semibold ml-1">0.00 USDT</span>
          <span className="ml-1.5 text-muted-foreground/50 text-[10px]">ⓘ</span>
        </span>
      </div>

      {/* Price input — hidden for Market and Ladder */}
      {showPrice && (
        <div className="flex items-center h-8 rounded-md bg-input border border-border/40 px-2.5 gap-2 focus-within:border-border transition-colors">
          <input
            defaultValue="61789.0"
            className="flex-1 min-w-0 bg-transparent outline-none text-[14px] font-medium"
          />
          <span className="text-muted-foreground text-[12px] font-medium shrink-0">USDT</span>
          <div className="w-px h-4 bg-border/60 shrink-0" />
          <button className="text-[11px] text-foreground/60 hover:text-foreground font-bold tracking-wider shrink-0 transition-colors">BBO</button>
        </div>
      )}

      {/* Ladder-specific inputs: Price Start, Price End, Levels */}
      {showLadder && (
        <>
          <div className="flex items-center h-8 rounded-md bg-input border border-border/40 px-2.5 gap-2 focus-within:border-border transition-colors">
            <span className="text-muted-foreground text-[11px] font-medium shrink-0">Price Start</span>
            <input
              placeholder="0.00"
              className="flex-1 min-w-0 bg-transparent outline-none text-[14px] font-medium text-right placeholder:text-muted-foreground/50"
            />
            <span className="text-muted-foreground text-[12px] font-medium shrink-0">USDT</span>
          </div>
          <div className="flex items-center h-8 rounded-md bg-input border border-border/40 px-2.5 gap-2 focus-within:border-border transition-colors">
            <span className="text-muted-foreground text-[11px] font-medium shrink-0">Price End</span>
            <input
              placeholder="0.00"
              className="flex-1 min-w-0 bg-transparent outline-none text-[14px] font-medium text-right placeholder:text-muted-foreground/50"
            />
            <span className="text-muted-foreground text-[12px] font-medium shrink-0">USDT</span>
          </div>
          <div className="flex items-center h-8 rounded-md bg-input border border-border/40 px-2.5 gap-2 focus-within:border-border transition-colors">
            <span className="text-muted-foreground text-[11px] font-medium shrink-0">Levels</span>
            <input
              type="number"
              min={1}
              max={50}
              value={levels}
              onChange={(e) => {
                const v = Math.min(50, Math.max(1, Number(e.target.value)));
                setLevels(v);
              }}
              className="flex-1 min-w-0 bg-transparent outline-none text-[14px] font-medium text-right"
            />
            <span className="text-muted-foreground text-[12px] font-medium shrink-0">/ 50</span>
          </div>
        </>
      )}

      {/* Size input */}
      <div className="flex items-center h-8 rounded-md bg-input border border-border/40 px-2.5 gap-2 focus-within:border-border transition-colors">
        <input
          placeholder="Size"
          className="flex-1 min-w-0 bg-transparent outline-none text-[14px] font-medium placeholder:text-muted-foreground/50"
        />
        <button className="text-[12px] text-muted-foreground font-medium flex items-center gap-1 shrink-0 hover:text-foreground transition-colors">
          USDT <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Percentage slider */}
      <div className="pt-1 pb-0.5">
        <div className="relative h-[3px] rounded-full bg-accent">
          <div className="absolute inset-y-0 left-0 w-0 bg-primary rounded-full" />
          {[0, 25, 50, 75, 100].map((p) => (
            <div
              key={p}
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-border hover:border-primary/60 cursor-pointer transition-colors"
              style={{ left: `calc(${p}% - 5px)` }}
            />
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-1.5 text-[10px]">
        <div>
          <button
            onClick={() => setTpsl((v) => !v)}
            className="flex items-center gap-2 text-muted-foreground font-medium cursor-pointer hover:text-foreground/80 transition-colors w-full text-left"
          >
            <span className={`w-3.5 h-3.5 border rounded-sm inline-flex items-center justify-center shrink-0 transition-colors ${tpsl ? "bg-primary border-primary text-primary-foreground" : "border-border/80 bg-secondary"}`}>
              {tpsl && <span className="text-[9px] leading-none font-bold">✓</span>}
            </span>
            TP/SL
          </button>
          {tpsl && (
            <div className="mt-1.5 space-y-1.5">
              <div className="flex items-center h-8 rounded-md bg-input border border-border/40 px-2.5 gap-2 focus-within:border-border transition-colors">
                <span className="text-muted-foreground text-[11px] font-medium shrink-0">TP Price</span>
                <input
                  placeholder="Trigger price"
                  className="flex-1 min-w-0 bg-transparent outline-none text-[13px] font-medium text-right placeholder:text-muted-foreground/50"
                />
                <span className="text-muted-foreground text-[11px] font-medium shrink-0">USDT</span>
              </div>
              <div className="flex items-center h-8 rounded-md bg-input border border-border/40 px-2.5 gap-2 focus-within:border-border transition-colors">
                <span className="text-muted-foreground text-[11px] font-medium shrink-0">SL Price</span>
                <input
                  placeholder="Trigger price"
                  className="flex-1 min-w-0 bg-transparent outline-none text-[13px] font-medium text-right placeholder:text-muted-foreground/50"
                />
                <span className="text-muted-foreground text-[11px] font-medium shrink-0">USDT</span>
              </div>
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 text-muted-foreground font-medium cursor-pointer hover:text-foreground/80 transition-colors">
          <span className="w-3.5 h-3.5 border border-border/80 rounded-sm inline-flex items-center justify-center bg-secondary shrink-0" />
          Post Only
        </label>

        {/* Expiration toggle */}
        <div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExpiry((v) => !v)}
              className="flex items-center gap-2 text-muted-foreground font-medium cursor-pointer hover:text-foreground/80 transition-colors"
            >
              <span className={`w-3.5 h-3.5 border rounded-sm inline-flex items-center justify-center shrink-0 transition-colors ${expiry ? "bg-primary border-primary text-primary-foreground" : "border-border/80 bg-secondary"}`}>
                {expiry && <span className="text-[9px] leading-none font-bold">✓</span>}
              </span>
              Expiration
            </button>
            {expiry && (
              <span className="text-muted-foreground/60 text-[10px]">min</span>
            )}
          </div>
          {expiry && (
            <div className="mt-1.5 flex items-center h-8 rounded-md bg-input border border-border/40 px-2.5 gap-2 focus-within:border-border transition-colors">
              <span className="text-muted-foreground text-[11px] font-medium shrink-0">Expires in</span>
              <input
                type="number"
                min={1}
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value.replace(/[^0-9]/g, ""))}
                className="flex-1 min-w-0 bg-transparent outline-none text-[14px] font-medium text-right tabular-nums"
              />
              <span className="text-muted-foreground text-[11px] font-medium shrink-0">min</span>
            </div>
          )}
        </div>
      </div>

      {/* Connect Wallet CTA */}
      <WalletButton fullWidth />

      {/* Order stats */}
      <div className="text-[11px] pt-0.5">
        <div className="flex justify-between"><span className="text-muted-foreground font-medium">Order Value</span><span className="font-medium">-- USDT</span></div>
      </div>
    </div>
  );
}

/* -------------------- Lower account activity -------------------- */

const activityTabs = [
  "Open Orders",
  "Positions",
  "Predictions",
  "Assets",
  "Order History",
  "Trade History",
  "Transaction History",
];

function ActivityPanel() {
  const [activeTab, setActiveTab] = useState("Positions");

  return (
    <Panel className="h-64">
      <div className="flex items-center gap-5 h-10 px-2 border-b border-border shrink-0 overflow-x-auto">
        {activityTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-full shrink-0 text-[11px] font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "text-foreground border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <div className="w-11 h-11 rounded-xl border border-border bg-background/60 flex items-center justify-center">
          <Search className="w-5 h-5 opacity-70" />
        </div>
        <span className="text-[11px]">{activeTab} will appear here</span>
      </div>
    </Panel>
  );
}

/* -------------------- Ticker bar -------------------- */

function TickerBar() {
  const items = [
    "6, 00:00 UTC",
    "Small Amount Exchange Now Available on Spot",
    "0% Fee on USDC ⇄ USDT for 30 Days",
    "Migrate to Aster Pro API | V1 API Sunset Notice",
    "Staking is live on Aster",
  ];
  return (
    <div className="h-7 shrink-0 flex items-center gap-5 px-3 border-t border-border bg-background text-[10px] overflow-hidden">
      <div className="flex items-center gap-2 text-[color:var(--bid)] shrink-0">
        <BarChart3 className="w-3.5 h-3.5" />
        <span>Connected <span className="text-muted-foreground ml-1">451ms</span></span>
      </div>
      <button className="text-muted-foreground shrink-0">⊘</button>
      {items.map((t) => (
        <span key={t} className="text-muted-foreground truncate shrink-0">{t}</span>
      ))}
      <div className="ml-auto flex items-center gap-3 text-muted-foreground shrink-0">
        <Twitter className="w-3.5 h-3.5" />
        <MessageCircle className="w-3.5 h-3.5" />
        <Globe className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
