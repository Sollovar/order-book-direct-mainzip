import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Sun,
  Moon,
  Zap,
  Shield,
  LineChart,
  Layers,
  Wallet,
  Globe,
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AsterDex — The On-Chain Perpetuals Exchange" },
      {
        name: "description",
        content:
          "Trade perpetual futures with deep liquidity, 20x leverage, and lightning-fast execution. Non-custodial. On-chain. Built for pros.",
      },
      { property: "og:title", content: "AsterDex — The On-Chain Perpetuals Exchange" },
      {
        property: "og:description",
        content:
          "Trade perpetual futures with deep liquidity, 20x leverage, and lightning-fast execution.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

type Ticker = { sym: string; price: string; chg: string; up: boolean };
const TICKERS: Ticker[] = [
  { sym: "BTC", price: "66,007.4", chg: "-0.52%", up: false },
  { sym: "ETH", price: "3,487.2", chg: "+1.14%", up: true },
  { sym: "SOL", price: "178.45", chg: "+2.31%", up: true },
  { sym: "WLD", price: "0.3850", chg: "-0.47%", up: false },
  { sym: "OPEN", price: "0.1707", chg: "+4.60%", up: true },
  { sym: "TRUST", price: "0.05005", chg: "+2.79%", up: true },
  { sym: "KITE", price: "0.11364", chg: "-6.97%", up: false },
  { sym: "FET", price: "0.1532", chg: "-1.42%", up: false },
];

function Landing() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Clear any inline bg set by the trade page so the landing page theme shows immediately
    document.documentElement.style.backgroundColor = "";
    document.body.style.backgroundColor = "";

    const stored = localStorage.getItem("asterdex-theme") as "light" | "dark" | null;
    const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initial = stored ?? sys;
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setMounted(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("asterdex-theme")) {
        const next = e.matches ? "dark" : "light";
        setTheme(next);
        document.documentElement.classList.toggle("dark", next === "dark");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("asterdex-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <div className="min-h-screen bg-trade-bg text-trade-text overflow-x-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--trade-primary), transparent)" }}
        />
        <div
          className="absolute top-[40%] -left-32 h-[380px] w-[380px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--trade-bid), transparent)" }}
        />
        <div
          className="absolute top-[60%] -right-32 h-[380px] w-[380px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--trade-ask), transparent)" }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-trade-bg/70 border-b border-trade-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="https://ndgywsfyfxrixhkfrtia.supabase.co/storage/v1/object/public/My%20logod/IMG_8707.png" alt="AsterDex" className="h-8 w-8 object-contain" />
            <span className="font-semibold tracking-tight">AsterDex</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-trade-text-muted">
            <a href="#features" className="hover:text-trade-text transition">Features</a>
            <a href="#markets" className="hover:text-trade-text transition">Markets</a>
            <a href="#stats" className="hover:text-trade-text transition">Stats</a>
            <a href="#faq" className="hover:text-trade-text transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-lg bg-trade-surface hover:bg-trade-border transition"
            >
              {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
            </button>
            <Link
              to="/trade"
              className="hidden sm:inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-trade-primary-text transition hover:brightness-110"
              style={{ background: "var(--trade-primary)" }}
            >
              Launch App <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-4 pt-16 pb-20 md:pt-28 md:pb-32">
        <div className="mx-auto max-w-6xl text-center">
          <div
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-trade-border bg-trade-surface px-3 py-1.5 text-xs text-trade-text-muted animate-fade-in"
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--trade-primary)" }} />
            Now live — trade perps on-chain
          </div>
          <h1
            className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl animate-fade-in"
            style={{ animationDelay: "60ms", animationFillMode: "backwards" }}
          >
            The perpetuals exchange{" "}
            <span style={{ color: "var(--trade-primary)" }}>
              built for pros.
            </span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-base text-trade-text-muted sm:text-lg animate-fade-in"
            style={{ animationDelay: "140ms", animationFillMode: "backwards" }}
          >
            Deep liquidity. 20x leverage. Millisecond execution. Fully non-custodial and on-chain —
            your keys, your positions.
          </p>
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in"
            style={{ animationDelay: "220ms", animationFillMode: "backwards" }}
          >
            <Link
              to="/trade"
              className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-trade-primary-text shadow-lg transition hover:brightness-110"
              style={{ background: "var(--trade-primary)" }}
            >
              Start Trading
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition hover:opacity-80"
              style={{ borderColor: "var(--trade-primary)", color: "var(--trade-primary)" }}
            >
              Explore Features
            </a>
          </div>

          {/* Terminal preview */}
          <TerminalPreview />
        </div>

        {/* Marquee ticker */}
        <Marquee />
      </section>

      {/* Stats */}
      <section id="stats" className="px-4 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { k: "$4.8B+", v: "24h Volume" },
            { k: "180K+", v: "Active Traders" },
            { k: "20x", v: "Max Leverage" },
            { k: "<50ms", v: "Order Latency" },
          ].map((s) => (
            <div
              key={s.v}
              className="rounded-2xl border border-trade-border bg-trade-card p-5 text-left"
            >
              <div
                className="text-2xl font-bold md:text-3xl"
                style={{ color: "var(--trade-primary)" }}
              >
                {s.k}
              </div>
              <div className="mt-1 text-xs text-trade-text-muted">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Built for serious traders.</h2>
            <p className="mx-auto mt-3 max-w-xl text-trade-text-muted">
              Every millisecond, every tick, every basis point — engineered.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title="Millisecond Execution"
              body="Off-chain matching with on-chain settlement. Fills that feel like a CEX, guarantees of a DEX."
            />
            <Feature
              icon={<Shield className="h-5 w-5" />}
              title="Non-Custodial"
              body="Your funds never leave your wallet. Trade directly from your keys with zero counterparty risk."
            />
            <Feature
              icon={<LineChart className="h-5 w-5" />}
              title="Deep Order Book"
              body="Institutional liquidity across 40+ perpetual markets. Tight spreads, real depth."
            />
            <Feature
              icon={<Layers className="h-5 w-5" />}
              title="Cross-Margin"
              body="One collateral pool, every position. Maximize capital efficiency across markets."
            />
            <Feature
              icon={<Wallet className="h-5 w-5" />}
              title="One-Click Wallets"
              body="Connect any EVM wallet. Session keys mean no popups mid-trade."
            />
            <Feature
              icon={<Globe className="h-5 w-5" />}
              title="Global & Permissionless"
              body="No KYC. No gatekeepers. If you have a wallet, you have access."
            />
          </div>
        </div>
      </section>

      {/* Markets */}
      <section id="markets" className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Live Markets</h2>
              <p className="mt-2 text-trade-text-muted">Real-time prices across our top perpetuals.</p>
            </div>
            <Link
              to="/trade"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: "var(--trade-primary)" }}
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-trade-border bg-trade-card">
            <div className="grid grid-cols-3 gap-4 border-b border-trade-border px-4 py-3 text-[11px] uppercase tracking-wider text-trade-text-muted">
              <span>Market</span>
              <span className="text-right">Price</span>
              <span className="text-right">24h</span>
            </div>
            {TICKERS.slice(0, 6).map((t, i) => (
              <Link
                to="/trade"
                key={t.sym}
                className="grid grid-cols-3 gap-4 border-b border-trade-border px-4 py-4 text-sm transition hover:bg-trade-surface last:border-b-0"
                style={{ animation: `fade-in 0.4s ease-out ${i * 40}ms backwards` }}
              >
                <span className="font-semibold">{t.sym}<span className="text-trade-text-muted">/USDT</span></span>
                <span className="text-right font-mono">{t.price}</span>
                <span
                  className="flex items-center justify-end gap-1 font-mono"
                  style={{ color: t.up ? "var(--trade-bid)" : "var(--trade-ask)" }}
                >
                  {t.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {t.chg}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div
          className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-trade-border p-10 text-center md:p-16"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--trade-primary) 15%, var(--trade-card)), var(--trade-card))",
          }}
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Ready to take your edge on-chain?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-trade-text-muted">
            Connect your wallet and place your first trade in under 30 seconds.
          </p>
          <Link
            to="/trade"
            className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-trade-primary-text shadow-lg transition hover:brightness-110"
            style={{ background: "var(--trade-primary)" }}
          >
            Launch App <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-trade-border mt-8">
        {/* Top section */}
        <div className="mx-auto max-w-6xl px-6 pt-14 pb-10 grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src="https://ndgywsfyfxrixhkfrtia.supabase.co/storage/v1/object/public/My%20logod/IMG_8707.png"
                alt="AsterDex"
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold text-base tracking-tight">AsterDex</span>
            </div>
            <p className="text-sm text-trade-text-muted leading-relaxed max-w-[220px]">
              The on-chain perpetuals exchange built for serious traders.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              {[
                { label: "X / Twitter", path: "M4 4l16 16M4 20L20 4" },
                { label: "Discord", path: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
                { label: "Telegram", path: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
              ].map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="h-8 w-8 rounded-lg border border-trade-border flex items-center justify-center text-trade-text-muted transition hover:border-trade-primary hover:text-trade-primary"
                  style={{ "--trade-primary": "var(--trade-primary)" } as React.CSSProperties}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--trade-primary)"; (e.currentTarget as HTMLElement).style.color = "var(--trade-primary)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ""; (e.currentTarget as HTMLElement).style.color = ""; }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-trade-text-muted">Product</p>
            {["Trade", "Markets", "Portfolio", "Leaderboard", "API Docs"].map(l => (
              <a key={l} href="#" className="text-sm text-trade-text-muted transition-colors hover:text-trade-text">{l}</a>
            ))}
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-trade-text-muted">Company</p>
            {["About", "Blog", "Careers", "Brand Kit", "Contact"].map(l => (
              <a key={l} href="#" className="text-sm text-trade-text-muted transition-colors hover:text-trade-text">{l}</a>
            ))}
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-trade-text-muted">Legal</p>
            {["Terms of Service", "Privacy Policy", "Risk Disclosure", "Cookie Policy"].map(l => (
              <a key={l} href="#" className="text-sm text-trade-text-muted transition-colors hover:text-trade-text">{l}</a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-trade-border" />

        {/* Bottom bar */}
        <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-trade-text-muted">
            © {new Date().getFullYear()} AsterDex. All rights reserved. Trading involves risk.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--trade-primary)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--trade-primary)" }}>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-trade-border bg-trade-card p-6 transition hover:-translate-y-0.5 hover:border-trade-text-muted/40">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: "var(--trade-primary)" }}
      />
      <div
        className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          background: "color-mix(in oklab, var(--trade-primary) 20%, transparent)",
          color: "var(--trade-primary)",
        }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-trade-text-muted">{body}</p>
    </div>
  );
}

function TerminalPreview() {
  const [asks, setAsks] = useState<{ p: number; s: number; pct: number }[]>([]);
  const [bids, setBids] = useState<{ p: number; s: number; pct: number }[]>([]);
  const [mid, setMid] = useState(66007.4);
  const dirRef = useRef<"up" | "down">("up");

  useEffect(() => {
    const gen = () => {
      const a: { p: number; s: number; pct: number }[] = [];
      const b: { p: number; s: number; pct: number }[] = [];
      for (let i = 5; i >= 1; i--) {
        a.push({
          p: mid + i * 0.4 + Math.random() * 0.3,
          s: Math.random() * 250,
          pct: 20 + Math.random() * 70,
        });
      }
      for (let i = 1; i <= 5; i++) {
        b.push({
          p: mid - i * 0.4 - Math.random() * 0.3,
          s: Math.random() * 250,
          pct: 20 + Math.random() * 70,
        });
      }
      setAsks(a);
      setBids(b);
    };
    gen();
    const t = setInterval(() => {
      const delta = (Math.random() - 0.5) * 6;
      dirRef.current = delta >= 0 ? "up" : "down";
      setMid((m) => +(m + delta).toFixed(1));
      gen();
    }, 1400);
    return () => clearInterval(t);
  }, [mid]);

  return (
    <div
      className="mt-14 mx-2 md:mx-auto md:max-w-4xl animate-fade-in"
      style={{ animationDelay: "300ms", animationFillMode: "backwards" }}
    >
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs text-trade-text-muted font-medium">BTCUSDT · Perp</span>
        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--trade-primary)" }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--trade-primary)" }} />
          Live
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">
        {/* Order book */}
        <div>
          <div className="grid grid-cols-3 text-[10px] uppercase tracking-wider text-trade-text-muted mb-2 px-1">
            <span>Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>
          <div className="space-y-0.5">
            {asks.map((r, i) => (
              <BookRow key={"a" + i} row={r} side="ask" />
            ))}
          </div>
          <div className="my-2 flex items-center justify-center gap-2 py-2 text-sm font-semibold">
            <span style={{ color: "var(--trade-primary)" }}>{mid.toFixed(1)}</span>
            {dirRef.current === "up" ? (
              <TrendingUp className="h-3.5 w-3.5" style={{ color: "var(--trade-primary)" }} />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" style={{ color: "var(--trade-primary)" }} />
            )}
          </div>
          <div className="space-y-0.5">
            {bids.map((r, i) => (
              <BookRow key={"b" + i} row={r} side="bid" />
            ))}
          </div>
        </div>
        {/* Chart mock */}
        <div className="relative mt-4 md:mt-0 md:pl-4">
          <MiniChart />
        </div>
      </div>
    </div>
  );
}

function BookRow({ row, side }: { row: { p: number; s: number; pct: number }; side: "ask" | "bid" }) {
  const opacity = side === "ask" ? "0.12" : "0.08";
  return (
    <div className="relative grid grid-cols-3 items-center px-2 py-1 text-xs font-mono">
      <div
        className="absolute inset-y-0 right-0"
        style={{ width: `${row.pct}%`, background: `rgba(240,185,11,${opacity})` }}
      />
      <span className="relative z-10" style={{ color: "var(--trade-primary)" }}>
        {row.p.toFixed(1)}
      </span>
      <span className="relative z-10 text-right">{row.s.toFixed(2)}K</span>
      <span className="relative z-10 text-right text-trade-text-muted">
        {(row.s * row.p).toFixed(0)}
      </span>
    </div>
  );
}

function MiniChart() {
  const [pts, setPts] = useState<number[]>([]);
  useEffect(() => {
    // Initialize with random data on the client only to avoid SSR hydration mismatch
    const initial = Array.from(
      { length: 48 },
      (_, i) => 50 + Math.sin(i / 3) * 12 + Math.random() * 6
    );
    setPts(initial);
    const t = setInterval(() => {
      setPts((p) => {
        if (p.length === 0) return p;
        const next = [...p.slice(1), Math.max(20, Math.min(80, p[p.length - 1] + (Math.random() - 0.5) * 8))];
        return next;
      });
    }, 900);
    return () => clearInterval(t);
  }, []);

  if (pts.length === 0) return null;

  const w = 400;
  const h = 220;
  const step = w / (pts.length - 1);
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (v / 100) * h}`).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  const last = pts[pts.length - 1];
  const first = pts[0];
  const up = last >= first;
  const stroke = up ? "var(--trade-bid)" : "var(--trade-ask)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((y) => (
        <line
          key={y}
          x1={0}
          x2={w}
          y1={h * y}
          y2={h * y}
          stroke="var(--trade-border)"
          strokeDasharray="3 5"
        />
      ))}
      <path d={area} fill="url(#grad)" />
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={h - (last / 100) * h} r={4} fill={stroke}>
        <animate attributeName="r" values="4;7;4" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Marquee() {
  const items = [...TICKERS, ...TICKERS];
  return (
    <div className="relative mt-16 overflow-hidden border-y border-trade-border bg-trade-card/50 py-4">
      <div className="flex gap-8 whitespace-nowrap animate-marquee">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="font-semibold">{t.sym}/USDT</span>
            <span className="font-mono text-trade-text-muted">{t.price}</span>
            <span
              className="font-mono"
              style={{ color: t.up ? "var(--trade-bid)" : "var(--trade-ask)" }}
            >
              {t.chg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
