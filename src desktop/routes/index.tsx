import { createFileRoute } from "@tanstack/react-router";
import { TradingPage } from "@/components/trading/TradingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BTCUSDT Perp · Aster Trade" },
      { name: "description", content: "Trade BTCUSDT perpetual futures with a professional order book, live chart, and limit orders." },
      { property: "og:title", content: "BTCUSDT Perp · Aster Trade" },
      { property: "og:description", content: "Professional perpetual futures trading terminal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TradingPage,
});
