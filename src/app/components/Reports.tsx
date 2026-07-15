import { motion } from "motion/react";
import { Navigation } from "./Navigation";
import { PageFade, MotionCard, fadeUp, stagger } from "./MotionCard";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { useUser } from "../context/UserContext";
import {
  ClipboardList, Award, Star, Flame,
  BookOpen, Calculator, Globe, Lightbulb, TrendingUp, Target,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SkeletonStatGrid, SkeletonChart, SkeletonCard } from "./Skeleton";

const GREEN = "#1F4E3D";

const SUBJECT_META: Record<string, { icon: typeof BookOpen; color: string; label: string }> = {
  "English":           { icon: BookOpen,   color: "#4F46E5", label: "English" },
  "Mathematics":       { icon: Calculator,  color: "#D97706", label: "Mathematics" },
  "Current Affairs":   { icon: Globe,       color: "#059669", label: "Current Affairs" },
  "General Knowledge": { icon: Lightbulb,   color: "#DC2626", label: "General Knowledge" },
};

const ALL_SUBJECTS = ["English", "Mathematics", "Current Affairs", "General Knowledge"];

export function Reports() {
  const { stats } = useUser();
  const hasData = stats.sessions > 0;
  const [pageLoading, setPageLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setPageLoading(false), 500); return () => clearTimeout(t); }, []);

  // ── Score trend chart ────────────────────────────────────────────────────────
  const scoreData = hasData ? stats.scoreHistory : [];

  // ── Compute per-subject performance from session history ─────────────────────
  // Each session record may carry a subjectBreakdown (added by ResultsScreen)
  const subjectAccum: Record<string, { correct: number; total: number }> = {};
  for (const rec of stats.history) {
    // Use stored breakdown if available (mock exams)
    const bd = (rec as { subjectBreakdown?: Record<string, { correct: number; total: number }> }).subjectBreakdown;
    if (bd) {
      for (const [subj, { correct, total }] of Object.entries(bd)) {
        if (!subjectAccum[subj]) subjectAccum[subj] = { correct: 0, total: 0 };
        subjectAccum[subj].correct += correct;
        subjectAccum[subj].total += total;
      }
    } else if (rec.subject) {
      if (!subjectAccum[rec.subject]) subjectAccum[rec.subject] = { correct: 0, total: 0 };
      subjectAccum[rec.subject].correct += rec.score;
      subjectAccum[rec.subject].total += rec.total;
    }
  }

  // ── Radar data ───────────────────────────────────────────────────────────────
  const radarData = ALL_SUBJECTS.map((subject) => {
    const acc = subjectAccum[subject];
    const score = acc && acc.total > 0 ? Math.round((acc.correct / acc.total) * 100) : 0;
    // Keep the full subject name as the data key so recharts generates unique SVG element keys.
    // The PolarAngleAxis tickFormatter handles abbreviated display.
    return { subject, score, fullMark: 100 };
  });

  // ── Coverage (% of total questions answered per subject) ─────────────────────
  const coverageData = ALL_SUBJECTS.map((subject) => {
    const acc = subjectAccum[subject];
    const attempted = acc ? acc.total : 0;
    const avgScore = acc && acc.total > 0 ? Math.round((acc.correct / acc.total) * 100) : 0;
    return { subject, attempted, avgScore, ...SUBJECT_META[subject] };
  });

  const statCards = [
    { icon: ClipboardList, label: stats.sessions.toString(),                    sublabel: "Sessions",   color: GREEN },
    { icon: Award,         label: hasData ? `${stats.bestScore}%` : "—",        sublabel: "Best Score", color: "#4F46E5" },
    { icon: Star,          label: hasData ? `${stats.avgScore}%` : "—",         sublabel: "Avg Score",  color: "#D97706" },
    { icon: Flame,         label: stats.streak > 0 ? `${stats.streak}d` : "—", sublabel: "Streak",     color: "#DC2626" },
  ];

  return (
    <PageFade>
      <div className="lg:pl-64 min-h-screen overflow-x-hidden" style={{ background: "#F5F0E6", fontFamily: "'Manrope', sans-serif" }}>
        <Navigation />

        <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-28 lg:pb-10" aria-label="Your performance reports">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="mb-6">
            <motion.h1 variants={fadeUp} style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "28px", color: "#111" }}>
              Your Reports
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} style={{ color: "#6B7280", fontSize: "14px" }}>
              {hasData
                ? `${stats.sessions} session${stats.sessions === 1 ? "" : "s"} completed · updates after every exam`
                : "Complete your first exam to see your stats here"}
            </motion.p>
          </motion.div>

          {/* Skeleton */}
          {pageLoading && (
            <div className="space-y-4">
              <SkeletonStatGrid count={4} />
              <SkeletonChart height={200} />
              <SkeletonChart height={230} />
              <SkeletonCard height={240} />
            </div>
          )}

          {/* Stat cards */}
          {!pageLoading && (
          <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {statCards.map(({ icon: Icon, label, sublabel, color }, i) => (
              <motion.div key={sublabel}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-4 flex flex-col items-center text-center"
                style={{ background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "20px", color: "#111" }}>{label}</p>
                <p style={{ fontSize: "11px", color: "#aaa" }}>{sublabel}</p>
              </motion.div>
            ))}
          </div>

          {/* Score Trend */}
          <MotionCard style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${GREEN}12` }}>
                <TrendingUp size={16} style={{ color: GREEN }} strokeWidth={2.5} />
              </div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", fontSize: "16px" }}>Score Trend</p>
            </div>
            {scoreData.length === 0 ? (
              <div className="text-center py-10" style={{ color: "#ccc" }}>
                <TrendingUp size={36} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p style={{ fontSize: "13px" }}>No data yet — complete an exam!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={scoreData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickFormatter={(val: string) => val.replace(/ #\d+$/, "")} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", fontFamily: "'Manrope', sans-serif" }}
                    formatter={(v: number) => [`${v}%`, "Score"]}
                    labelFormatter={(label: string) => label.replace(/ #\d+$/, "")}
                  />
                  <Line name="Score Trend" type="monotone" dataKey="score" stroke={GREEN} strokeWidth={3} dot={{ fill: GREEN, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </MotionCard>

          {/* Subject Strengths Radar */}
          <MotionCard style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#4F46E512" }}>
                <Target size={16} style={{ color: "#4F46E5" }} strokeWidth={2.5} />
              </div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", fontSize: "16px" }}>Subject Strengths</p>
            </div>
            {!hasData && (
              <p style={{ fontSize: "12px", color: "#bbb", marginBottom: "8px", paddingLeft: "4px" }}>
                Will populate after your first exam
              </p>
            )}
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#F3F4F6" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickFormatter={(val: string) => val.split(" ")[0]} />
                <Radar name="Subject Score" dataKey="score" stroke={GREEN} fill={GREEN} fillOpacity={hasData ? 0.2 : 0.05} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </MotionCard>

          {/* Subject Performance (replaces static coverage) */}
          <MotionCard style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#D9770612" }}>
                <BookOpen size={16} style={{ color: "#D97706" }} strokeWidth={2.5} />
              </div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", fontSize: "16px" }}>Subject Performance</p>
            </div>

            {!hasData ? (
              <div className="text-center py-8" style={{ color: "#ccc" }}>
                <BookOpen size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                <p style={{ fontSize: "13px" }}>Take exams to see your subject breakdown</p>
              </div>
            ) : (
              <div className="space-y-5">
                {coverageData.map(({ subject, avgScore, attempted, icon: Icon, color }, i) => (
                  <motion.div key={subject}
                    initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
                          <Icon size={14} style={{ color }} strokeWidth={2.5} />
                        </div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>{subject}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {attempted > 0 && (
                          <span style={{ fontSize: "11px", color: "#aaa" }}>{attempted} Qs</span>
                        )}
                        <span style={{ fontSize: "14px", fontWeight: 900, color: attempted === 0 ? "#ccc" : avgScore >= 60 ? GREEN : "#DC2626" }}>
                          {attempted === 0 ? "—" : `${avgScore}%`}
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full" style={{ background: "#F3F4F6" }}>
                      {attempted > 0 && (
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${avgScore}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: i * 0.1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: avgScore >= 60 ? GREEN : "#DC2626" }}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
              className="mt-5 rounded-2xl p-4 text-center"
              style={{ background: `${GREEN}08` }}
            >
              <p style={{ fontSize: "13px", color: GREEN, opacity: 0.7 }}>
                {hasData ? "Data updates automatically after every exam" : "Complete more sessions to build your performance history"}
              </p>
            </motion.div>
          </MotionCard>
          </>
          )}
        </main>
      </div>
    </PageFade>
  );
}
