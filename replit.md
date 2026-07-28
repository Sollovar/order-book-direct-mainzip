# AsterDex

A perpetuals (perps) exchange trading UI — "The perpetuals exchange built for pros." Features 20x leverage, deep liquidity, and a fully non-custodial on-chain design.

## Stack

- **Framework**: TanStack Start (SSR) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Auth / Wallets**: Privy (`@privy-io/react-auth`) — App ID is hardcoded in `src/routes/__root.tsx`
- **Routing**: TanStack Router (file-based, `src/routes/`)
- **Build tool**: Vite 8

## How to run

```sh
bun install   # install dependencies (already done)
bun run dev   # starts Vite dev server on port 5000
```

The app is configured to bind to `0.0.0.0:5000` with `allowedHosts: true` for the Replit preview pane.

## Project structure

```
src/
  routes/          # File-based TanStack Router routes
    __root.tsx     # Root layout (PrivyProvider, nav, etc.)
    index.tsx      # Landing page
    trade.tsx      # Trading view
  components/      # Shared UI components (chart, order book, wallet button, etc.)
  styles.css       # Global styles
  router.tsx       # Router config
  start.ts         # TanStack Start entry (SSR middleware)
  server.ts        # Nitro server entry
```

## User preferences

- Keep existing project structure and stack.
