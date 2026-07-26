# AsterDex

A perpetuals DEX (decentralized exchange) trading UI built with TanStack Start, React, TypeScript, and Tailwind CSS.

## Stack

- **Framework**: TanStack Start (SSR) + Vite
- **UI**: React 19, Tailwind CSS v4, Radix UI, shadcn/ui components
- **Auth / Wallets**: Privy (`@privy-io/react-auth`) — App ID is hardcoded in `src/routes/__root.tsx`
- **Chains**: BNB Chain (BSC) and Base (EVM)
- **Package manager**: Bun

## Running the app

```sh
bun install
bun run dev   # starts on port 5000
```

The Replit workflow `Start application` runs `bun run dev` and serves on port 5000.

## Project structure

```
src/
  routes/          # TanStack Start file-based routes
  components/      # Reusable UI components (trading, wallet, sheets, ui/)
  hooks/           # Custom React hooks
  lib/             # Utilities and helpers
  styles.css       # Global styles + Tailwind imports
  server.ts        # SSR server entry
```

## Notes

- Privy App ID is hardcoded — no environment secrets required to run locally.
- A minor SSR hydration mismatch exists on the landing page chart (random data); cosmetic only.
- Privy Solana warning is expected — Solana connectors are not wired up in this build.

## User preferences

<!-- Add user preferences here as they are stated -->
