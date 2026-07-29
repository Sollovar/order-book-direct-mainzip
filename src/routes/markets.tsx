import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Search, TrendingUp, TrendingDown, Star, Menu, X } from "lucide-react";
import { WalletButton, MobileWalletMenu } from "../components/WalletButton";
import { NotificationsSheet, type Notification } from "../components/NotificationsSheet";
import { SettingsSheet } from "../components/SettingsSheet";
import { useTheme } from "../hooks/use-theme";
import { useIsMobile } from "../hooks/use-mobile";
import { PAIRS, type Pair } from "../lib/pairs";
import {
  TrendingUp as TrendingUpIcon,
  Activity,
  ArrowLeftRight,
  PieChart,
  BarChart2,
  UserCircle,
  Wallet,
  Trophy,
  Users,
  Github,
  Twitter,
  MessageCircle,
  ChevronRight,
  Bell,
  Settings,
} from "lucide-react";
import { loadFavorites, saveFavorites } from "../lib/alerts";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — AsterDex" },
      { name: "description", content: "Browse all perpetual markets, top gainers, and top losers on AsterDex." },
    ],
  }),
  component: MarketsRoute,
});

function MarketsRoute() {
  const isMobile = useIsMobile();
  if (isMobile === false || isMobile === undefined) return <MarketsDesktopRedirect />;
  return <MarketsPage />;
}

/** Desktop: just show the markets content centred on screen */
function MarketsDesktopRedirect() {
  return <MarketsPage />;
}

/* ─── Column widths (must match header + rows) ────────────────────────────── */
const COL = { pair: 160, price: 96, change: 76, liquidity: 88, mktCap: 92 };
const MIN_W = COL.pair + COL.price + COL.change + COL.liquidity + COL.mktCap + 16;

/* ─── Markets page ─────────────────────────────────────────────────────────── */
function MarketsPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [activeFilter, setActiveFilter] = useState<"all" | "favorites">("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [navTab, setNavTab] = useState("Markets");

  const gainers = [...PAIRS]
    .filter((p) => p.up)
    .sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
    .slice(0, 6);

  const losers = [...PAIRS]
    .filter((p) => !p.up)
    .sort((a, b) => parseFloat(a.change) - parseFloat(b.change))
    .slice(0, 6);

  const filteredPairs = PAIRS.filter((p) => {
    const matchesSearch =
      p.symbol.toLowerCase().includes(search.toLowerCase()) ||
      p.base.toLowerCase().includes(search.toLowerCase());
    const matchesFav = activeFilter === "favorites" ? favorites.includes(p.symbol) : true;
    return matchesSearch && matchesFav;
  });

  function toggleFavorite(symbol: string) {
    setFavorites((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      saveFavorites(next);
      return next;
    });
  }

  function handleSelectPair(pair: Pair) {
    navigate({ to: "/trade", search: { pair: pair.symbol } as never });
  }

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen bg-trade-bg text-trade-text font-sans text-[13px] pb-20 ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-3 pt-4 pb-3">
        <img
          src="https://ndgywsfyfxrixhkfrtia.supabase.co/storage/v1/object/public/My%20logod/IMG_8707.png"
          alt="Logo"
          className="h-8 w-8 object-contain"
        />
        <div className="flex items-center gap-2">
          <WalletButton />
          <button
            onClick={() => setMenuOpen(true)}
            className="h-8 w-8 flex items-center justify-center active:opacity-60 transition-opacity"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5 text-trade-text/80" />
          </button>
        </div>
      </header>

      {/* ── Search + filter tabs ── */}
      <div className="px-3 pt-1 pb-2">
        <div className="flex items-center gap-2 h-9 rounded-xl bg-trade-surface/60 border border-trade-text/8 px-3 mb-3">
          <Search className="h-3.5 w-3.5 text-trade-text-muted flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pairs…"
            className="flex-1 bg-transparent outline-none text-trade-text placeholder:text-trade-text-muted/60"
            style={{ fontSize: 16 }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="flex-shrink-0 active:opacity-60">
              <X className="h-3.5 w-3.5 text-trade-text-muted" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {(["all", "favorites"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
                activeFilter === f
                  ? "bg-[#f0b90b]/15 text-[#f0b90b]"
                  : "text-trade-text-muted"
              }`}
            >
              {f === "all" ? "All Markets" : "Favourites"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Gainers & Losers (only when not searching / not in favorites mode) ── */}
      {!search && activeFilter === "all" && (
        <>
          {/* Top Gainers */}
          <div className="px-3 pt-1 pb-2">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div
                className="h-5 w-5 rounded-md flex items-center justify-center"
                style={{ background: "rgba(240,185,11,0.12)" }}
              >
                <TrendingUp className="h-3 w-3 text-[#f0b90b]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#f0b90b]">
                Top Gainers
              </span>
            </div>
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {gainers.map((pair) => (
                <button
                  key={pair.symbol}
                  onClick={() => handleSelectPair(pair)}
                  className="flex-shrink-0 rounded-2xl p-3 text-left active:scale-[0.97] transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    minWidth: 104,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
                      style={{ backgroundColor: pair.color }}
                    >
                      {pair.base.charAt(0)}
                    </div>
                    <span className="text-[12px] font-bold text-trade-text leading-none">
                      {pair.base}
                    </span>
                  </div>
                  <div className="text-[11px] text-trade-text/60 mb-0.5 tabular-nums">
                    {pair.price}
                  </div>
                  <div className="text-[13px] font-bold tabular-nums text-trade-bid">
                    {pair.change}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <div
                className="h-5 w-5 rounded-md flex items-center justify-center"
                style={{ background: "rgba(240,185,11,0.12)" }}
              >
                <TrendingDown className="h-3 w-3 text-[#f0b90b]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#f0b90b]">
                Top Losers
              </span>
            </div>
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {losers.map((pair) => (
                <button
                  key={pair.symbol}
                  onClick={() => handleSelectPair(pair)}
                  className="flex-shrink-0 rounded-2xl p-3 text-left active:scale-[0.97] transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    minWidth: 104,
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
                      style={{ backgroundColor: pair.color }}
                    >
                      {pair.base.charAt(0)}
                    </div>
                    <span className="text-[12px] font-bold text-trade-text leading-none">
                      {pair.base}
                    </span>
                  </div>
                  <div className="text-[11px] text-trade-text/60 mb-0.5 tabular-nums">
                    {pair.price}
                  </div>
                  <div className="text-[13px] font-bold tabular-nums text-trade-ask">
                    {pair.change}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div
            className="mx-3 mb-1"
            style={{ height: 1, background: "rgba(255,255,255,0.06)" }}
          />
        </>
      )}

      {/* ── Column headers (sticky) ── */}
      <div
        className="sticky top-0 z-20 bg-trade-card border-b border-trade-text/8 overflow-x-hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex items-center" style={{ minWidth: MIN_W }}>
          <div
            className="flex-shrink-0 px-4 py-2 text-[10px] uppercase tracking-wider text-trade-text-muted/60 font-semibold"
            style={{ minWidth: COL.pair }}
          >
            Pair
          </div>
          <span
            className="text-right text-[10px] uppercase tracking-wider text-trade-text-muted/60 font-semibold"
            style={{ minWidth: COL.price }}
          >
            Price
          </span>
          <span
            className="text-right text-[10px] uppercase tracking-wider text-trade-text-muted/60 font-semibold"
            style={{ minWidth: COL.change }}
          >
            24h
          </span>
          <span
            className="text-right text-[10px] uppercase tracking-wider text-[#f0b90b]/70 font-semibold"
            style={{ minWidth: COL.liquidity }}
          >
            Liquidity
          </span>
          <span
            className="text-right text-[10px] uppercase tracking-wider text-trade-text-muted/60 font-semibold pr-4"
            style={{ minWidth: COL.mktCap }}
          >
            Mkt Cap
          </span>
        </div>
      </div>

      {/* ── Pairs list ── */}
      <div className="overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
        <div style={{ minWidth: MIN_W }}>
          {filteredPairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Search className="h-7 w-7 text-trade-text/20" />
              <span className="text-[13px] text-trade-text-muted">No pairs found</span>
            </div>
          ) : (
            filteredPairs.map((pair, i) => {
              const isFav = favorites.includes(pair.symbol);
              return (
                <div
                  key={pair.symbol}
                  className={`flex items-center ${i > 0 ? "border-t border-trade-text/5" : ""}`}
                >
                  {/* Pair cell */}
                  <button
                    onClick={() => handleSelectPair(pair)}
                    className="sticky left-0 z-10 flex-shrink-0 flex items-center gap-2.5 px-4 py-3 active:bg-trade-text/5 transition-colors text-left"
                    style={{
                      minWidth: COL.pair,
                      background: "var(--trade-card, #141418)",
                    }}
                  >
                    <div
                      className="h-7 w-7 rounded-full flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: pair.color }}
                    >
                      {pair.base.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-trade-text leading-tight">
                          {pair.base}
                        </span>
                        <span
                          className="text-[9px] px-1 py-px rounded font-bold text-trade-text-muted/70"
                          style={{ background: "rgba(255,255,255,0.07)" }}
                        >
                          {pair.lev}
                        </span>
                      </div>
                      <span className="text-[10px] text-trade-text-muted/60 truncate block">
                        {pair.symbol}
                      </span>
                    </div>
                  </button>

                  {/* Price */}
                  <button
                    onClick={() => handleSelectPair(pair)}
                    className="text-[12px] font-medium text-trade-text tabular-nums text-right active:opacity-60 transition-opacity"
                    style={{ minWidth: COL.price }}
                  >
                    {pair.price}
                  </button>

                  {/* 24h change */}
                  <button
                    onClick={() => handleSelectPair(pair)}
                    className="text-[12px] font-bold tabular-nums text-right active:opacity-60 transition-opacity"
                    style={{
                      minWidth: COL.change,
                      color: pair.up ? "#00c076" : "#f04f5a",
                    }}
                  >
                    {pair.change}
                  </button>

                  {/* Liquidity */}
                  <span
                    className="text-[12px] font-medium text-trade-text/70 tabular-nums text-right"
                    style={{ minWidth: COL.liquidity }}
                  >
                    {pair.liquidity}
                  </span>

                  {/* Market Cap + fav star */}
                  <div
                    className="flex items-center justify-end gap-2 pr-4"
                    style={{ minWidth: COL.mktCap }}
                  >
                    <span className="text-[12px] font-medium text-trade-text/70 tabular-nums">
                      {pair.marketCap}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(pair.symbol); }}
                      className="flex-shrink-0 active:opacity-60 transition-opacity"
                      aria-label={isFav ? "Remove favourite" : "Add favourite"}
                    >
                      <Star
                        className="h-3.5 w-3.5"
                        fill={isFav ? "#f0b90b" : "none"}
                        stroke={isFav ? "#f0b90b" : "currentColor"}
                        strokeWidth={1.5}
                        style={{ color: isFav ? "#f0b90b" : "var(--trade-text-muted)" }}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-trade-card border-t border-trade-text/5 flex items-center justify-around px-8 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        {[
          {
            label: "Markets",
            icon: (active: boolean) => (
              <BarChart2
                className={`h-[18px] w-[18px] ${active ? "text-[#f0b90b]" : "text-trade-text/40"}`}
              />
            ),
          },
          {
            label: "Trade",
            icon: (active: boolean) => (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0">
                <circle
                  cx="6.5"
                  cy="9"
                  r="5.5"
                  fill="currentColor"
                  className={active ? "text-[#f0b90b]" : "text-trade-text/40"}
                />
                <circle
                  cx="11.5"
                  cy="9"
                  r="5.5"
                  fill="currentColor"
                  fillOpacity="0.65"
                  className={active ? "text-[#f0b90b]" : "text-trade-text/40"}
                />
              </svg>
            ),
          },
          {
            label: "Portfolio",
            icon: (active: boolean) => (
              <PieChart
                className={`h-[18px] w-[18px] ${active ? "text-[#f0b90b]" : "text-trade-text/40"}`}
              />
            ),
          },
          {
            label: "Account",
            icon: (active: boolean) => (
              <UserCircle
                className={`h-[18px] w-[18px] ${active ? "text-[#f0b90b]" : "text-trade-text/40"}`}
              />
            ),
          },
        ].map(({ label, icon }) => {
          const active = navTab === label;
          return (
            <button
              key={label}
              onClick={() => {
                if (label === "Account") { setWalletMenuOpen(true); return; }
                if (label === "Trade") { navigate({ to: "/trade" }); return; }
                setNavTab(label);
              }}
              className="flex items-center gap-2 transition-opacity active:opacity-60"
            >
              {icon(active)}
              <span
                className={`text-[14px] font-medium tracking-tight ${
                  active ? "text-[#f0b90b]" : "text-trade-text/40"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Mobile wallet menu ── */}
      <MobileWalletMenu open={walletMenuOpen} onClose={() => setWalletMenuOpen(false)} />

      {/* ── Mobile menu sheet ── */}
      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <MarketsMenuSheet
            onClose={() => setMenuOpen(false)}
            theme={theme}
            toggleTheme={toggleTheme}
            onOpenNotif={() => { setMenuOpen(false); setNotifOpen(true); }}
            onOpenSettings={() => { setMenuOpen(false); setSettingsOpen(true); }}
          />,
          document.body
        )}

      {/* ── Notifications sheet ── */}
      {notifOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <NotificationsSheet
            onClose={() => setNotifOpen(false)}
            theme={theme}
            alertNotifications={[] as Notification[]}
          />,
          document.body
        )}

      {/* ── Settings sheet ── */}
      {settingsOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <SettingsSheet
            onClose={() => setSettingsOpen(false)}
            theme={theme}
            toggleTheme={toggleTheme}
            alertSound={true}
            onAlertSoundChange={() => {}}
          />,
          document.body
        )}
    </div>
  );
}

/* ─── Menu sheet (same style as trade page) ────────────────────────────────── */
const APP_ITEMS = [
  { label: "Trade",       icon: TrendingUpIcon,  route: "/trade"   },
  { label: "Markets",     icon: BarChart2,        route: "/markets" },
  { label: "Portfolio",   icon: Wallet,           route: "/trade"   },
  { label: "Leaderboard", icon: Trophy,           route: "/trade"   },
];

const PRODUCT_ITEMS = [
  { label: "Perpetuals",  icon: Activity,        route: "/trade" },
  { label: "Spot",        icon: ArrowLeftRight,  route: "/trade" },
  { label: "Referrals",   icon: Users,           route: "/trade" },
  { label: "Analytics",   icon: PieChart,        route: "/trade" },
];

const COLLAPSIBLE_SECTIONS = ["Protocol", "Company", "Legal & Privacy"];

function MarketsMenuSheet({
  onClose,
  theme,
  toggleTheme,
  onOpenNotif,
  onOpenSettings,
}: {
  onClose: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onOpenNotif: () => void;
  onOpenSettings: () => void;
}) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div
      className={`fixed inset-0 flex flex-col justify-end ${theme === "dark" ? "dark" : ""}`}
      style={{ zIndex: 9999 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative bg-trade-card rounded-t-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-9 rounded-full bg-trade-text/20" />
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
        >
          <X className="h-[15px] w-[15px] text-trade-text/70" />
        </button>

        <div className="px-5 pt-3 pb-2">
          <p className="text-[12px] text-trade-text-muted font-medium mb-3">App</p>
          <div className="space-y-1 mb-6">
            {APP_ITEMS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={onClose}
                className="w-full flex items-center gap-3.5 py-2.5 active:opacity-60 transition-opacity"
              >
                <span
                  className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(240,185,11,0.12)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: "#f0b90b" }} />
                </span>
                <span className="text-[16px] font-medium text-trade-text">{label}</span>
              </button>
            ))}
          </div>

          <p className="text-[12px] text-trade-text-muted font-medium mb-3">Products</p>
          <div className="space-y-1 mb-6">
            {PRODUCT_ITEMS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={onClose}
                className="w-full flex items-center gap-3.5 py-2.5 active:opacity-60 transition-opacity"
              >
                <span
                  className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(240,185,11,0.12)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: "#f0b90b" }} />
                </span>
                <span className="text-[16px] font-medium text-trade-text">{label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-trade-text/8 mb-4" />

          <div className="space-y-0">
            {COLLAPSIBLE_SECTIONS.map((section) => {
              const isOpen = openSection === section;
              return (
                <button
                  key={section}
                  onClick={() => setOpenSection(isOpen ? null : section)}
                  className="w-full flex items-center justify-between py-3.5 active:opacity-60 transition-opacity"
                >
                  <span className="text-[15px] text-trade-text-muted font-medium">{section}</span>
                  <ChevronRight
                    className="h-4 w-4 text-trade-text/40 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                  />
                </button>
              );
            })}
          </div>

          <div className="border-t border-trade-text/8 mt-4 mb-5" />

          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onOpenSettings}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-trade-surface active:opacity-60 transition-opacity"
            >
              <Settings className="h-4 w-4 text-trade-text/70" />
              <span className="text-[14px] font-medium text-trade-text">Settings</span>
            </button>
            <button
              onClick={onOpenNotif}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-trade-surface active:opacity-60 transition-opacity"
            >
              <Bell className="h-4 w-4 text-trade-text/70" />
              <span className="text-[14px] font-medium text-trade-text">Notifications</span>
            </button>
          </div>

          {/* Light / Dark toggle */}
          <div className="flex items-center rounded-xl bg-trade-surface p-1 mb-5">
            {(["Light", "Dark"] as const).map((mode) => {
              const active =
                (mode === "Light" && theme === "light") ||
                (mode === "Dark" && theme === "dark");
              return (
                <button
                  key={mode}
                  onClick={() => {
                    if (
                      (mode === "Light" && theme !== "light") ||
                      (mode === "Dark" && theme !== "dark")
                    ) {
                      toggleTheme();
                    }
                  }}
                  className="flex-1 py-2 rounded-lg text-[14px] font-medium transition-all duration-200"
                  style={{
                    color: active ? "var(--trade-text)" : "var(--trade-text-muted)",
                    background: active ? "var(--trade-card)" : "transparent",
                    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.25)" : "none",
                  }}
                >
                  {mode}
                </button>
              );
            })}
          </div>

          <div className="border-t border-trade-text/8 mb-5" />

          <div className="flex items-center justify-between px-1">
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity">
              <span className="text-[14px] font-bold text-trade-text-muted">?</span>
            </button>
            <div className="flex items-center gap-3">
              {[
                { href: "https://github.com", Icon: Github, label: "GitHub" },
                { href: "https://x.com", Icon: Twitter, label: "Twitter" },
                { href: "https://discord.com", Icon: MessageCircle, label: "Discord" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
                  aria-label={label}
                >
                  <Icon className="h-[18px] w-[18px] text-trade-text/70" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
