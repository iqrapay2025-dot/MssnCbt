import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, X, RefreshCw } from "lucide-react";

const GREEN = "#1F4E3D";
const NOTIF_KEY = "mssn_questions_last_updated";
const SEEN_KEY = "mssn_questions_seen_at";

interface UpdatePayload {
  timestamp: number;
  count: number;
}

function getPayload(): UpdatePayload | null {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw) as UpdatePayload;
  } catch {}
  return null;
}

function getSeenAt(): number {
  return parseInt(localStorage.getItem(SEEN_KEY) ?? "0", 10);
}

function markSeen(ts: number) {
  try { localStorage.setItem(SEEN_KEY, ts.toString()); } catch {}
}

export function QuestionUpdateBanner() {
  const [payload, setPayload] = useState<UpdatePayload | null>(null);

  const check = () => {
    const p = getPayload();
    if (p && p.timestamp > getSeenAt() && p.count > 0) {
      setPayload(p);
    }
  };

  useEffect(() => {
    check();

    const onStorage = (e: StorageEvent) => {
      if (e.key === NOTIF_KEY) check();
    };
    const onCustom = () => check();

    window.addEventListener("storage", onStorage);
    window.addEventListener("mssn-questions-updated", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("mssn-questions-updated", onCustom);
    };
  }, []);

  const dismiss = () => {
    if (payload) markSeen(payload.timestamp);
    setPayload(null);
  };

  return (
    <AnimatePresence>
      {payload && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed top-4 left-1/2 z-50 w-full max-w-md px-4"
          style={{ transform: "translateX(-50%)" }}
        >
          <div
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 shadow-2xl"
            style={{
              background: GREEN,
              boxShadow: `0 8px 32px rgba(31,78,61,0.35)`,
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Bell size={18} style={{ color: "white" }} />
            </motion.div>

            <div className="flex-1 min-w-0">
              <p style={{ fontWeight: 800, color: "white", fontSize: "13px", lineHeight: 1.3 }}>
                New questions available!
              </p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", marginTop: "2px" }}>
                {payload.count} question{payload.count !== 1 ? "s" : ""} added to the question bank
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { dismiss(); window.location.reload(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              <RefreshCw size={11} /> Refresh
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={dismiss}
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <X size={14} style={{ color: "rgba(255,255,255,0.7)" }} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
