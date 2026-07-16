import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Navigation } from "./Navigation";
import { PageFade, MotionCard } from "./MotionCard";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { SkeletonStatGrid, SkeletonCard } from "./Skeleton";
import {
  Edit3, Check,
  Flame, Medal, Trophy,
  Zap, BookOpen, Target,
  Bell, Wifi, User,
  Star, LogOut,
} from "lucide-react";

const GREEN = "#1F4E3D";

const BADGES = [
  { icon: Flame,    label: "5-Day Streak", color: "#DC2626" },
  { icon: Zap,      label: "Speed Demon",  color: "#D97706" },
  { icon: BookOpen, label: "50 Sessions",  color: "#4F46E5" },
  { icon: Target,   label: "90% Scorer",   color: "#059669" },
  { icon: Trophy,   label: "Top 5 Rank",   color: "#B45309" },
  { icon: Star,     label: "Perfect Score",color: "#7C3AED" },
];

export function Profile() {
  const navigate = useNavigate();
  const { stats } = useUser();
  const { signOut } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setPageLoading(false), 400); return () => clearTimeout(t); }, []);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState<string>(
    () => localStorage.getItem("mssn_user_name") || "Student"
  );
  const [nickname, setNickname] = useState<string>(() => {
    const saved = localStorage.getItem("mssn_user_nickname");
    if (saved) return saved;
    const n = localStorage.getItem("mssn_user_name") || "Student";
    return n.replace(/\s+/g, "").slice(0, 12);
  });
  const [editNick, setEditNick] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [offline, setOffline] = useState(false);

  const earnedBadges = [
    stats.streak >= 5,
    stats.sessions > 0 && (stats.avgScore / stats.sessions) > 0,
    stats.sessions >= 50,
    stats.bestScore >= 90,
    false,
    stats.bestScore >= 100,
  ];

  return (
    <PageFade>
      <div
        className="lg:pl-64 min-h-screen overflow-x-hidden"
        style={{ background: "#F5F0E6", fontFamily: "'Manrope', sans-serif" }}
      >
        <Navigation />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-28 lg:pb-10">

          {/* Skeleton */}
          {pageLoading && (
            <div className="space-y-4">
              <SkeletonCard height={160} />
              <SkeletonStatGrid count={3} />
              <SkeletonCard height={80} />
              <SkeletonCard height={160} />
              <SkeletonCard height={200} />
            </div>
          )}

          {!pageLoading && <>
          {/* Avatar card */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl p-7 mb-4 text-center relative overflow-hidden"
            style={{ background: GREEN }}
          >
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="geo-p" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <polygon points="30,4 56,18 56,42 30,56 4,42 4,18" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#geo-p)" />
            </svg>
            <div className="relative z-10">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)" }}
              >
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "30px", color: "white" }}>
                  {name.trim().charAt(0).toUpperCase() || "S"}
                </span>
              </motion.div>

              {editName ? (
                <div className="flex items-center gap-2 justify-center mb-1">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-b border-white text-white text-center outline-none text-lg font-bold"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    autoFocus
                  />
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
                    const trimmed = name.trim() || "Student";
                    setName(trimmed);
                    localStorage.setItem("mssn_user_name", trimmed);
                    setEditName(false);
                  }}>
                    <Check size={16} color="white" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center mb-1">
                  <h1 style={{ fontFamily: "'Poppins', sans-serif", color: "white", fontWeight: 900, fontSize: "20px" }}>
                    {name}
                  </h1>
                  <motion.button whileHover={{ scale: 1.2 }} onClick={() => setEditName(true)}>
                    <Edit3 size={14} color="rgba(255,255,255,0.6)" />
                  </motion.button>
                </div>
              )}
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}>Kwara State · UNILORIN Aspirant</p>
            </div>
          </motion.div>

          {/* Stats cards (from UserContext) */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: Flame,  label: stats.streak > 0 ? `${stats.streak} Days` : "—",       sublabel: "Streak",   color: "#DC2626" },
              { icon: Medal,  label: earnedBadges.filter(Boolean).length.toString(),         sublabel: "Badges",   color: "#D97706" },
              { icon: Trophy, label: stats.sessions > 0 ? `${stats.bestScore}%` : "—",      sublabel: "Best",     color: GREEN },
            ].map(({ icon: Icon, label, sublabel, color }) => (
              <div
                key={sublabel}
                className="rounded-2xl p-4 text-center"
                style={{ background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={17} style={{ color }} />
                </div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "17px", color: "#111" }}>{label}</p>
                <p style={{ fontSize: "11px", color: "#aaa" }}>{sublabel}</p>
              </div>
            ))}
          </div>

          {/* Sessions summary */}
          {stats.sessions > 0 && (
            <MotionCard style={{ background: "white", borderRadius: "24px", padding: "16px 20px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "20px", color: GREEN }}>{stats.sessions}</p>
                  <p style={{ fontSize: "11px", color: "#aaa" }}>Sessions</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "20px", color: "#D97706" }}>{stats.avgScore}%</p>
                  <p style={{ fontSize: "11px", color: "#aaa" }}>Avg Score</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "20px", color: "#4F46E5" }}>{stats.bestScore}%</p>
                  <p style={{ fontSize: "11px", color: "#aaa" }}>Best Score</p>
                </div>
              </div>
            </MotionCard>
          )}

          {/* Nickname */}
          <MotionCard style={{ background: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", marginBottom: "6px" }}>
              Leaderboard Identity
            </p>
            <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "12px" }}>
              Your nickname is shown publicly on the leaderboard
            </p>
            <div className="flex gap-3">
              {editNick ? (
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border-2 outline-none"
                  style={{ borderColor: GREEN, fontFamily: "'Manrope', sans-serif", fontSize: "14px" }}
                  autoFocus
                />
              ) : (
                <p className="flex-1 px-4 py-2.5 rounded-2xl font-bold" style={{ background: "#F3F4F6", color: "#374151", fontSize: "14px" }}>
                  @{nickname}
                </p>
              )}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (editNick) {
                    localStorage.setItem("mssn_user_nickname", nickname.trim());
                  }
                  setEditNick(!editNick);
                }}
                className="px-5 py-2.5 rounded-2xl font-bold text-sm"
                style={{ background: GREEN, color: "white", fontFamily: "'Manrope', sans-serif" }}
              >
                {editNick ? "Save" : "Edit"}
              </motion.button>
            </div>
          </MotionCard>

          {/* Badges */}
          <MotionCard style={{ background: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#D9770615" }}>
                <Medal size={15} style={{ color: "#D97706" }} strokeWidth={2.5} />
              </div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111" }}>Badges</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {BADGES.map(({ icon: Icon, label, color }, i) => {
                const earned = earnedBadges[i];
                return (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                    whileHover={earned ? { y: -4, scale: 1.05 } : {}}
                    className="rounded-2xl p-3 text-center"
                    style={{ background: earned ? `${color}12` : "#f8f8f8", opacity: earned ? 1 : 0.45 }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{ background: earned ? `${color}20` : "#eee" }}
                    >
                      <Icon size={18} style={{ color: earned ? color : "#bbb" }} strokeWidth={2} />
                    </div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: earned ? color : "#aaa" }}>{label}</p>
                  </motion.div>
                );
              })}
            </div>
          </MotionCard>

          {/* Settings */}
          <MotionCard style={{ background: "white", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", padding: "20px 20px 12px" }}>
              Settings
            </p>
            {[
              { icon: Bell, color: "#3B82F6", label: "Notifications", sub: "Daily reminders", value: notifications, toggle: () => setNotifications(!notifications) },
              { icon: Wifi, color: "#059669", label: "Offline Mode", sub: "Practice without internet", value: offline, toggle: () => setOffline(!offline) },
            ].map(({ icon: Icon, color, label, sub, value, toggle }) => (
              <div
                key={label}
                className="flex items-center justify-between px-5 py-4"
                style={{ borderTop: "1px solid #F3F4F6" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                    <Icon size={17} style={{ color }} strokeWidth={2} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#111", fontSize: "14px" }}>{label}</p>
                    <p style={{ fontSize: "11px", color: "#aaa" }}>{sub}</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggle}
                  style={{ background: value ? GREEN : "#E5E7EB", width: "48px", height: "26px", borderRadius: "999px", position: "relative" }}
                >
                  <motion.div
                    animate={{ x: value ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{ position: "absolute", top: "4px", width: "18px", height: "18px", borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
                  />
                </motion.button>
              </div>
            ))}
          </MotionCard>

          <div className="mt-4 space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/home")}
              className="w-full py-3 rounded-2xl text-sm font-bold"
              style={{ background: "white", color: "#888", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
            >
              ← Back to Dashboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 4px 16px rgba(220,38,38,0.15)" }}
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: "#FEF2F2", color: "#DC2626", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
            >
              <LogOut size={16} />
              Log Out
            </motion.button>
          </div>
          </>}
        </div>
      </div>
    </PageFade>
  );
}
