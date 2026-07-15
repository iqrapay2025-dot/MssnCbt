import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Navigation } from "./Navigation";
import { PageFade, MotionCard, fadeUp, stagger } from "./MotionCard";
import { ChevronDown } from "lucide-react";
import { SUBJECT_TOPICS, type Subject, type Difficulty } from "../data/sampleData";
import { getExamQuestions } from "../utils/questionStore";

const ORANGE = "#F97316";
const NAVY = "#0F172A";
const GREEN = "#1F4E3D";

const SUBJECT_META: Record<Subject, { emoji: string; color: string; bg: string }> = {
  English: { emoji: "📖", color: "#4F46E5", bg: "#EEF2FF" },
  Mathematics: { emoji: "📐", color: "#D97706", bg: "#FFFBEB" },
  "Current Affairs": { emoji: "🌍", color: "#059669", bg: "#ECFDF5" },
  "General Knowledge": { emoji: "💡", color: "#DC2626", bg: "#FEF2F2" },
};

const SUBJECTS: Subject[] = ["English", "Mathematics", "Current Affairs", "General Knowledge"];
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export function PracticeSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultSubject = (location.state as { subject?: Subject })?.subject;

  const [expanded, setExpanded] = useState<Subject | null>(defaultSubject ?? null);
  const [difficulty, setDifficulty] = useState<Difficulty | "All">("All");

  // Live question bank — re-reads when admin uploads new questions
  const [allQs, setAllQs] = useState(() => getExamQuestions());

  useEffect(() => {
    const refresh = () => setAllQs(getExamQuestions());
    window.addEventListener("mssn-questions-updated", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("mssn-questions-updated", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const totalQs = allQs.length;

  const subjectCount: Record<string, number> = {};
  const topicCount: Record<string, Record<string, number>> = {};
  for (const q of allQs) {
    subjectCount[q.subject] = (subjectCount[q.subject] ?? 0) + 1;
    if (!topicCount[q.subject]) topicCount[q.subject] = {};
    topicCount[q.subject][q.topic] = (topicCount[q.subject][q.topic] ?? 0) + 1;
  }

  const subjectPct = (subject: Subject) =>
    totalQs > 0 ? Math.round((subjectCount[subject] ?? 0) / totalQs * 100) : 0;

  // Returns topics for a subject: hardcoded list merged with any topics from uploaded questions
  const getTopicsForSubject = (subject: Subject): string[] => {
    const hardcoded = (SUBJECT_TOPICS[subject] ?? []).map((t) => t.name);
    const uploaded = Object.keys(topicCount[subject] ?? {});
    const merged = Array.from(new Set([...hardcoded, ...uploaded]));
    return merged;
  };

  const topicPct = (subject: Subject, topic: string) => {
    const inSubject = subjectCount[subject] ?? 0;
    if (inSubject === 0) return 0;
    return Math.round((topicCount[subject]?.[topic] ?? 0) / inSubject * 100);
  };

  return (
    <PageFade>
      <div className="lg:pl-64 min-h-screen" style={{ background: "#F5F0E6", fontFamily: "'Manrope', sans-serif" }}>
        <Navigation />
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}

        <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-28 lg:pb-10" aria-label="Practice by Topic">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="mb-6">
            <motion.h1
              variants={fadeUp}
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "28px", color: NAVY }}
            >
              Practice by Topic 📚
            </motion.h1>
            <motion.p variants={fadeUp} custom={1} style={{ color: "#888", fontSize: "14px", marginTop: "4px" }}>
              {totalQs > 0
                ? `${totalQs} questions uploaded · choose a subject to drill`
                : "No questions uploaded yet — ask your admin to upload questions"}
            </motion.p>
          </motion.div>

          {/* Difficulty pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {(["All", ...DIFFICULTIES] as const).map((d) => (
              <motion.button
                key={d}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDifficulty(d)}
                className="px-5 py-2 rounded-full border-2 text-sm font-bold transition-all"
                style={{
                  background: difficulty === d ? ORANGE : "white",
                  color: difficulty === d ? "white" : "#6B7280",
                  borderColor: difficulty === d ? ORANGE : "#E5E7EB",
                  boxShadow: difficulty === d ? "0 4px 16px rgba(249,115,22,0.25)" : "none",
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                {d === "Easy" ? "🟢 Easy" : d === "Medium" ? "🟡 Medium" : d === "Hard" ? "🔴 Hard" : "✨ All"}
              </motion.button>
            ))}
          </motion.div>

          {/* Subject Cards */}
          <div className="space-y-4">
            {SUBJECTS.map((subject, si) => {
              const topics = getTopicsForSubject(subject);
              const { emoji, color, bg } = SUBJECT_META[subject];
              const isOpen = expanded === subject;
              const pct = subjectPct(subject);

              return (
                <MotionCard
                  key={subject}
                  delay={si}
                  style={{ background: "white", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                >
                  {/* Header row */}
                  <motion.button
                    whileHover={{ background: "#f9f9f9" }}
                    style={{ background: "#ffffff" }}
                    className="w-full flex items-center gap-4 p-5 text-left"
                    onClick={() => setExpanded(isOpen ? null : subject)}
                    aria-expanded={isOpen}
                    aria-controls={`topic-list-${subject.replace(/\s+/g, "-")}`}
                    aria-label={`${subject} — ${pct}% of questions. ${isOpen ? "Collapse" : "Expand"} topics.`}
                  >
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ background: bg }}
                    >
                      {emoji}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: "15px" }}>
                        {subject}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1 h-2 rounded-full" style={{ background: "#f0f0f0" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: si * 0.1, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: pct > 0 ? color : "#E5E7EB" }}
                          />
                        </div>
                        <span style={{ fontSize: "12px", color: pct > 0 ? color : "#ccc", fontWeight: 700, flexShrink: 0 }}>
                          {pct}%
                        </span>
                      </div>
                      {totalQs > 0 && (
                        <p style={{ fontSize: "11px", color: "#bbb", marginTop: "2px" }}>
                          {subjectCount[subject] ?? 0} of {totalQs} questions
                        </p>
                      )}
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={18} style={{ color: "#aaa" }} />
                    </motion.div>
                  </motion.button>

                  {/* Expanded topics */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: "hidden", borderTop: "1px solid #F3F4F6" }}
                      >
                        <div
                          id={`topic-list-${subject.replace(/\s+/g, "-")}`}
                          className="px-5 py-4 space-y-3"
                          role="region"
                          aria-label={`${subject} topics`}
                        >
                          {totalQs === 0 && (
                            <p style={{ fontSize: "13px", color: "#bbb", textAlign: "center", padding: "8px 0" }}>
                              No questions uploaded yet for this subject.
                            </p>
                          )}
                          {topics.map((name, ti) => {
                            const tp = topicPct(subject, name);
                            return (
                              <motion.div
                                key={name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ti * 0.05 }}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#333" }}>{name}</p>
                                  <span style={{ fontSize: "12px", color: tp > 0 ? color : "#ccc", fontWeight: 700 }}>
                                    {tp}%
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full" style={{ background: "#f0f0f0" }}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${tp}%` }}
                                    transition={{ duration: 0.6, delay: ti * 0.05, ease: "easeOut" }}
                                    className="h-full rounded-full"
                                    style={{ background: tp > 0 ? color : "#E5E7EB" }}
                                  />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>

                        <div className="px-5 pb-5">
                          <motion.button
                            whileHover={{ scale: totalQs > 0 ? 1.02 : 1, boxShadow: totalQs > 0 ? `0 8px 24px ${color}40` : "none" }}
                            whileTap={{ scale: totalQs > 0 ? 0.98 : 1 }}
                            onClick={() => totalQs > 0 && navigate("/pre-exam", { state: { mode: "practice", subject, difficulty } })}
                            className="w-full py-3.5 rounded-2xl font-bold text-sm"
                            style={{
                              background: totalQs > 0 ? color : "#E5E7EB",
                              color: totalQs > 0 ? "white" : "#9CA3AF",
                              fontFamily: "'Manrope', sans-serif",
                              boxShadow: totalQs > 0 ? `0 4px 14px ${color}35` : "none",
                              cursor: totalQs > 0 ? "pointer" : "not-allowed",
                            }}
                          >
                            {totalQs > 0 ? `Start ${subject} Practice →` : "No questions available"}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </MotionCard>
              );
            })}
          </div>

          {/* Full mock CTA */}
          <MotionCard
            delay={4}
            onClick={() => navigate("/pre-exam", { state: { mode: "mock" } })}
            style={{ background: NAVY, borderRadius: "24px", padding: "24px", marginTop: "24px", boxShadow: "0 8px 32px rgba(15,23,42,0.25)", cursor: "pointer" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <motion.span style={{ fontSize: "32px" }} animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>🎯</motion.span>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "white", fontSize: "16px", marginTop: "8px" }}>
                  Full Mock Exam
                </p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
                  {totalQs > 0 ? `${Math.min(50, totalQs)} questions · All subjects · 30 min` : "Upload questions to unlock"}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <span style={{ color: "white", fontSize: "20px", fontWeight: 800 }}>→</span>
              </div>
            </div>
          </MotionCard>
        </main>
      </div>
    </PageFade>
  );
}
