# AsterDex

An on-chain perpetuals exchange UI built with TanStack Start, React 19, TypeScript, and Tailwind CSS.

## Stack

- **Framework**: TanStack Start (SSR) + Vite
- **UI**: React 19, Tailwind CSS v4, Radix UI, shadcn/ui components
- **Auth / Wallets**: Privy (`@privy-io/react-auth`) — App ID is hardcoded in `src/routes/__root.tsx`
- **Chains**: BNB Chain (BSC) + Base (via viem)
- **Package manager**: Bun

## Running the app

```sh
bun install
bun run dev
```

The dev server listens on `0.0.0.0:5000` with `allowedHosts: true` — works in the Replit preview pane out of the box.

## Key structure

```
src/
  routes/          # TanStack file-based routes (index, trade, markets, __root)
  components/      # Trading UI: TradingPage, PairSelectorPanel, ChartOverlay, etc.
  components/ui/   # shadcn/ui primitives
  lib/             # Utilities: pairs, alerts, theme, error capture
  hooks/           # use-mobile, use-theme
  styles.css       # Tailwind + CSS variables
  server.ts        # SSR entry (wraps TanStack Start's server)
```

## User preferences

<!-- Add any project-specific preferences here -->
