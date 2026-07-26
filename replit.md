# AsterDex

A perpetuals trading exchange UI built with TanStack Start, React, TypeScript, and Tailwind CSS. Originally built with [Lovable](https://lovable.dev).

## Stack

- **Framework**: TanStack Start (SSR) + React 19
- **Auth / Wallets**: Privy (`@privy-io/react-auth`) — App ID hardcoded in `src/routes/__root.tsx`
- **Chains**: BNB Smart Chain (BSC) + Base via `viem`
- **UI**: Radix UI primitives + shadcn/ui components, Tailwind CSS v4
- **State**: TanStack Query
- **Charts**: Recharts

## Running the app

```sh
bun install
bun run dev        # starts on port 5000
```

The Replit workflow `Start application` runs `bun run dev` automatically.

## Project structure

```
src/
  components/      # UI components (trading panel, order book, wallet button, etc.)
  routes/          # TanStack file-based routes (__root.tsx, index.tsx, /trade, etc.)
  hooks/           # Custom React hooks
  styles.css       # Global styles
  router.tsx       # Router setup
  server.ts        # SSR entry (wraps Nitro)
  start.ts         # Client entry
```

## Notes

- The Privy App ID is hardcoded (`cms0pzb0200dw0bldfjr80r0g`) — no env var needed to run.
- There is a minor SSR hydration mismatch warning in the console (non-blocking, cosmetic only).
- This project is connected to Lovable — avoid force-pushing or rewriting published git history.

## User preferences
