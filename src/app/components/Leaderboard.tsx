import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navigation } from "./Navigation";
import { PageFade, MotionCard, fadeUp, stagger } from "./MotionCard";
import { Trophy, Users } from "lucide-react";
import { loadLeaderboard, getUserId, type LBEntry } from "../utils/leaderboardStore";
import { SkeletonListRow, SkeletonCard } from "./Skeleton";

const GREEN = "#1F4E3D";
const ORANGE = "#F97316";
const NAVY = "#0F172A";

type Period = "All-time" | "This week" | "This month";

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function Leaderboard() {
  const [period, setPeriod] = useState<Period>("All-time");
  const [entries, setEntries] = useState<LBEntry[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const currentUserId = getUserId();

  useEffect(() => {
    const t = setTimeout(() => {
      setEntries(loadLeaderboard());
      setPageLoading(false);
    }, 500);

    const refresh = () => setEntries(loadLeaderboard());
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      clearTimeout(t);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const ranked = [...entries]
    .sort((a, b) => b.bestScore - a.bestScore)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  const PODIUM_ORDER = [top3[1], top3[0], top3[2]];
  const PODIUM_HEIGHTS = ["h-28", "h-36", "h-24"];
  const PODIUM_POSITIONS = [2, 1, 3];
  const PODIUM_EMOJIS = ["🥈", "🥇", "🥉"];

  return (
    <PageFade>
      <div className="lg:pl-64 min-h-screen" style={{ background: "#F5F0E6", fontFamily: "'Manrope', sans-serif" }}>
        <Navigation />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-28 lg:pb-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="mb-6">
            <motion.h1
              variants={fadeUp}
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "28px", color: NAVY }}
            >
              Leaderboard 🏆
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} style={{ color: "#6B7280", fontSize: "14px" }}>
              {ranked.length > 0
                ? `${ranked.length} student${ranked.length === 1 ? "" : "s"} ranked · updates after every exam`
                : "Rankings appear after students complete their first exam"}
            </motion.p>
          </motion.div>

          {/* Skeleton state */}
          {pageLoading && (
            <div className="space-y-4">
              <SkeletonCard height={180} className="mb-2" />
              {[1, 2, 3, 4].map((i) => <SkeletonListRow key={i} />)}
            </div>
          )}

          {/* Period Toggle */}
          {!pageLoading && <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "#E8E0D0" }}
          >
            {(["All-time", "This week", "This month"] as Period[]).map((p) => (
              <motion.button
                key={p}
                whileTap={{ scale: 0.96 }}
                onClick={() => setPeriod(p)}
                className="flex-1 py-2.5 rounded-lg text-sm transition-all duration-300"
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  background: period === p ? "white" : "transparent",
                  color: period === p ? NAVY : "#9CA3AF",
                  boxShadow: period === p ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {p}
              </motion.button>
            ))}
          </motion.div>}

          {/* Empty State */}
          {!pageLoading && ranked.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16"
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
                style={{ background: `${GREEN}12` }}
              >
                <Trophy size={36} style={{ color: GREEN, opacity: 0.4 }} />
              </div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "18px", color: NAVY, marginBottom: "8px" }}>
                No rankings yet
              </p>
              <p style={{ fontSize: "14px", color: "#9CA3AF", lineHeight: 1.6, maxWidth: "280px", margin: "0 auto" }}>
                Complete your first exam to appear on the leaderboard. Rankings update in real time!
              </p>
            </motion.div>
          )}

          {/* Single user — no podium, just a card */}
          {!pageLoading && ranked.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-3xl p-6 mb-6 text-center"
              style={{ background: GREEN }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(255,255,255,0.2)" }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "24px", color: "white" }}>
                  {initials(ranked[0].name)}
                </span>
              </div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "16px", color: "white" }}>
                {ranked[0].nickname}
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", marginBottom: "12px" }}>
                {ranked[0].sessions} session{ranked[0].sessions !== 1 ? "s" : ""} completed
              </p>
              <div className="flex justify-center gap-6">
                <div>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "22px", color: ORANGE }}>{ranked[0].bestScore}%</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Best Score</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "22px", color: "white" }}>{ranked[0].avgScore}%</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Avg Score</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "22px", color: "white" }}>{ranked[0].streak}d</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Streak</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Podium (3+ users) */}
          {!pageLoading && ranked.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-end justify-center gap-3 mb-6"
            >
              <AnimatePresence>
                {PODIUM_ORDER.map((entry, idx) => {
                  if (!entry) return <div key={idx} className="flex-1" />;
                  const pos = PODIUM_POSITIONS[idx];
                  const isFirst = pos === 1;
                  const isMe = entry.userId === currentUserId;
                  return (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + idx * 0.1, type: "spring", stiffness: 180 }}
                      className="flex-1 flex flex-col items-center"
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2.5 + idx * 0.3, repeat: Infinity, ease: "easeInOut" }}
                        style={{ fontSize: "28px", marginBottom: "4px" }}
                      >
                        {PODIUM_EMOJIS[idx]}
                      </motion.div>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                        style={{
                          background: isFirst ? ORANGE : "#F3F4F6",
                          color: isFirst ? "white" : "#6B7280",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 800,
                          fontSize: "18px",
                          border: isMe ? `3px solid ${GREEN}` : "none",
                        }}
                      >
                        {initials(entry.name)}
                      </div>
                      <p style={{ fontSize: "11px", fontWeight: 800, color: NAVY, textAlign: "center", marginBottom: "2px" }}>{entry.nickname}</p>
                      <p style={{ fontSize: "13px", fontWeight: 900, color: ORANGE, marginBottom: "6px" }}>{entry.bestScore}%</p>
                      <div
                        className={`w-full ${PODIUM_HEIGHTS[idx]} rounded-t-2xl flex items-center justify-center`}
                        style={{ background: isFirst ? NAVY : "#E5E7EB" }}
                      >
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "24px", color: isFirst ? "white" : "#6B7280" }}>
                          {pos}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* 2 users — simple list instead of podium */}
          {!pageLoading && ranked.length === 2 && (
            <div className="space-y-2 mb-4">
              {ranked.map((entry, i) => {
                const isMe = entry.userId === currentUserId;
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.1 }}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{
                      background: "white",
                      border: isMe ? `2px solid ${GREEN}` : "2px solid transparent",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    }}
                  >
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: ORANGE, minWidth: "28px", fontSize: "16px" }}>
                      #{entry.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${GREEN}15`, fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "16px", color: GREEN }}>
                      {initials(entry.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 800, color: isMe ? GREEN : NAVY, fontSize: "14px" }}>
                        {entry.nickname}{isMe && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: GREEN, color: "white", fontSize: "9px" }}>YOU</span>}
                      </p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{entry.sessions} sessions</p>
                    </div>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "15px", color: NAVY }}>
                      {entry.bestScore}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Rest of ranked list (4th place onward) */}
          {!pageLoading && rest.length > 0 && (
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-2">
              {rest.map((entry, i) => {
                const isMe = entry.userId === currentUserId;
                return (
                  <motion.div
                    key={entry.userId}
                    variants={fadeUp}
                    custom={i}
                    whileHover={{ x: 4, boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{
                      background: "white",
                      border: isMe ? `2px solid ${GREEN}` : "2px solid transparent",
                      boxShadow: isMe ? `0 4px 20px ${GREEN}18` : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#D1D5DB", minWidth: "28px", fontSize: "13px" }}>
                      #{entry.rank}
                    </span>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isMe ? GREEN : `${GREEN}12`,
                        color: isMe ? "white" : GREEN,
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 800,
                        fontSize: "15px",
                      }}
                    >
                      {initials(entry.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontWeight: 800, color: isMe ? GREEN : NAVY, fontSize: "14px" }} className="flex items-center gap-2">
                        {entry.nickname}
                        {isMe && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: GREEN, color: "white", fontSize: "9px" }}>
                            YOU
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{entry.sessions} sessions</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: "14px" }}>⭐</span>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "15px", color: NAVY }}>
                        {entry.bestScore}%
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* "You" card if current user is in top 3 with 3+ users */}
          {!pageLoading && ranked.length >= 3 && ranked.find(e => e.userId === currentUserId && e.rank <= 3) && (
            <MotionCard style={{ background: `${GREEN}10`, borderRadius: "20px", padding: "14px 18px", marginTop: "16px", border: `1.5px solid ${GREEN}25` }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: GREEN, fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "14px", color: "white" }}>
                  {initials(ranked.find(e => e.userId === currentUserId)?.name ?? "")}
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: "13px", fontWeight: 800, color: GREEN }}>
                    You're on the podium! 🏆 Rank #{ranked.find(e => e.userId === currentUserId)?.rank}
                  </p>
                </div>
              </div>
            </MotionCard>
          )}

          {/* Realtime note */}
          {!pageLoading && ranked.length > 0 && (
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Users size={13} style={{ color: "#9CA3AF" }} />
                <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  Leaderboard updates automatically after every completed exam
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageFade>
  );
}
