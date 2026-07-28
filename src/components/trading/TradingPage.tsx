import { useEffect, useRef, useState, useCallback } from "react";
import { WalletButton } from "../WalletButton";
import { loadFavorites, saveFavorites } from "../../lib/alerts";
import {
  ChevronDown,
  ChevronRight,
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
  X,
  Check,
  Volume2,
  Zap,
  AlertCircle,
  Gift,
  CheckCircle2,
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

/* -------------------- Precision helpers -------------------- */

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

/* -------------------- Layout -------------------- */

export function TradingPage() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true; // SSR default → dark
    const saved = localStorage.getItem("asterdex-theme");
    if (saved === "light") return false;
    return true; // "dark" or no preference → dark
  });

  // Shared selected-pair price — lifted so OrderBookPanel can derive precision
  const [selectedPairPrice, setSelectedPairPrice] = useState(pairOptions[1].price);

  // Keep <html> class + localStorage in sync so WalletSheet, Privy modal,
  // and --trade-* vars (which all key off `.dark` on <html>) stay correct.
  useEffect(() => {
    const el = document.documentElement;
    if (dark) {
      el.classList.add("dark");
      localStorage.setItem("asterdex-theme", "dark");
    } else {
      el.classList.remove("dark");
      localStorage.setItem("asterdex-theme", "light");
    }
  }, [dark]);
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
            <Panel className="relative z-40 !overflow-visible">
              <MarketBar onPairPriceChange={setSelectedPairPrice} />
            </Panel>
            <Panel className="flex-1"><ChartPanel /></Panel>
          </div>
          <Panel><OrderBookPanel selectedPairPrice={selectedPairPrice} /></Panel>
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

/* -------------------- Notification types -------------------- */

type NotifType = "fill" | "funding" | "alert" | "system" | "reward";
interface Notif {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const NOTIF_MOCK: Notif[] = [
  { id: 1, type: "fill",    title: "Order Filled",        body: "BTCUSDT Buy 0.01 BTC @ 66,007.4 USDT",              time: "2m ago",  unread: true  },
  { id: 2, type: "funding", title: "Funding Rate",        body: "BTCUSDT next funding: +0.0076% in 00:39:58",         time: "1h ago",  unread: true  },
  { id: 3, type: "alert",   title: "Price Alert",         body: "BTC crossed your alert at $66,000",                  time: "2h ago",  unread: true  },
  { id: 4, type: "system",  title: "New Market",          body: "SOLUSD Perp is now available to trade",              time: "5h ago",  unread: false },
  { id: 5, type: "fill",    title: "Order Cancelled",     body: "ETHUSDT Limit Sell 0.5 ETH @ 3,240 expired",         time: "8h ago",  unread: false },
  { id: 6, type: "reward",  title: "Referral Reward",     body: "You earned 12.50 USDT from a referral trade",        time: "1d ago",  unread: false },
  { id: 7, type: "alert",   title: "Liquidation Warning", body: "Your ETHUSDT position is near liquidation price",    time: "2d ago",  unread: false },
];

const NOTIF_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  fill:    { icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
  funding: { icon: Zap,          color: "#f0b90b", bg: "rgba(240,185,11,0.12)"  },
  alert:   { icon: AlertCircle,  color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  system:  { icon: Bell,         color: "#8b8b8b", bg: "rgba(139,139,139,0.12)" },
  reward:  { icon: Gift,         color: "#a855f7", bg: "rgba(168,85,247,0.12)"  },
};

/* -------------------- Shared dropdown shell -------------------- */

function useDropdownAnchor(
  anchorRef: React.RefObject<HTMLButtonElement | null>,
  onClose: () => void,
  dropdownRef: React.RefObject<HTMLDivElement | null>,
) {
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    function place() {
      const btn = anchorRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [anchorRef]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current  && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose, anchorRef, dropdownRef]);

  return pos;
}

/* -------------------- Notifications dropdown -------------------- */

function NotificationsDropdown({
  anchorRef,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pos = useDropdownAnchor(anchorRef, onClose, dropdownRef);
  const [notifs, setNotifs] = useState<Notif[]>(NOTIF_MOCK);

  const unread = notifs.filter((n) => n.unread).length;
  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, unread: false })));
  const dismiss = (id: number) => setNotifs((p) => p.filter((n) => n.id !== id));

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] w-[26rem]"
      style={{ top: pos.top, right: pos.right }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--trade-card)",
          border: "1px solid color-mix(in oklab, var(--trade-text) 8%, transparent)",
          boxShadow: "0 32px 80px -16px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Header */}
        <div className="flex items-end justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--trade-text-muted)" }}>Inbox</p>
            <p className="text-[17px] font-bold leading-tight flex items-center gap-2" style={{ color: "var(--trade-text)" }}>
              Notifications
              {unread > 0 && (
                <span className="inline-flex items-center justify-center h-4 px-1.5 rounded-full text-[9px] font-bold text-black" style={{ backgroundColor: "#f0b90b", minWidth: 16 }}>
                  {unread}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            {unread > 0 && (
              <button onClick={markAllRead} className="text-[11px] transition-opacity hover:opacity-70" style={{ color: "var(--trade-text-muted)" }}>
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
              style={{ background: "var(--trade-surface)" }}
              aria-label="Close"
            >
              <X className="h-[13px] w-[13px]" style={{ color: "color-mix(in oklab, var(--trade-text) 60%, transparent)" }} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "color-mix(in oklab, var(--trade-text) 7%, transparent)" }} />

        {/* List */}
        <div className="max-h-[540px] overflow-y-auto scrollbar-hidden">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(240,185,11,0.10)" }}>
                <Bell className="h-4 w-4" style={{ color: "#f0b90b" }} />
              </div>
              <p className="text-[12px]" style={{ color: "var(--trade-text-muted)" }}>No notifications</p>
            </div>
          ) : notifs.map((n, i) => {
            const meta = NOTIF_META[n.type];
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                className="flex items-start gap-3 px-5 py-3.5"
                style={{
                  borderTop: i > 0 ? "1px solid color-mix(in oklab, var(--trade-text) 5%, transparent)" : undefined,
                  borderLeft: n.unread ? "2px solid #f0b90b" : "2px solid transparent",
                  background: n.unread ? "rgba(240,185,11,0.03)" : "transparent",
                }}
              >
                <span className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: meta.bg }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold" style={{ color: n.unread ? "var(--trade-text)" : "color-mix(in oklab, var(--trade-text) 70%, transparent)" }}>
                      {n.title}
                    </span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: "var(--trade-text-muted)" }}>{n.time}</span>
                  </div>
                  <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "var(--trade-text-muted)" }}>{n.body}</p>
                </div>
                <button onClick={() => dismiss(n.id)} className="flex-shrink-0 mt-0.5 hover:opacity-50 transition-opacity" aria-label="Dismiss">
                  <X className="h-3 w-3" style={{ color: "color-mix(in oklab, var(--trade-text) 30%, transparent)" }} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Settings dropdown -------------------- */

const LANGUAGES = [
  "English", "Deutsch", "Español (Latinoamérica)", "日本語", "한국어",
  "Polski", "Português (Brasil)", "Русский", "Türkçe", "简体中文", "繁體中文",
];

function DesktopToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 transition-all duration-200"
      style={{ width: 34, height: 19 }}
      role="switch"
      aria-checked={enabled}
    >
      <span className="absolute inset-0 rounded-full transition-colors duration-200"
        style={{ backgroundColor: enabled ? "#f0b90b" : "rgba(128,128,128,0.25)" }} />
      <span className="absolute top-[2.5px] rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ width: 14, height: 14, left: enabled ? 17 : 3 }} />
    </button>
  );
}

function SettingsDropdown({
  anchorRef,
  dark,
  onToggleDark,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  dark: boolean;
  onToggleDark: () => void;
  onClose: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pos = useDropdownAnchor(anchorRef, onClose, dropdownRef);
  const [fillSound, setFillSound] = useState(false);
  const [alertSound, setAlertSound] = useState(true);
  const [language, setLanguage] = useState("English");
  const [langOpen, setLangOpen] = useState(false);

  const rowStyle = {
    borderTop: "1px solid color-mix(in oklab, var(--trade-text) 5%, transparent)",
  };

  const rows = [
    {
      Icon: dark ? Moon : Sun,
      label: "Theme",
      sub: dark ? "Dark mode" : "Light mode",
      right: <DesktopToggle enabled={dark} onToggle={onToggleDark} />,
      onClick: undefined as (() => void) | undefined,
    },
    {
      Icon: Globe,
      label: "Language",
      sub: undefined as string | undefined,
      right: (
        <span className="flex items-center gap-1 text-[12px]" style={{ color: "var(--trade-text-muted)" }}>
          {language}
          <ChevronRight className="h-3 w-3 opacity-50" />
        </span>
      ),
      onClick: () => setLangOpen(true),
    },
    {
      Icon: Volume2,
      label: "Fill Sounds",
      sub: "Play sound when an order fills",
      right: <DesktopToggle enabled={fillSound} onToggle={() => setFillSound((v) => !v)} />,
      onClick: undefined,
    },
    {
      Icon: Bell,
      label: "Price Alert Sound",
      sub: "Play sound when a price alert fires",
      right: <DesktopToggle enabled={alertSound} onToggle={() => setAlertSound((v) => !v)} />,
      onClick: undefined,
    },
  ];

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] w-[22rem]"
      style={{ top: pos.top, right: pos.right }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--trade-card)",
          border: "1px solid color-mix(in oklab, var(--trade-text) 8%, transparent)",
          boxShadow: "0 32px 80px -16px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Header */}
        <div className="flex items-end justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--trade-text-muted)" }}>Preferences</p>
            <p className="text-[17px] font-bold leading-tight" style={{ color: "var(--trade-text)" }}>Settings</p>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity mb-0.5"
            style={{ background: "var(--trade-surface)" }}
            aria-label="Close"
          >
            <X className="h-[13px] w-[13px]" style={{ color: "color-mix(in oklab, var(--trade-text) 60%, transparent)" }} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "color-mix(in oklab, var(--trade-text) 7%, transparent)" }} />

        {/* Rows */}
        <div className="px-5 pb-5">
          {rows.map(({ Icon, label, sub, right, onClick }, i) => (
            <div
              key={label}
              className={`flex items-center gap-4 py-4 ${onClick ? "cursor-pointer hover:opacity-70 transition-opacity" : ""}`}
              style={i > 0 ? rowStyle : {}}
              onClick={onClick}
            >
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "color-mix(in oklab, var(--trade-text) 6%, transparent)" }}
              >
                <Icon className="h-[17px] w-[17px]" style={{ color: "color-mix(in oklab, var(--trade-text) 70%, transparent)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold leading-tight" style={{ color: "var(--trade-text)" }}>{label}</p>
                {sub && <p className="text-[11px] mt-0.5" style={{ color: "var(--trade-text-muted)" }}>{sub}</p>}
              </div>
              {right}
            </div>
          ))}
        </div>

        {/* Language picker — slides in over the settings panel */}
        {langOpen && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col" style={{ background: "var(--trade-card)", zIndex: 1 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--trade-text-muted)" }}>Select</p>
                <p className="text-[17px] font-bold leading-tight" style={{ color: "var(--trade-text)" }}>Language</p>
              </div>
              <button
                onClick={() => setLangOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
                style={{ background: "var(--trade-surface)" }}
                aria-label="Back"
              >
                <X className="h-[13px] w-[13px]" style={{ color: "color-mix(in oklab, var(--trade-text) 60%, transparent)" }} />
              </button>
            </div>
            {/* Divider */}
            <div style={{ height: 1, background: "color-mix(in oklab, var(--trade-text) 7%, transparent)" }} />
            {/* List */}
            <div className="overflow-y-auto flex-1 scrollbar-hidden pb-2">
              {LANGUAGES.map((lang) => {
                const active = lang === language;
                return (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setLangOpen(false); }}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:opacity-70 transition-opacity"
                    style={{ borderTop: "1px solid color-mix(in oklab, var(--trade-text) 5%, transparent)" }}
                  >
                    <span className="text-[13px]" style={{ color: active ? "#f0b90b" : "var(--trade-text)", fontWeight: active ? 600 : 400 }}>
                      {lang}
                    </span>
                    {active && <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#f0b90b" }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- Top nav -------------------- */

function TopNav({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const items = ["Trade", "Portfolio", "More"];
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);

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

        {/* Bell — notifications */}
        <button
          ref={bellRef}
          onClick={() => { setNotifOpen((v) => !v); setSettingsOpen(false); }}
          className="relative w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {/* unread dot */}
          <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-[#f0b90b]" />
        </button>

        {/* Settings */}
        <button
          ref={settingsRef}
          onClick={() => { setSettingsOpen((v) => !v); setNotifOpen(false); }}
          className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Dropdowns — inline in DOM so they inherit .aster-desktop.dark CSS vars */}
        {notifOpen && (
          <NotificationsDropdown
            anchorRef={bellRef}
            onClose={() => setNotifOpen(false)}
          />
        )}
        {settingsOpen && (
          <SettingsDropdown
            anchorRef={settingsRef}
            dark={dark}
            onToggleDark={() => { onToggle(); }}
            onClose={() => setSettingsOpen(false)}
          />
        )}
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

function MarketBar({ onPairPriceChange }: { onPairPriceChange?: (price: string) => void }) {
  const [selectedPair, setSelectedPair] = useState(pairOptions[1]);
  const [isPairSelectorOpen, setIsPairSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);

  const [showPairInfo, setShowPairInfo] = useState(false);
  const isNeg = selectedPair.change.startsWith("-");

  // Load favorites from localStorage on mount
  useEffect(() => { setFavorites(loadFavorites()); }, []);

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

  function applyFilter(pairs: typeof pairOptions) {
    switch (filter) {
      case "Favorites":
        return pairs.filter((p) => favorites.includes(p.symbol));
      case "Gainers":
        return [...pairs]
          .filter((p) => !p.change.startsWith("-"))
          .sort((a, b) => parseFloat(b.change) - parseFloat(a.change));
      case "Losers":
        return [...pairs]
          .filter((p) => p.change.startsWith("-"))
          .sort((a, b) => parseFloat(a.change) - parseFloat(b.change));
      case "Volume":
        return [...pairs].sort((a, b) =>
          parseFloat(b.volume.replace(/[^0-9.]/g, "")) -
          parseFloat(a.volume.replace(/[^0-9.]/g, ""))
        );
      case "Trending":
        return [...pairs].sort((a, b) =>
          Math.abs(parseFloat(b.change)) - Math.abs(parseFloat(a.change))
        );
      default:
        return pairs;
    }
  }

  const searchedPairs = pairOptions.filter((pair) =>
    pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const visiblePairs = applyFilter(searchedPairs);

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

          <div className="flex items-center gap-5 px-4 border-b border-border overflow-x-auto scrollbar-hidden">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 py-2.5 text-[11px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                  filter === f
                    ? "border-primary text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
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
                  if (onPairPriceChange) onPairPriceChange(pair.price);
                  setIsPairSelectorOpen(false);
                  setSearchTerm("");
                }}
                className={`w-full grid grid-cols-[1.4fr_0.85fr_0.8fr_0.9fr_1.1fr_1.1fr] gap-2 items-center rounded-md px-2 py-2 text-[11px] text-left hover:bg-accent/70 ${
                  selectedPair.symbol === pair.symbol ? "bg-accent/50" : ""
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(pair.symbol); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); toggleFavorite(pair.symbol); } }}
                    className="hover:scale-110 transition-transform flex-shrink-0 cursor-pointer"
                    aria-label={favorites.includes(pair.symbol) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${favorites.includes(pair.symbol) ? "text-primary fill-primary" : "text-muted-foreground/40"}`}
                    />
                  </span>
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

// Deterministic values rounded to 2 decimal places to avoid floating-point epsilon
// differences between the Node.js SSR environment and the browser JS engine.
const volumeBars = Array.from({ length: 85 }).map((_, i) => {
  const h = Math.round((15 + Math.abs(Math.sin(i * 0.6) * 40) + (i > 70 ? Math.abs(Math.sin(i * 1.31) * 60) : Math.abs(Math.sin(i * 2.71) * 25))) * 100) / 100;
  return { h, up: Math.sin(i * 0.9) > -0.2 };
});

function Candles() {
  // Deterministic values rounded to 2 decimal places to avoid floating-point epsilon
  // differences between the Node.js SSR environment and the browser JS engine.
  const candles = Array.from({ length: 85 }).map((_, i) => {
    const base = Math.round((320 + Math.sin(i * 0.25) * 60 + (i > 65 ? (i - 65) * 8 : 0)) * 100) / 100;
    const wick = Math.round((12 + Math.abs(Math.sin(i * 1.73)) * 14) * 100) / 100;
    const body = Math.round((4 + Math.abs(Math.sin(i * 2.31)) * 18) * 100) / 100;
    const up = Math.sin(i * 0.7) > 0;
    const x = i * 10 + 6;
    return { x, y: Math.round((base - body / 2) * 100) / 100, body, wick, up, cy: base };
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

function OrderBookPanel({ selectedPairPrice }: { selectedPairPrice?: string }) {
  const [bookView, setBookView] = useState<BookView>("both");
  const precisionOptions = getPrecisionOptions(selectedPairPrice ?? "61,203.7");
  const [precision, setPrecision] = useState(() => getPrecisionOptions(selectedPairPrice ?? "61,203.7")[0]);
  const [precisionOpen, setPrecisionOpen] = useState(false);

  // When the pair changes, keep precision valid for the new options
  useEffect(() => {
    const opts = getPrecisionOptions(selectedPairPrice ?? "61,203.7");
    setPrecision((prev) => (opts.includes(prev) ? prev : opts[0]));
  }, [selectedPairPrice]);

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
                  {precisionOptions.map((opt) => (
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
  const bar = side === "bid" ? "bg-trade-bid/15" : "bg-trade-ask/15";
  return (
    <div className="relative grid grid-cols-3 px-2 py-[3px] text-[11.5px] hover:bg-accent/40 cursor-pointer">
      <div
        className={`absolute inset-y-0 right-0 rounded-sm pointer-events-none ${bar}`}
        style={{ width: `${depth}%` }}
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
        <div className="rounded-md bg-input p-2 flex items-center justify-between">
          <div className="flex-1">
            <div className="text-[10px] text-muted-foreground mb-0.5">Order price</div>
            <input
              defaultValue="61789.0"
              className="w-full bg-transparent outline-none text-foreground placeholder:text-foreground/30"
              style={{ fontSize: '16px' }}
            />
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <span className="text-[11px] text-foreground/70 px-1.5">USDT</span>
            <span className="text-foreground/20">|</span>
            <span className="text-[11px] text-foreground/70 px-1.5">BBO</span>
          </div>
        </div>
      )}

      {/* Ladder-specific inputs: Price Start, Price End, Levels */}
      {showLadder && (
        <>
          <div className="rounded-md bg-input p-2 flex items-center justify-between">
            <div className="flex-1">
              <div className="text-[10px] text-muted-foreground mb-0.5">Price Start</div>
              <input
                placeholder="0.00"
                className="w-full bg-transparent outline-none text-foreground placeholder:text-foreground/30"
                style={{ fontSize: '16px' }}
              />
            </div>
            <span className="text-[11px] text-foreground/50 ml-2 shrink-0">USDT</span>
          </div>
          <div className="rounded-md bg-input p-2 flex items-center justify-between">
            <div className="flex-1">
              <div className="text-[10px] text-muted-foreground mb-0.5">Price End</div>
              <input
                placeholder="0.00"
                className="w-full bg-transparent outline-none text-foreground placeholder:text-foreground/30"
                style={{ fontSize: '16px' }}
              />
            </div>
            <span className="text-[11px] text-foreground/50 ml-2 shrink-0">USDT</span>
          </div>
          <div className="rounded-md bg-input p-2 flex items-center justify-between">
            <div className="flex-1">
              <div className="text-[10px] text-muted-foreground mb-0.5">Levels</div>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => setLevels(l => Math.max(1, l - 1))}
                  className="h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center text-foreground text-[14px] font-bold hover:bg-foreground/20 transition-colors"
                >−</button>
                <span className="text-[14px] text-foreground font-semibold w-6 text-center">{levels}</span>
                <button
                  onClick={() => setLevels(l => Math.min(50, l + 1))}
                  className="h-6 w-6 rounded-full bg-foreground/10 flex items-center justify-center text-foreground text-[14px] font-bold hover:bg-foreground/20 transition-colors"
                >+</button>
              </div>
            </div>
            <span className="text-[11px] text-foreground/50 shrink-0">1 – 50</span>
          </div>
        </>
      )}

      {/* Size input */}
      <div className="rounded-md bg-input p-2 flex items-center justify-between">
        <div className="flex-1">
          <div className="text-[10px] text-muted-foreground mb-0.5">Size</div>
          <input
            placeholder="0.00"
            className="w-full bg-transparent outline-none text-foreground placeholder:text-foreground/30"
            style={{ fontSize: '16px' }}
          />
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0 text-[12px] text-foreground/70 hover:text-foreground transition-colors cursor-pointer">
          USDT <ChevronDown className="w-3 h-3" />
        </div>
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
              <div className="rounded-md bg-input flex items-center overflow-hidden">
                <span className="px-3 py-3 text-[12px] font-bold text-foreground shrink-0">TP</span>
                <span className="text-foreground/20 text-[13px]">|</span>
                <input
                  placeholder="Take Profit price"
                  className="flex-1 bg-transparent text-foreground/60 placeholder:text-foreground/30 outline-none px-3 py-3"
                  style={{ fontSize: '16px' }}
                />
                <span className="px-3 text-[12px] font-bold text-foreground shrink-0">USDT</span>
              </div>
              <div className="rounded-md bg-input flex items-center overflow-hidden">
                <span className="px-3 py-3 text-[12px] font-bold text-foreground shrink-0">SL</span>
                <span className="text-foreground/20 text-[13px]">|</span>
                <input
                  placeholder="Stop Loss price"
                  className="flex-1 bg-transparent text-foreground/60 placeholder:text-foreground/30 outline-none px-3 py-3"
                  style={{ fontSize: '16px' }}
                />
                <span className="px-3 text-[12px] font-bold text-foreground shrink-0">USDT</span>
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
            <div className="mt-1.5 rounded-md bg-input flex items-center overflow-hidden">
              <input
                type="number"
                min={1}
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className="flex-1 bg-transparent text-foreground placeholder:text-foreground/30 outline-none px-3 py-2.5 tabular-nums"
                style={{ fontSize: '16px' }}
              />
              <span className="px-3 text-[11px] font-medium text-foreground/50 shrink-0 border-l border-border/30 py-2.5">
                min
              </span>
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
