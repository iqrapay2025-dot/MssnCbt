import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, CheckCheck, Trash2, MessageSquare, BookOpen, Info, ChevronLeft, Clock } from "lucide-react";
import {
  loadNotifications,
  markAllRead,
  markRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  NOTIFICATION_EVENT,
  type AppNotification,
} from "../utils/notificationStore";

const GREEN = "#1F4E3D";
const ORANGE = "#F97316";
const NAVY = "#0F172A";

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fullDate(ts: number): string {
  return new Date(ts).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function typeLabel(type: AppNotification["type"]): string {
  if (type === "questions") return "Question Bank Update";
  if (type === "broadcast") return "Message from Admin";
  return "System Notice";
}

function typeColor(type: AppNotification["type"]): string {
  if (type === "questions") return GREEN;
  if (type === "broadcast") return ORANGE;
  return "#6B7280";
}

function NotifIcon({ type, size = 15 }: { type: AppNotification["type"]; size?: number }) {
  const color = typeColor(type);
  if (type === "questions") return <BookOpen size={size} style={{ color, flexShrink: 0 }} />;
  if (type === "broadcast") return <MessageSquare size={size} style={{ color, flexShrink: 0 }} />;
  return <Info size={size} style={{ color, flexShrink: 0 }} />;
}

function NotifBg(type: AppNotification["type"]): string {
  if (type === "questions") return `${GREEN}10`;
  if (type === "broadcast") return `${ORANGE}10`;
  return "#F3F4F610";
}

// ── Full message reader ───────────────────────────────────────────────────────
function MessageReader({
  notif,
  onBack,
  onDelete,
}: {
  notif: AppNotification;
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
  const color = typeColor(notif.type);

  return (
    <motion.div
      key="reader"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 32 }}
      className="flex flex-col h-full"
    >
      {/* Reader header */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: "1px solid #F3F4F6" }}
      >
        <motion.button
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#F3F4F6" }}
          aria-label="Back to notifications list"
        >
          <ChevronLeft size={16} style={{ color: "#6B7280" }} />
        </motion.button>
        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: "14px", flex: 1 }}>
          {typeLabel(notif.type)}
        </p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { onDelete(notif.id); onBack(); }}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#FEF2F2" }}
          aria-label="Delete this message"
        >
          <Trash2 size={14} style={{ color: "#DC2626" }} />
        </motion.button>
      </div>

      {/* Message content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <NotifIcon type={notif.type} size={17} />
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: `${color}12`, color }}
          >
            {typeLabel(notif.type)}
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 900,
            color: NAVY,
            fontSize: "18px",
            lineHeight: 1.4,
            marginBottom: "16px",
          }}
        >
          {notif.title}
        </h2>

        {/* Message body — full readable text */}
        <div
          className="rounded-2xl p-4"
          style={{ background: NotifBg(notif.type), border: `1px solid ${color}20` }}
        >
          <p
            style={{
              fontSize: "15px",
              color: "#374151",
              lineHeight: 1.8,
              fontFamily: "'Manrope', sans-serif",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {notif.body}
          </p>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 mt-4">
          <Clock size={13} style={{ color: "#9CA3AF" }} />
          <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{fullDate(notif.timestamp)}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ open, onClose }: Props) {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [reading, setReading] = useState<AppNotification | null>(null);

  const refresh = useCallback(() => {
    setNotifs(loadNotifications());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(NOTIFICATION_EVENT, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  useEffect(() => {
    if (open) { refresh(); setReading(null); }
  }, [open, refresh]);

  const openMessage = (notif: AppNotification) => {
    if (!notif.read) {
      markRead(notif.id);
      setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n));
    }
    setReading(notif);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    markAllRead();
    refresh();
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setReading(null);
    refresh();
  };

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed z-50 shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Notifications panel"
            style={{
              right: 0,
              top: 0,
              bottom: 0,
              width: "min(420px, 100vw)",
              background: "white",
              fontFamily: "'Manrope', sans-serif",
              borderLeft: "1px solid #F0F0F0",
            }}
          >
            <AnimatePresence mode="wait">
              {reading ? (
                <MessageReader
                  key="reader"
                  notif={reading}
                  onBack={() => setReading(null)}
                  onDelete={handleDelete}
                />
              ) : (
                <motion.div
                  key="list"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  className="flex flex-col h-full"
                >
                  {/* Header */}
                  <div
                    className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                    style={{ borderBottom: "1px solid #F3F4F6" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${GREEN}12` }}
                      >
                        <Bell size={17} style={{ color: GREEN }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: NAVY, fontSize: "16px" }}>
                          Notifications
                        </p>
                        {unread > 0 && (
                          <p style={{ fontSize: "11px", color: ORANGE, fontWeight: 700 }}>
                            {unread} unread message{unread !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: `${GREEN}12`, color: GREEN }}
                          aria-label="Mark all notifications as read"
                        >
                          <CheckCheck size={12} /> All read
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "#F3F4F6" }}
                        aria-label="Close notifications"
                      >
                        <X size={15} style={{ color: "#6B7280" }} />
                      </motion.button>
                    </div>
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          style={{ fontSize: "48px", marginBottom: "12px" }}
                        >
                          🔔
                        </motion.div>
                        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: "16px" }}>
                          All caught up!
                        </p>
                        <p style={{ color: "#9CA3AF", fontSize: "13px", marginTop: "6px", lineHeight: 1.6 }}>
                          You'll get notified here when the admin uploads new questions or sends messages.
                        </p>
                      </div>
                    ) : (
                      <div className="px-3 py-3 space-y-2">
                        {notifs.map((notif) => {
                          const color = typeColor(notif.type);
                          return (
                            <motion.button
                              key={notif.id}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ scale: 1.01, y: -1 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => openMessage(notif)}
                              className="w-full text-left rounded-2xl"
                              aria-label={`${notif.read ? "" : "Unread: "}${notif.title}. Tap to read full message.`}
                              style={{
                                background: notif.read ? "#FAFAFA" : NotifBg(notif.type),
                                border: notif.read
                                  ? "1px solid #F0F0F0"
                                  : `1.5px solid ${color}30`,
                                cursor: "pointer",
                                transition: "box-shadow 0.15s",
                              }}
                            >
                              <div className="flex items-start gap-3 p-3.5">
                                {/* Icon */}
                                <div
                                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                  style={{ background: notif.read ? "#F0F0F0" : `${color}15` }}
                                >
                                  <NotifIcon type={notif.type} />
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p
                                      className="truncate"
                                      style={{
                                        fontSize: "13px",
                                        fontWeight: notif.read ? 600 : 800,
                                        color: notif.read ? "#374151" : NAVY,
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {notif.title}
                                    </p>
                                    {!notif.read && (
                                      <div
                                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                                        style={{ background: color }}
                                        aria-hidden="true"
                                      />
                                    )}
                                  </div>
                                  {/* Preview of body — 2 lines max */}
                                  <p
                                    style={{
                                      fontSize: "12px",
                                      color: notif.read ? "#9CA3AF" : "#6B7280",
                                      lineHeight: 1.5,
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {notif.body}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <p style={{ fontSize: "10px", color: "#9CA3AF" }}>
                                      {timeAgo(notif.timestamp)}
                                    </p>
                                    <span
                                      style={{
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        color,
                                        opacity: 0.8,
                                      }}
                                    >
                                      Tap to read →
                                    </span>
                                  </div>
                                </div>

                                {/* Delete — desktop hover */}
                                <motion.button
                                  whileHover={{ scale: 1.15 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                                  className="hidden sm:flex w-6 h-6 rounded-lg items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100"
                                  style={{ background: "#FEE2E2", marginTop: "2px" }}
                                  aria-label="Delete notification"
                                >
                                  <X size={11} style={{ color: "#DC2626" }} />
                                </motion.button>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifs.length > 0 && (
                    <div
                      className="px-4 py-3 flex-shrink-0"
                      style={{ borderTop: "1px solid #F3F4F6" }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClearAll}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold"
                        style={{ background: "#FEF2F220", color: "#DC2626", border: "1px solid #FEE2E2" }}
                        aria-label="Clear all notifications"
                      >
                        <Trash2 size={13} /> Clear all notifications
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Bell button with unread badge ─────────────────────────────────────────────
export function NotificationBell({ onClick }: { onClick: () => void }) {
  const [count, setCount] = useState(getUnreadCount);

  const refresh = useCallback(() => setCount(getUnreadCount()), []);

  useEffect(() => {
    window.addEventListener(NOTIFICATION_EVENT, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative flex items-center justify-center w-9 h-9 rounded-xl"
      aria-label={count > 0 ? `Notifications — ${count} unread` : "Notifications"}
      aria-haspopup="dialog"
      style={{ background: count > 0 ? `${ORANGE}12` : "#F3F4F6" }}
    >
      <motion.div
        animate={count > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
        transition={{ duration: 0.5, repeat: count > 0 ? Infinity : 0, repeatDelay: 4 }}
      >
        <Bell size={17} style={{ color: count > 0 ? ORANGE : "#9CA3AF" }} />
      </motion.div>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 rounded-full flex items-center justify-center"
            style={{
              background: ORANGE,
              fontSize: "9px",
              fontWeight: 900,
              color: "white",
              minWidth: "18px",
              height: "18px",
              lineHeight: 1,
              padding: "0 4px",
            }}
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
