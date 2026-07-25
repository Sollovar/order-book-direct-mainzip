# AsterDex

A perpetuals trading exchange interface built with TanStack Start, React 19, TypeScript, and Tailwind CSS. Features wallet authentication via Privy, on-chain trading on BSC and Base, and a real-time order book UI.

## Stack

- **Framework**: TanStack Start (SSR) + TanStack Router
- **UI**: React 19, Tailwind CSS v4, Radix UI primitives, shadcn/ui components
- **Auth/Wallet**: Privy (`@privy-io/react-auth`) — App ID is hardcoded in `src/routes/__root.tsx`
- **Chains**: BNB Smart Chain (BSC) + Base via `viem`
- **Build**: Vite 8 + Bun

## Running the app

```sh
bun install
bun run dev
```

The dev server starts on port 5000.

## Key routes

- `/` — Landing page
- `/trade` — Trading interface (order book, pair selector, chart overlay)

## User preferences

(none yet)
