import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { useState } from "react";
import { ChartOverlay } from "../components/ChartOverlay";
import { NotificationsSheet, type Notification } from "../components/NotificationsSheet";
import { SettingsSheet } from "../components/SettingsSheet";
import { useTheme } from "../hooks/use-theme";
import { PAIRS } from "../lib/pairs";
import {
  X,
  Bell,
  Settings,
  TrendingUp,
  Activity,
  ArrowLeftRight,
  PieChart,
  BarChart2,
  Wallet,
  Trophy,
  Users,
  Github,
  Twitter,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — AsterDex" },
      { name: "description", content: "Browse perpetual markets on AsterDex." },
    ],
  }),
  component: MarketsRoute,
});

function MarketsRoute() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState(() => PAIRS[0]);

  const countdown = 0;

  return (
    <>
      <ChartOverlay
        open={true}
        asPage={true}
        theme={theme}
        countdown={countdown}
        navTab="Markets"
        setNavTab={() => {}}
        onOpenChart={() => {}}
        onOpenMenu={() => setMenuOpen(true)}
        selectedPair={selectedPair}
        onSelectPair={setSelectedPair}
        onNavigateTo={(path) => navigate({ to: path as "/trade" | "/markets" })}
      />

      {/* Menu sheet */}
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

      {/* Notifications */}
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

      {/* Settings */}
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
    </>
  );
}

/* ─── Shared nav lists (mirrors trade.tsx) ──────────────────────────────────── */
const APP_ITEMS = [
  { label: "Trade",       icon: TrendingUp  },
  { label: "Markets",     icon: BarChart2   },
  { label: "Portfolio",   icon: Wallet      },
  { label: "Leaderboard", icon: Trophy      },
];
const PRODUCT_ITEMS = [
  { label: "Perpetuals", icon: Activity       },
  { label: "Spot",       icon: ArrowLeftRight },
  { label: "Referrals",  icon: Users          },
  { label: "Analytics",  icon: PieChart       },
];
const COLLAPSIBLE_SECTIONS = ["Protocol", "Company", "Legal & Privacy"];

/* ─── Menu sheet ────────────────────────────────────────────────────────────── */
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />

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
          aria-label="Close menu"
        >
          <X className="h-[15px] w-[15px] text-trade-text/70" />
        </button>

        <div className="px-5 pt-3 pb-2">
          <p className="text-[12px] text-trade-text-muted font-medium mb-3">App</p>
          <div className="space-y-1 mb-6">
            {APP_ITEMS.map(({ label, icon: Icon }) => (
              <button key={label} onClick={onClose} className="w-full flex items-center gap-3.5 py-2.5 active:opacity-60 transition-opacity">
                <span className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(240,185,11,0.12)" }}>
                  <Icon className="h-4 w-4" style={{ color: "#f0b90b" }} />
                </span>
                <span className="text-[16px] font-medium text-trade-text">{label}</span>
              </button>
            ))}
          </div>

          <p className="text-[12px] text-trade-text-muted font-medium mb-3">Products</p>
          <div className="space-y-1 mb-6">
            {PRODUCT_ITEMS.map(({ label, icon: Icon }) => (
              <button key={label} onClick={onClose} className="w-full flex items-center gap-3.5 py-2.5 active:opacity-60 transition-opacity">
                <span className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(240,185,11,0.12)" }}>
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
            <button onClick={onOpenSettings} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-trade-surface active:opacity-60 transition-opacity">
              <Settings className="h-4 w-4 text-trade-text/70" />
              <span className="text-[14px] font-medium text-trade-text">Settings</span>
            </button>
            <button onClick={onOpenNotif} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-trade-surface active:opacity-60 transition-opacity">
              <Bell className="h-4 w-4 text-trade-text/70" />
              <span className="text-[14px] font-medium text-trade-text">Notifications</span>
            </button>
          </div>

          <div className="flex items-center rounded-xl bg-trade-surface p-1 mb-5">
            {(["Light", "Dark"] as const).map((mode) => {
              const active = (mode === "Light" && theme === "light") || (mode === "Dark" && theme === "dark");
              return (
                <button
                  key={mode}
                  onClick={() => { if ((mode === "Light" && theme !== "light") || (mode === "Dark" && theme !== "dark")) toggleTheme(); }}
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
            <button className="h-9 w-9 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity" aria-label="Help">
              <span className="text-[14px] font-bold text-trade-text-muted">?</span>
            </button>
            <div className="flex items-center gap-3">
              {[
                { href: "https://github.com",  Icon: Github,        label: "GitHub"  },
                { href: "https://x.com",       Icon: Twitter,       label: "Twitter" },
                { href: "https://discord.com", Icon: MessageCircle, label: "Discord" },
              ].map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
                  aria-label={label}>
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
