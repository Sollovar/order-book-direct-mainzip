import { useState } from "react";
import { X, ChevronRight, Layers } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type ChildOrder = {
  id: string;
  level: number;
  price: number;
  size: number;
  status: "pending" | "filled" | "cancelled";
};

export type LadderOrder = {
  id: string;
  pair: string;
  direction: "Long" | "Short";
  priceFrom: number;
  priceTo: number;
  totalSize: number;
  children: ChildOrder[];
  createdAt: string;
};

/* ─── Mock data ──────────────────────────────────────────────────────────── */

export const MOCK_LADDER_ORDERS: LadderOrder[] = [
  {
    id: "ldr-001",
    pair: "BTC/USDT",
    direction: "Long",
    priceFrom: 65_200,
    priceTo: 66_000,
    totalSize: 0.5,
    createdAt: "2025-07-25 09:14",
    children: [
      { id: "c1", level: 1, price: 65_200, size: 0.1, status: "filled" },
      { id: "c2", level: 2, price: 65_400, size: 0.1, status: "filled" },
      { id: "c3", level: 3, price: 65_600, size: 0.1, status: "pending" },
      { id: "c4", level: 4, price: 65_800, size: 0.1, status: "pending" },
      { id: "c5", level: 5, price: 66_000, size: 0.1, status: "pending" },
    ],
  },
  {
    id: "ldr-002",
    pair: "ETH/USDT",
    direction: "Short",
    priceFrom: 3_400,
    priceTo: 3_520,
    totalSize: 2.0,
    createdAt: "2025-07-25 10:02",
    children: [
      { id: "d1", level: 1, price: 3_520, size: 0.5, status: "pending" },
      { id: "d2", level: 2, price: 3_480, size: 0.5, status: "pending" },
      { id: "d3", level: 3, price: 3_440, size: 0.5, status: "pending" },
      { id: "d4", level: 4, price: 3_400, size: 0.5, status: "pending" },
    ],
  },
];

/* ─── Ladder order row ───────────────────────────────────────────────────── */

function LadderRow({
  order,
  onClick,
}: {
  order: LadderOrder;
  onClick: () => void;
}) {
  const filled = order.children.filter((c) => c.status === "filled").length;
  const total = order.children.length;
  const pct = Math.round((filled / total) * 100);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-5 py-4 active:opacity-60 transition-opacity border-b border-trade-text/5 last:border-0"
    >
      {/* Icon */}
      <span
        className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "rgba(240,185,11,0.12)" }}
      >
        <Layers className="h-4 w-4" style={{ color: "#f0b90b" }} />
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-trade-text">{order.pair}</span>
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
              order.direction === "Long"
                ? "bg-[#16a34a]/15 text-[#22c55e]"
                : "bg-[#dc2626]/15 text-[#f87171]"
            }`}
          >
            {order.direction}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {/* Progress bar */}
          <div className="flex-1 h-1 rounded-full bg-trade-surface overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: "#f0b90b" }}
            />
          </div>
          <span className="text-[11px] text-trade-text-muted flex-shrink-0">
            {filled}/{total} filled
          </span>
        </div>
        <div className="mt-0.5 text-[11px] text-trade-text-muted">
          {order.priceFrom.toLocaleString()} → {order.priceTo.toLocaleString()} ·{" "}
          {order.totalSize} BTC
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-trade-text/30 flex-shrink-0" />
    </button>
  );
}

/* ─── Bottom sheet ───────────────────────────────────────────────────────── */

function LadderDetailSheet({
  order,
  onClose,
  onCancelChild,
  onCancelAll,
}: {
  order: LadderOrder;
  onClose: () => void;
  onCancelChild: (childId: string) => void;
  onCancelAll: () => void;
}) {
  const filled = order.children.filter((c) => c.status === "filled").length;
  const total = order.children.length;
  const pct = Math.round((filled / total) * 100);
  const hasPending = order.children.some((c) => c.status === "pending");

  return (
    <div className="fixed inset-0 flex flex-col justify-end" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet — same texture as hamburger menu */}
      <div
        className="relative bg-trade-card rounded-t-3xl shadow-2xl overflow-y-auto max-h-[88vh]"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-9 rounded-full bg-trade-text/20" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
          aria-label="Close"
        >
          <X className="h-[15px] w-[15px] text-trade-text/70" />
        </button>

        <div className="px-5 pt-3 pb-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[18px] font-bold text-trade-text">{order.pair}</span>
            <span
              className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${
                order.direction === "Long"
                  ? "bg-[#16a34a]/15 text-[#22c55e]"
                  : "bg-[#dc2626]/15 text-[#f87171]"
              }`}
            >
              {order.direction}
            </span>
          </div>
          <p className="text-[13px] text-trade-text-muted mb-1">
            Ladder · {order.priceFrom.toLocaleString()} → {order.priceTo.toLocaleString()} USDT
          </p>
          <p className="text-[12px] text-trade-text/40 mb-4">{order.createdAt}</p>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-1.5 rounded-full bg-trade-surface overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: "#f0b90b" }}
              />
            </div>
            <span className="text-[12px] text-trade-text-muted">
              {filled}/{total} levels filled
            </span>
          </div>

          {/* Section label */}
          <p className="text-[12px] text-trade-text-muted font-medium mb-3">Child Orders</p>

          {/* Child order list */}
          <div className="mb-6">
            {order.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-3 py-3 border-b border-trade-text/5 last:border-0"
              >
                {/* Level badge */}
                <span
                  className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
                  style={{ backgroundColor: "rgba(240,185,11,0.12)", color: "#f0b90b" }}
                >
                  {child.level}
                </span>

                {/* Price & size */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[14px] font-semibold text-trade-text">
                      {child.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-trade-text-muted">USDT</span>
                  </div>
                  <div className="text-[11px] text-trade-text-muted">{child.size} BTC</div>
                </div>

                {/* Status / cancel */}
                {child.status === "filled" && (
                  <span className="text-[11px] font-semibold text-[#22c55e]">
                    Filled
                  </span>
                )}
                {child.status === "cancelled" && (
                  <span className="text-[11px] text-trade-text/40">
                    Cancelled
                  </span>
                )}
                {child.status === "pending" && (
                  <button
                    onClick={() => onCancelChild(child.id)}
                    className="text-[11px] text-trade-text-muted active:opacity-50 transition-opacity"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Cancel all button */}
          {hasPending ? (
            <button
              onClick={onCancelAll}
              className="text-[14px] text-trade-text-muted active:opacity-50 transition-opacity"
            >
              Cancel Order
            </button>
          ) : (
            <span className="text-[14px] text-trade-text/30">
              All levels settled
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main export: the full Ladder History panel ─────────────────────────── */

export function LadderHistoryPanel() {
  const [orders, setOrders] = useState<LadderOrder[]>(MOCK_LADDER_ORDERS);
  const [selected, setSelected] = useState<LadderOrder | null>(null);

  function cancelChild(orderId: string, childId: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              children: o.children.map((c) =>
                c.id === childId ? { ...c, status: "cancelled" } : c
              ),
            }
      )
    );
    // keep sheet open with updated data
    setSelected((prev) =>
      prev?.id !== orderId
        ? prev
        : {
            ...prev,
            children: prev.children.map((c) =>
              c.id === childId ? { ...c, status: "cancelled" } : c
            ),
          }
    );
  }

  function cancelAll(orderId: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id !== orderId
          ? o
          : {
              ...o,
              children: o.children.map((c) =>
                c.status === "pending" ? { ...c, status: "cancelled" } : c
              ),
            }
      )
    );
    setSelected(null);
  }

  return (
    <>
      <div className="divide-y divide-trade-text/5">
        {orders.map((order) => (
          <LadderRow
            key={order.id}
            order={order}
            onClick={() => setSelected(order)}
          />
        ))}
      </div>

      {selected && (
        <LadderDetailSheet
          order={selected}
          onClose={() => setSelected(null)}
          onCancelChild={(childId) => cancelChild(selected.id, childId)}
          onCancelAll={() => cancelAll(selected.id)}
        />
      )}
    </>
  );
}
