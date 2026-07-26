import { X, Bell, Zap, AlertCircle, Gift, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export interface Notification {
  id: number;
  type: "fill" | "funding" | "alert" | "system" | "reward";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "fill",
    title: "Order Filled",
    body: "BTCUSDT Buy 0.01 BTC @ 66,007.4 USDT",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    type: "funding",
    title: "Funding Rate",
    body: "BTCUSDT next funding: +0.0076% in 00:39:58",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    type: "alert",
    title: "Price Alert",
    body: "BTC crossed your alert at $66,000",
    time: "2h ago",
    unread: true,
  },
  {
    id: 4,
    type: "system",
    title: "New Market",
    body: "SOLUSD Perp is now available to trade",
    time: "5h ago",
    unread: false,
  },
  {
    id: 5,
    type: "fill",
    title: "Order Cancelled",
    body: "ETHUSDT Limit Sell 0.5 ETH @ 3,240 expired",
    time: "8h ago",
    unread: false,
  },
  {
    id: 6,
    type: "reward",
    title: "Referral Reward",
    body: "You earned 12.50 USDT from a referral trade",
    time: "1d ago",
    unread: false,
  },
  {
    id: 7,
    type: "alert",
    title: "Liquidation Warning",
    body: "Your ETHUSDT position is near liquidation price",
    time: "2d ago",
    unread: false,
  },
];

const TYPE_META: Record<
  Notification["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  fill:    { icon: CheckCircle2, color: "#19D18A", bg: "rgba(25,209,138,0.12)" },
  funding: { icon: Zap,          color: "#EFCFA7", bg: "rgba(239,207,167,0.12)" },
  alert:   { icon: AlertCircle,  color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  system:  { icon: Bell,         color: "#8b8b8b", bg: "rgba(139,139,139,0.12)" },
  reward:  { icon: Gift,         color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
};

interface NotificationsSheetProps {
  onClose: () => void;
  theme: "light" | "dark";
  alertNotifications?: Notification[];
}

export function NotificationsSheet({ onClose, theme, alertNotifications = [] }: NotificationsSheetProps) {
  const [notifications, setNotifications] = useState<Notification[]>(() => [
    ...alertNotifications,
    ...MOCK_NOTIFICATIONS,
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const dismiss = (id: number) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div
      className={`fixed inset-0 flex flex-col justify-end ${theme === "dark" ? "dark" : ""}`}
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative bg-trade-card rounded-t-3xl shadow-2xl overflow-y-auto max-h-[85vh]"
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

        {/* Header */}
        <div className="flex items-end justify-between px-5 pt-2 pb-4">
          <div>
            <p className="text-[11px] text-trade-text-muted uppercase tracking-widest font-medium">
              Inbox
            </p>
            <p className="text-[18px] font-bold text-trade-text leading-tight">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center h-5 px-1.5 rounded-full text-[10px] font-bold text-black"
                  style={{ backgroundColor: "#EFCFA7", minWidth: 20 }}>
                  {unreadCount}
                </span>
              )}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[12px] text-trade-text-muted active:opacity-60 transition-opacity pb-0.5"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="px-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(239,207,167,0.10)" }}>
                <Bell className="h-5 w-5" style={{ color: "#EFCFA7" }} />
              </div>
              <p className="text-[13px] text-trade-text-muted">No notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors"
                  style={{ backgroundColor: n.unread ? "rgba(239,207,167,0.05)" : "transparent",
                           border: n.unread ? "1px solid rgba(239,207,167,0.12)" : "1px solid transparent" }}
                >
                  {/* Icon */}
                  <span
                    className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: meta.bg }}
                  >
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </span>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[13px] font-semibold ${n.unread ? "text-trade-text" : "text-trade-text/70"}`}>
                        {n.title}
                      </span>
                      <span className="text-[11px] text-trade-text-muted flex-shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[12px] text-trade-text-muted mt-0.5 leading-snug">{n.body}</p>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() => dismiss(n.id)}
                    className="flex-shrink-0 mt-0.5 active:opacity-50 transition-opacity"
                    aria-label="Dismiss"
                  >
                    <X className="h-3.5 w-3.5 text-trade-text/30" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
