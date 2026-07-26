import { useState, useRef, useEffect } from "react";
import { usePrivy, useWallets, useAddFunds } from "@privy-io/react-auth";
import { Wallet, Copy, LogOut, Check, X, Plus, ChevronRight, Loader } from "lucide-react";

/* ─── Chain registry ──────────────────────────────────────────── */

const CHAINS = [
  {
    id: 56,
    name: "BNB Chain",
    shortName: "BSC",
    // Simple colored circle used as icon
    color: "#F0B90B",
    bg: "rgba(240,185,11,0.15)",
    caip2: "eip155:56",
  },
  {
    id: 8453,
    name: "Base",
    shortName: "Base",
    color: "#0052FF",
    bg: "rgba(0,82,255,0.15)",
    caip2: "eip155:8453",
  },
] as const;

/* ─── helpers ─────────────────────────────────────────────────── */

function truncate(addr: string) {
  if (!addr) return "";
  if (addr.startsWith("0x")) return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function chainById(id: number | undefined) {
  return CHAINS.find((c) => c.id === id) ?? null;
}

/* ─── Wallet detail sheet ─────────────────────────────────────── */

function WalletSheet({
  address,
  chainId,
  onClose,
  onDisconnect,
  onAddFunds,
  onSwitchChain,
}: {
  address: string | null;
  chainId: number | undefined;
  onClose: () => void;
  onDisconnect: () => void;
  onAddFunds: () => void;
  onSwitchChain: (id: number) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);

  function copy() {
    if (!address) return;
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSwitch(id: number) {
    if (id === chainId || switching !== null) return;
    setSwitching(id);
    try {
      await onSwitchChain(id);
    } finally {
      setSwitching(null);
    }
  }

  const activeChain = chainById(chainId);

  return (
    <div className="fixed inset-0 flex flex-col justify-end" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative bg-trade-card rounded-t-3xl shadow-2xl overflow-y-auto max-h-[80vh]"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-9 rounded-full bg-trade-text/20" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
          aria-label="Close"
        >
          <X className="h-[15px] w-[15px] text-trade-text/70" />
        </button>

        <div className="px-5 pt-3 pb-4 space-y-5">

          {/* Title + active chain badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] flex-shrink-0" />
              <span className="text-[18px] font-bold text-trade-text">Connected</span>
            </div>
            {activeChain && (
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: activeChain.bg, color: activeChain.color }}
              >
                {activeChain.shortName}
              </span>
            )}
          </div>

          {/* Address card */}
          <div>
            <p className="text-[12px] text-trade-text-muted font-medium mb-2">Wallet Address</p>
            <div
              className="rounded-2xl px-4 py-3.5 flex items-start justify-between gap-3"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-[13px] font-mono font-semibold text-trade-text break-all leading-relaxed">
                {address ?? "No address"}
              </p>
              <button
                onClick={copy}
                className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-trade-surface active:opacity-60 transition-opacity mt-0.5"
                aria-label="Copy address"
              >
                {copied
                  ? <Check className="h-3.5 w-3.5 text-[#22c55e]" />
                  : <Copy className="h-3.5 w-3.5 text-trade-text/50" />}
              </button>
            </div>
          </div>

          {/* Chain selector */}
          <div>
            <p className="text-[12px] text-trade-text-muted font-medium mb-2">Network</p>
            <div className="space-y-2">
              {CHAINS.map((chain) => {
                const isActive = chain.id === chainId;
                const isLoading = switching === chain.id;
                return (
                  <button
                    key={chain.id}
                    onClick={() => handleSwitch(chain.id)}
                    disabled={isActive || switching !== null}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-opacity active:opacity-70 disabled:cursor-default"
                    style={{
                      background: isActive ? chain.bg : "rgba(255,255,255,0.04)",
                      border: isActive ? `1px solid ${chain.color}40` : "1px solid transparent",
                    }}
                  >
                    {/* Chain icon dot */}
                    <span
                      className="h-7 w-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black"
                      style={{ background: chain.bg, color: chain.color }}
                    >
                      {chain.shortName[0]}
                    </span>

                    <span
                      className="flex-1 text-left text-[14px] font-semibold"
                      style={{ color: isActive ? chain.color : "var(--trade-text)" }}
                    >
                      {chain.name}
                    </span>

                    {isLoading ? (
                      <Loader className="h-4 w-4 animate-spin text-trade-text-muted" />
                    ) : isActive ? (
                      <Check className="h-4 w-4 flex-shrink-0" style={{ color: chain.color }} />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-trade-text-muted" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Funds */}
          <button
            onClick={onAddFunds}
            className="w-full py-3.5 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 active:opacity-70 transition-opacity"
            style={{ background: "rgba(240,185,11,0.12)", color: "#f0b90b" }}
          >
            <Plus className="h-4 w-4" />
            Add Funds
          </button>

          <div className="border-t border-trade-text/8" />

          {/* Disconnect */}
          <button
            onClick={onDisconnect}
            className="w-full py-3.5 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 active:opacity-70 transition-opacity"
            style={{ background: "rgba(220,38,38,0.12)", color: "#f87171" }}
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </button>

        </div>
      </div>
    </div>
  );
}

/* ─── Desktop dropdown (same texture as WalletSheet) ─────────── */

function WalletDropdown({
  address,
  chainId,
  anchorRef,
  onClose,
  onDisconnect,
  onAddFunds,
  onSwitchChain,
}: {
  address: string | null;
  chainId: number | undefined;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onDisconnect: () => void;
  onAddFunds: () => void;
  onSwitchChain: (id: number) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Position the dropdown fixed below the anchor button
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    function place() {
      const btn = anchorRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose, anchorRef]);

  function copy() {
    if (!address) return;
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSwitch(id: number) {
    if (id === chainId || switching !== null) return;
    setSwitching(id);
    try {
      await onSwitchChain(id);
    } finally {
      setSwitching(null);
    }
  }

  const activeChain = chainById(chainId);

  /*
   * Rendered inline in the DOM tree (NOT a portal) so this element is always
   * a descendant of the page's theme wrapper (.aster-desktop.dark etc.) and
   * inherits the exact same CSS custom properties as the rest of the page —
   * matching the mobile WalletSheet colours precisely.
   * `position: fixed` keeps it visually anchored near the button.
   */

  const divider = (
    <div style={{ height: 1, background: "color-mix(in oklab, var(--trade-text) 7%, transparent)" }} />
  );

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[9999] w-[22rem]"
      style={{ top: pos.top, right: pos.right }}
    >
      {/* Panel */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--trade-card)",
          border: "1px solid color-mix(in oklab, var(--trade-text) 8%, transparent)",
          boxShadow: "0 32px 80px -16px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(255,255,255,0.04) inset",
        }}
      >

        {/* ── Header row ── */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#22c55e] flex-shrink-0" />
            <span className="text-[15px] font-bold" style={{ color: "var(--trade-text)" }}>Connected</span>
            {activeChain && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: activeChain.bg, color: activeChain.color }}
              >
                {activeChain.shortName}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
            style={{ background: "var(--trade-surface)" }}
            aria-label="Close"
          >
            <X className="h-[13px] w-[13px]" style={{ color: "color-mix(in oklab, var(--trade-text) 60%, transparent)" }} />
          </button>
        </div>

        {divider}

        {/* ── Address row ── */}
        <div className="flex items-center justify-between px-5 py-4 gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--trade-text-muted)" }}>Wallet Address</p>
            <p className="text-[12px] font-mono font-medium truncate" style={{ color: "var(--trade-text)" }}>
              {address ?? "No address"}
            </p>
          </div>
          <button
            onClick={copy}
            className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg hover:opacity-70 transition-opacity"
            style={{ background: "color-mix(in oklab, var(--trade-text) 7%, transparent)" }}
            aria-label="Copy address"
          >
            {copied
              ? <Check className="h-3.5 w-3.5 text-[#22c55e]" />
              : <Copy className="h-3.5 w-3.5" style={{ color: "color-mix(in oklab, var(--trade-text) 50%, transparent)" }} />}
          </button>
        </div>

        {divider}

        {/* ── Network label ── */}
        <div className="px-5 pt-3.5 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--trade-text-muted)" }}>Network</p>
        </div>

        {/* ── Chain rows ── */}
        {CHAINS.map((chain, i) => {
          const isActive = chain.id === chainId;
          const isLoading = switching === chain.id;
          return (
            <button
              key={chain.id}
              onClick={() => handleSwitch(chain.id)}
              disabled={isActive || switching !== null}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:opacity-70 transition-opacity disabled:cursor-default"
              style={{
                borderTop: i > 0 ? "1px solid color-mix(in oklab, var(--trade-text) 5%, transparent)" : undefined,
                borderLeft: isActive ? `2px solid ${chain.color}` : "2px solid transparent",
              }}
            >
              {/* Color dot */}
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: chain.color, opacity: isActive ? 1 : 0.3 }}
              />
              <span
                className="flex-1 text-left text-[13px]"
                style={{
                  color: isActive ? "var(--trade-text)" : "color-mix(in oklab, var(--trade-text) 55%, transparent)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {chain.name}
              </span>
              {isLoading ? (
                <Loader className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--trade-text-muted)" }} />
              ) : isActive ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: chain.color }} />
              ) : null}
            </button>
          );
        })}

        {divider}

        {/* ── Add Funds ── */}
        <button
          onClick={onAddFunds}
          className="w-full flex items-center gap-3 px-5 py-4 hover:opacity-70 transition-opacity"
        >
          <Plus className="h-4 w-4 flex-shrink-0" style={{ color: "#f0b90b" }} />
          <span className="text-[13px] font-semibold" style={{ color: "#f0b90b" }}>Add Funds</span>
        </button>

        {divider}

        {/* ── Disconnect ── */}
        <button
          onClick={onDisconnect}
          className="w-full flex items-center gap-3 px-5 py-4 hover:opacity-70 transition-opacity"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" style={{ color: "#f87171" }} />
          <span className="text-[13px] font-semibold" style={{ color: "#f87171" }}>Disconnect</span>
        </button>

      </div>
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────── */

interface WalletButtonProps {
  /** Renders full-width inside the order form */
  fullWidth?: boolean;
}

export function WalletButton({ fullWidth = false }: WalletButtonProps) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { addFunds } = useAddFunds();
  const [sheetOpen, setSheetOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Desktop = viewport ≥ 768px (matches Tailwind md breakpoint)
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // First EVM wallet (embedded or external)
  const wallet = wallets[0] ?? null;
  const address = wallet?.address ?? null;
  const chainId = (wallet as { chainId?: number } | null)?.chainId;

  async function handleAddFunds() {
    if (!address) return;
    setSheetOpen(false);
    await addFunds({
      destination: {
        address,
        chain: "eip155:56",
        asset: "native-currency",
      },
      fiat: {},
    });
  }

  async function handleSwitchChain(id: number) {
    if (!wallet) return;
    await (wallet as { switchChain: (id: number) => Promise<void> }).switchChain(id);
  }

  /* ── Not ready ── */
  if (!ready) {
    if (fullWidth) {
      return (
        <button disabled className="w-full rounded-full bg-trade-surface py-2.5 text-[14px] font-bold mt-1 flex items-center justify-center gap-2 opacity-40">
          <Wallet className="h-4 w-4" />
          Loading…
        </button>
      );
    }
    return (
      <button disabled className="flex items-center gap-1.5 rounded-full bg-trade-surface pl-2.5 pr-3.5 py-1.5 text-[13px] font-bold opacity-40">
        <Wallet className="h-3.5 w-3.5" />
        Connect
      </button>
    );
  }

  /* ── Not authenticated ── */
  if (!authenticated) {
    if (fullWidth) {
      return (
        <button
          onClick={login}
          className="w-full rounded-full bg-[#f0b90b] text-[#1a1200] py-2.5 text-[14px] font-bold mt-1 flex items-center justify-center gap-2 active:brightness-90 transition-all"
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </button>
      );
    }
    return (
      <button
        onClick={login}
        className="flex items-center gap-1.5 rounded-full bg-[#f0b90b] text-[#1a1200] pl-2.5 pr-3.5 py-1.5 text-[13px] font-bold active:brightness-90 transition-all shadow-sm"
      >
        <Wallet className="h-3.5 w-3.5" />
        Connect
      </button>
    );
  }

  /* ── Authenticated ── */
  if (fullWidth) {
    return (
      <button className="w-full rounded-full bg-[#f0b90b] text-[#1a1200] py-2.5 text-[14px] font-bold mt-1 flex items-center justify-center gap-2 active:brightness-90 transition-all">
        Place Order
      </button>
    );
  }

  const activeChain = chainById(chainId);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setSheetOpen(true)}
        className="flex items-center gap-1.5 rounded-full bg-trade-surface border border-[#f0b90b]/30 pl-2.5 pr-3 py-1.5 text-[13px] font-semibold text-[#f0b90b] active:opacity-70 transition-all"
      >
        <Wallet className="h-3.5 w-3.5 flex-shrink-0" />
        {truncate(address ?? "Connected")}
        {activeChain && (
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded-full ml-0.5"
            style={{ background: activeChain.bg, color: activeChain.color }}
          >
            {activeChain.shortName}
          </span>
        )}
      </button>

      {sheetOpen && isDesktop && (
        <WalletDropdown
          address={address}
          chainId={chainId}
          anchorRef={buttonRef}
          onClose={() => setSheetOpen(false)}
          onDisconnect={() => { logout(); setSheetOpen(false); }}
          onAddFunds={handleAddFunds}
          onSwitchChain={handleSwitchChain}
        />
      )}

      {sheetOpen && !isDesktop && (
        <WalletSheet
          address={address}
          chainId={chainId}
          onClose={() => setSheetOpen(false)}
          onDisconnect={() => { logout(); setSheetOpen(false); }}
          onAddFunds={handleAddFunds}
          onSwitchChain={handleSwitchChain}
        />
      )}
    </>
  );
}
