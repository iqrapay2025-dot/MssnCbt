import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { RotateCcw, Share2, ChevronRight } from "lucide-react";
import { PageFade, MotionCard, fadeUp, stagger } from "./MotionCard";
import { useUser } from "../context/UserContext";
import type { Question } from "../data/sampleData";

const GREEN = "#1F4E3D";

interface ResultItem {
  question: Question;
  selectedIndex: number | null;
  correct: boolean;
}
interface ResultsState {
  results: ResultItem[];
  score: number;
  total: number;
  timeUsed: number;
  mode: "mock" | "practice";
  subject?: string;
}

function AnimatedScoreCircle({ score, total }: { score: number; total: number }) {
  const pct = Math.round((score / total) * 100);
  const pass = pct >= 50;
  const radius = 56;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
        <circle cx="88" cy="88" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="14" />
        <motion.circle
          cx="88" cy="88" r={radius}
          fill="none"
          stroke={pass ? GREEN : "#DC2626"}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "36px", color: pass ? GREEN : "#DC2626" }}
        >
          {pct}%
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ fontSize: "12px", color: "#9CA3AF" }}
        >
          {score}/{total} correct
        </motion.p>
      </div>
    </div>
  );
}

export function ResultsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { recordSession } = useUser();
  const recorded = useRef(false);
  const state = location.state as ResultsState | null;

  useEffect(() => {
    if (!state) {
      navigate("/home");
      return;
    }
    if (!recorded.current) {
      recorded.current = true;
      // Compute per-subject breakdown so Reports can show real-time subject stats
      const breakdown: Record<string, { correct: number; total: number }> = {};
      state.results.forEach(({ question, correct }) => {
        if (!breakdown[question.subject]) breakdown[question.subject] = { correct: 0, total: 0 };
        breakdown[question.subject].total++;
        if (correct) breakdown[question.subject].correct++;
      });
      recordSession({
        score: state.score,
        total: state.total,
        timeUsed: state.timeUsed,
        mode: state.mode,
        subject: state.subject,
        subjectBreakdown: breakdown,
      });
    }
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F0E6" }}>
        <p style={{ color: "#aaa", fontFamily: "'Manrope', sans-serif" }}>Redirecting…</p>
      </div>
    );
  }

  const { results, score, total, timeUsed, mode } = state;
  const pct = Math.round((score / total) * 100);
  const pass = pct >= 50;
  const fastBonus = timeUsed < 20 * 60 && mode === "mock";

  const fmt = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  const bySubject: Record<string, { correct: number; total: number }> = {};
  results.forEach(({ question, correct }) => {
    if (!bySubject[question.subject]) bySubject[question.subject] = { correct: 0, total: 0 };
    bySubject[question.subject].total++;
    if (correct) bySubject[question.subject].correct++;
  });

  const headline = pct >= 80 ? "Outstanding! 🌟" : pct >= 65 ? "Well Done! 👏" : pct >= 50 ? "You Passed! 👍" : "Keep Going! 💪";

  return (
    <PageFade>
      <div
        className="min-h-screen flex flex-col items-center justify-start px-4 py-10 overflow-x-hidden"
        style={{ background: "#F5F0E6", fontFamily: "'Manrope', sans-serif" }}
      >
        <div className="w-full max-w-lg">
          {/* Hero result card */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl p-6 mb-4 text-center relative overflow-hidden"
            style={{ background: pass ? GREEN : "#DC2626" }}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full pointer-events-none"
              style={{ background: "rgba(255,255,255,0.05)" }} />

            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{ fontSize: "48px", marginBottom: "8px", position: "relative", zIndex: 1 }}
            >
              {pass ? "🏆" : "📚"}
            </motion.div>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: "white", fontSize: "24px", position: "relative", zIndex: 1 }}>
              {headline}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginTop: "6px", position: "relative", zIndex: 1 }}>
              {pass ? "You're on track for UNILORIN!" : "Review and try again — you've got this!"}
            </p>
          </motion.div>

          {/* Score circle */}
          <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
            <AnimatedScoreCircle score={score} total={total} />

            <div className="grid grid-cols-2 gap-3 mt-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                className="rounded-2xl p-3 text-center"
                style={{ background: "#F9FAFB" }}
              >
                <span style={{ fontSize: "22px" }}>⏱️</span>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: GREEN, marginTop: "4px" }}>{fmt(timeUsed)}</p>
                <p style={{ fontSize: "11px", color: "#9CA3AF" }}>Time Used</p>
              </motion.div>
              {fastBonus && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 }}
                  className="rounded-2xl p-3 text-center"
                  style={{ background: `${GREEN}10` }}
                >
                  <span style={{ fontSize: "22px" }}>⚡</span>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: GREEN, marginTop: "4px" }}>Bonus!</p>
                  <p style={{ fontSize: "11px", color: GREEN }}>Fast Answer</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Subject breakdown */}
          <MotionCard style={{ background: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: GREEN, marginBottom: "16px" }}>
              Subject Breakdown 📊
            </p>
            <div className="space-y-4">
              {Object.entries(bySubject).map(([subject, { correct, total: st }], i) => {
                const p = Math.round((correct / st) * 100);
                return (
                  <motion.div
                    key={subject}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex justify-between mb-1.5">
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>{subject}</p>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: p >= 50 ? GREEN : "#DC2626" }}>
                        {correct}/{st} · {p}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full" style={{ background: "#F3F4F6" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${p}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: p >= 50 ? GREEN : "#DC2626" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </MotionCard>

          {/* Actions */}
          <motion.div initial="hidden" whileInView="visible" variants={stagger} viewport={{ once: true }} className="space-y-3">
            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(31,78,61,0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/review", { state: { results } })}
              className="w-full py-4 rounded-full flex items-center justify-between px-5 font-bold"
              style={{ background: GREEN, color: "white", fontFamily: "'Manrope', sans-serif", boxShadow: "0 6px 20px rgba(31,78,61,0.25)" }}
            >
              <span>📝 Review Answers</span>
              <ChevronRight size={18} />
            </motion.button>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                variants={fadeUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/pre-exam", { state: { mode } })}
                className="py-3.5 rounded-full flex items-center justify-center gap-2 font-bold text-sm"
                style={{ background: "white", color: "#374151", fontFamily: "'Manrope', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
              >
                <RotateCcw size={16} /> Retry
              </motion.button>
              <motion.button
                variants={fadeUp}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => alert("Share feature: generates branded result card!")}
                className="py-3.5 rounded-full flex items-center justify-center gap-2 font-bold text-sm"
                style={{ background: "white", color: "#374151", fontFamily: "'Manrope', sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
              >
                <Share2 size={16} /> Share
              </motion.button>
            </div>

            <motion.button
              variants={fadeUp}
              onClick={() => navigate("/home")}
              className="w-full py-3 text-sm"
              style={{ color: "#9CA3AF" }}
            >
              ← Back to Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    </PageFade>
  );
}
