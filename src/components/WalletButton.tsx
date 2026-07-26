import { useState, useRef, useEffect } from "react";
import { usePrivy, useWallets, useAddFunds } from "@privy-io/react-auth";
import { Wallet, Copy, LogOut, Check, X, Plus, ChevronRight, Loader } from "lucide-react";

/* ─── Chain registry ──────────────────────────────────────────── */

const CHAINS = [
  {
    id: 56,
    name: "BNB Chain",
    shortName: "BSC",
    color: "#F0B90B",
    bg: "rgba(240,185,11,0.15)",
    caip2: "eip155:56",
    logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  },
  {
    id: 8453,
    name: "Base",
    shortName: "Base",
    color: "#0052FF",
    bg: "rgba(0,82,255,0.15)",
    caip2: "eip155:8453",
    logo: "https://ndgywsfyfxrixhkfrtia.supabase.co/storage/v1/object/public/My%20logod/IMG_8712%20(1).png",
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
  const divider = <div style={{ height: 1, background: "color-mix(in oklab, var(--trade-text) 7%, transparent)" }} />;

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
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-9 rounded-full bg-trade-text/20" />
        </div>

        {/* ── Header row ── */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
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
            className="h-7 w-7 flex items-center justify-center rounded-full active:opacity-60 transition-opacity"
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
            <p className="text-[13px] font-mono font-medium truncate" style={{ color: "var(--trade-text)" }}>
              {address ?? "No address"}
            </p>
          </div>
          <button
            onClick={copy}
            className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg active:opacity-60 transition-opacity"
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
              className="w-full flex items-center gap-3 px-5 py-3.5 active:opacity-70 transition-opacity disabled:cursor-default"
              style={{
                borderTop: i > 0 ? "1px solid color-mix(in oklab, var(--trade-text) 5%, transparent)" : undefined,
                borderLeft: isActive ? `2px solid ${chain.color}` : "2px solid transparent",
              }}
            >
              <img
                src={chain.logo}
                alt={chain.name}
                width={20}
                height={20}
                className="h-5 w-5 rounded-full flex-shrink-0 object-cover"
                style={{ opacity: isActive ? 1 : 0.45 }}
              />
              <span
                className="flex-1 text-left text-[14px]"
                style={{
                  color: isActive ? "var(--trade-text)" : "color-mix(in oklab, var(--trade-text) 55%, transparent)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {chain.name}
              </span>
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" style={{ color: "var(--trade-text-muted)" }} />
              ) : isActive ? (
                <Check className="h-4 w-4 flex-shrink-0" style={{ color: chain.color }} />
              ) : null}
            </button>
          );
        })}

        {divider}

        {/* ── Add Funds ── */}
        <button
          onClick={onAddFunds}
          className="w-full flex items-center gap-3 px-5 py-4 active:opacity-70 transition-opacity"
        >
          <Plus className="h-4 w-4 flex-shrink-0" style={{ color: "color-mix(in oklab, var(--trade-text) 55%, transparent)" }} />
          <span className="text-[14px] font-semibold" style={{ color: "color-mix(in oklab, var(--trade-text) 70%, transparent)" }}>Add Funds</span>
        </button>

        {divider}

        {/* ── Disconnect ── */}
        <button
          onClick={onDisconnect}
          className="w-full flex items-center gap-3 px-5 py-4 active:opacity-70 transition-opacity"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" style={{ color: "color-mix(in oklab, var(--trade-text) 55%, transparent)" }} />
          <span className="text-[14px] font-semibold" style={{ color: "color-mix(in oklab, var(--trade-text) 70%, transparent)" }}>Disconnect</span>
        </button>

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
              {/* Chain logo */}
              <img
                src={chain.logo}
                alt={chain.name}
                width={20}
                height={20}
                className="h-5 w-5 rounded-full flex-shrink-0 object-cover"
                style={{ opacity: isActive ? 1 : 0.45 }}
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
          <Plus className="h-4 w-4 flex-shrink-0" style={{ color: "color-mix(in oklab, var(--trade-text) 55%, transparent)" }} />
          <span className="text-[13px] font-semibold" style={{ color: "color-mix(in oklab, var(--trade-text) 70%, transparent)" }}>Add Funds</span>
        </button>

        {divider}

        {/* ── Disconnect ── */}
        <button
          onClick={onDisconnect}
          className="w-full flex items-center gap-3 px-5 py-4 hover:opacity-70 transition-opacity"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" style={{ color: "color-mix(in oklab, var(--trade-text) 55%, transparent)" }} />
          <span className="text-[13px] font-semibold" style={{ color: "color-mix(in oklab, var(--trade-text) 70%, transparent)" }}>Disconnect</span>
        </button>

      </div>
    </div>
  );
}

/* ─── Externally triggered mobile wallet menu ─────────────────── */

export function MobileWalletMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { addFunds } = useAddFunds();

  const wallet = wallets[0] ?? null;
  const address = wallet?.address ?? null;
  const chainId = (wallet as { chainId?: number } | null)?.chainId;

  // If not authenticated, trigger Privy login and close
  useEffect(() => {
    if (open && ready && !authenticated) {
      login();
      onClose();
    }
  }, [open, ready, authenticated, login, onClose]);

  async function handleAddFunds() {
    if (!address) return;
    onClose();
    await addFunds({
      destination: { address, chain: "eip155:56", asset: "native-currency" },
      fiat: {},
    });
  }

  async function handleSwitchChain(id: number) {
    if (!wallet) return;
    await (wallet as { switchChain: (id: number) => Promise<void> }).switchChain(id);
  }

  if (!open || !authenticated) return null;

  return (
    <WalletSheet
      address={address}
      chainId={chainId}
      onClose={onClose}
      onDisconnect={() => { logout(); onClose(); }}
      onAddFunds={handleAddFunds}
      onSwitchChain={handleSwitchChain}
    />
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
