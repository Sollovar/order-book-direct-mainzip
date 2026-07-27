# AsterDex

A crypto trading UI built with TanStack Start, React 19, Tailwind CSS v4, and Privy wallet auth. Supports BSC and Base chains.

## Stack

- **Framework**: TanStack Start (SSR) + TanStack Router
- **UI**: React 19, Tailwind CSS v4, Radix UI, shadcn/ui components
- **Auth/Wallet**: Privy (`@privy-io/react-auth`) — hardcoded app ID `cms0pzb0200dw0bldfjr80r0g`
- **Chains**: BNB Smart Chain (default), Base
- **Package manager**: Bun

## Running

```sh
bun install
bun run dev   # starts Vite dev server on port 5000
```

The "Start application" workflow handles this automatically on Replit.

## Key files

- `src/routes/__root.tsx` — root layout, Privy provider, theme logic
- `src/routes/trade.tsx` — `/trade` route
- `src/components/trading/TradingPage.tsx` — main trading UI (order book, chart, order form)
- `src/components/WalletButton.tsx` — wallet connect button
- `vite.config.ts` — Vite + TanStack Start config via `@lovable.dev/vite-tanstack-config`

## Notes

- Order book data is currently **mocked** (static arrays in `TradingPage.tsx`)
- To use your own Privy account, replace the `appId` in `src/routes/__root.tsx`

## User preferences
