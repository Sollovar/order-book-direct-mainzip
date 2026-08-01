/**
 * KLineChart — wraps klinecharts v10 for AsterDex.
 *
 * klinecharts touches `window` at module-load time, so it cannot be
 * statically imported in a TanStack Start SSR context.  We dynamic-import
 * it inside useEffect (client-only) to avoid the "window is not defined"
 * SSR crash.
 */
import { useEffect, useRef } from "react";
import type { Chart, KLineData, DataLoader, Period } from "klinecharts";

/* ─── Types ─────────────────────────────────────────── */

export interface KLineChartProps {
  /** Trading pair ticker, e.g. "BTCUSDT" */
  symbol: string;
  /** Decimal places for price display */
  pricePrecision?: number;
  /** Timeframe string: "1m" | "5m" | "15m" | "1H" | "4H" | "1D" | "1W" */
  timeframe: string;
  /** Color theme matching the rest of the app */
  theme: "dark" | "light";
  /**
   * Optional real data loader — passes straight through to klinecharts
   * setDataLoader.  When omitted the built-in mock generator is used.
   */
  dataLoader?: DataLoader;
  className?: string;
}

/* ─── Timeframe → Period ────────────────────────────── */

const PERIOD_MAP: Record<string, Period> = {
  "1m":  { type: "minute", span: 1  },
  "3m":  { type: "minute", span: 3  },
  "5m":  { type: "minute", span: 5  },
  "15m": { type: "minute", span: 15 },
  "30m": { type: "minute", span: 30 },
  "1H":  { type: "hour",   span: 1  },
  "2H":  { type: "hour",   span: 2  },
  "4H":  { type: "hour",   span: 4  },
  "1D":  { type: "day",    span: 1  },
  "1W":  { type: "week",   span: 1  },
  "1M":  { type: "month",  span: 1  },
};

function toPeriod(tf: string): Period {
  return PERIOD_MAP[tf] ?? { type: "day", span: 1 };
}

/* ─── Seeded PRNG ────────────────────────────────────── */

function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/* ─── Mock data ─────────────────────────────────────── */

const INTERVAL_MS: Record<string, number> = {
  "1m":  60_000,
  "3m":  3   * 60_000,
  "5m":  5   * 60_000,
  "15m": 15  * 60_000,
  "30m": 30  * 60_000,
  "1H":  3_600_000,
  "2H":  2   * 3_600_000,
  "4H":  4   * 3_600_000,
  "1D":  86_400_000,
  "1W":  7   * 86_400_000,
  "1M":  30  * 86_400_000,
};

function generateBars(tf: string, endTs: number, count = 300): KLineData[] {
  const interval = INTERVAL_MS[tf] ?? 86_400_000;
  const startTs  = Math.floor((endTs - count * interval) / interval) * interval;
  const rand     = seededRand(0xC0FFEE + interval);
  const bars: KLineData[] = [];
  let price = 66_000;

  for (let i = 0; i < count; i++) {
    const timestamp = startTs + i * interval;
    const vol   = price * 0.014;
    const move  = (rand() - 0.478) * vol;
    const open  = price;
    const close = Math.max(20_000, Math.min(110_000, open + move));
    const wick  = rand() * vol * 0.6;
    const high  = Math.max(open, close) + wick;
    const low   = Math.min(open, close) - wick * 0.8;
    bars.push({ timestamp, open, high, low, close, volume: 50 + rand() * 8_000 });
    price = close;
  }
  return bars;
}

/* ─── Theme styles ───────────────────────────────────── */

function makeStyles(theme: "dark" | "light") {
  const dk = theme === "dark";
  const UP   = "#19D18A";
  const DOWN = "#E05B57";
  const NO   = dk ? "#8A8A8A" : "#999999";

  const textColor  = dk ? "rgba(243,243,243,0.55)" : "rgba(0,0,0,0.45)";
  const gridColor  = dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";
  const crossColor = dk ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.22)";
  const tooltipBg  = dk ? "#171718" : "#ffffff";
  const tooltipFg  = dk ? "#F3F3F3" : "#333333";
  const tooltipBdr = dk ? "#2A2A2C" : "#e0e0e0";

  const axisTickText = {
    show: true, color: textColor, size: 11,
    family: "Inter, ui-sans-serif, sans-serif",
    weight: "400" as const, marginStart: 4, marginEnd: 4,
  };

  const crossText = {
    show: true, style: "fill" as const,
    color: tooltipFg, size: 11,
    family: "Inter, ui-sans-serif, sans-serif",
    weight: "normal" as const,
    borderStyle: "solid" as const, borderDashedValue: [2, 2],
    borderSize: 1, borderColor: tooltipBdr, borderRadius: 4,
    paddingLeft: 5, paddingRight: 5, paddingTop: 3, paddingBottom: 3,
    backgroundColor: tooltipBg,
  };

  return {
    grid: {
      show: true,
      horizontal: { show: true, size: 1, color: gridColor, style: "dashed" as const, dashedValue: [3, 4] },
      vertical:   { show: false },
    },
    candle: {
      bar: {
        upColor: UP, downColor: DOWN, noChangeColor: NO,
        compareRule: "current_open" as const,
        upBorderColor: UP, downBorderColor: DOWN, noChangeBorderColor: NO,
        upWickColor:   UP, downWickColor:   DOWN, noChangeWickColor:   NO,
      },
      priceMark: {
        last: {
          show: true,
          upColor: UP, downColor: DOWN, noChangeColor: NO,
          text: {
            show: true, style: "fill" as const, size: 11,
            family: "Inter, ui-sans-serif, sans-serif",
            weight: "500" as const, color: dk ? "#0A0A0B" : "#ffffff",
            borderStyle: "solid" as const, borderDashedValue: [2, 2],
            borderSize: 0, borderColor: "transparent", borderRadius: 3,
            paddingLeft: 4, paddingRight: 4, paddingTop: 2, paddingBottom: 2,
            backgroundColor: "transparent",
          },
        },
      },
    },
    xAxis: {
      show: true, size: "auto" as const,
      axisLine: { show: false, size: 1, color: gridColor },
      tickLine: { show: false, size: 1, length: 3, color: gridColor },
      tickText: axisTickText,
    },
    yAxis: {
      show: true, size: "auto" as const,
      axisLine: { show: false, size: 1, color: gridColor },
      tickLine: { show: false, size: 1, length: 3, color: gridColor },
      tickText: axisTickText,
    },
    crosshair: {
      show: true,
      horizontal: {
        show: true,
        line: { show: true, style: "dashed" as const, dashedValue: [4, 3], size: 1, color: crossColor },
        text: crossText,
      },
      vertical: {
        show: true,
        line: { show: true, style: "dashed" as const, dashedValue: [4, 3], size: 1, color: crossColor },
        text: crossText,
      },
    },
  };
}

/* ─── Component ──────────────────────────────────────── */

export function KLineChart({
  symbol,
  pricePrecision = 1,
  timeframe,
  theme,
  dataLoader: externalLoader,
  className = "",
}: KLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<Chart | null>(null);

  // Stable refs so async callbacks always see the latest values
  const themeRef     = useRef(theme);
  const timeframeRef = useRef(timeframe);
  themeRef.current     = theme;
  timeframeRef.current = timeframe;

  /* ── Mount: dynamic import to avoid SSR crash ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    let tickTimer: ReturnType<typeof setInterval> | null = null;
    let liveCb: ((d: KLineData) => void) | null = null;
    let disposed = false;

    // Dynamic import — runs only in the browser
    import("klinecharts").then(({ init, dispose }) => {
      if (disposed || !container) return;

      const chart = init(container, { styles: makeStyles(theme) });
      if (!chart) return;
      chartRef.current = chart;

      chart.setSymbol({ ticker: symbol, pricePrecision, volumePrecision: 2 });
      chart.setOffsetRightDistance(60);
      chart.setPeriod(toPeriod(timeframe));

      const loader: DataLoader = externalLoader ?? {
        getBars({ period, timestamp, callback }) {
          const tf =
            period.type === "minute" ? `${period.span}m`
            : period.type === "hour" ? `${period.span}H`
            : period.type === "day"  ? "1D"
            : period.type === "week" ? "1W"
            : "1D";
          callback(generateBars(tf, timestamp ?? Date.now()), false);
        },

        subscribeBar({ callback }) {
          liveCb = callback;
          tickTimer = setInterval(() => {
            const list = chart.getDataList();
            if (!list.length) return;
            const last  = list[list.length - 1];
            const delta = (Math.random() - 0.5) * last.close * 0.0008;
            const nc    = Math.max(20_000, last.close + delta);
            liveCb?.({
              timestamp: last.timestamp,
              open:   last.open,
              high:   Math.max(last.high, nc),
              low:    Math.min(last.low,  nc),
              close:  nc,
              volume: (last.volume ?? 0) + Math.random() * 50,
            });
          }, 2_000);
        },

        unsubscribeBar() {
          liveCb = null;
          if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
        },
      };

      chart.setDataLoader(loader);
    });

    return () => {
      disposed = true;
      if (tickTimer) clearInterval(tickTimer);
      // Dispose via dynamic import to stay consistent
      import("klinecharts").then(({ dispose }) => dispose(container));
      chartRef.current = null;
    };
  // Re-init only when symbol changes; timeframe/theme handled below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  /* ── Timeframe changes ── */
  useEffect(() => {
    chartRef.current?.setPeriod(toPeriod(timeframe));
  }, [timeframe]);

  /* ── Theme changes ── */
  useEffect(() => {
    chartRef.current?.setStyles(makeStyles(theme));
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ background: theme === "dark" ? "#0A0A0B" : "#f8f8f8" }}
    />
  );
}

export default KLineChart;
