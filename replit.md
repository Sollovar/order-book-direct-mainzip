# Project Overview

A crypto/DeFi trading UI built with TanStack Start, React 19, TypeScript, and Tailwind CSS v4. Includes order ladder, pair selector, chart overlay, wallet connection (Privy), and notifications.

## Stack

- **Framework**: TanStack Start (Vite + SSR)
- **UI**: React 19, Tailwind CSS v4, Radix UI, shadcn/ui components
- **Auth/Wallet**: Privy (`@privy-io/react-auth`) — App ID is hardcoded in `src/routes/__root.tsx`
- **Blockchain**: viem
- **Charts**: Recharts
- **Package manager**: Bun

## Running the app

```sh
bun install
bun run dev   # starts on port 5000
```

The Replit workflow "Start application" runs `bun run dev` and serves on port 5000.

## Project structure

- `src/components/` — UI components (ChartOverlay, LadderOrderSheet, PairSelectorPanel, WalletButton, etc.)
- `src/routes/` — TanStack Router file-based routes
- `src/hooks/` — custom React hooks
- `src/styles.css` — global styles (Tailwind)
- `src/server.ts` — SSR entry point
- `vite.config.ts` — Vite config via `@lovable.dev/vite-tanstack-config`

## Notes

- Originally built with [Lovable](https://lovable.dev); connected to a GitHub repo. Avoid force-pushing or rebasing published commits (see AGENTS.md).
- The Privy App ID (`cms0pzb0200dw0bldfjr80r0g`) is hardcoded — no env vars required to run.
- A Solana connector warning appears in the console; it's a Privy config issue in the app, not a Replit issue.

## User preferences
