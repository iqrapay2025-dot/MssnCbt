import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Flag, ChevronLeft, ChevronRight, AlertTriangle, Grid3X3, X, TriangleAlert } from "lucide-react";
import { type Question, type Subject, type Difficulty } from "../data/sampleData";
import { getExamQuestions } from "../utils/questionStore";

const ORANGE = "#F97316";
const NAVY = "#0F172A";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface ExamState {
  mode: "mock" | "practice";
  subject?: Subject;
  difficulty?: Difficulty | "All";
}

function SubmitModal({ unanswered, onSubmit, onClose }: { unanswered: number; onSubmit: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: "48px", textAlign: "center", marginBottom: "12px" }}
        >
          {unanswered > 0 ? "⚠️" : "✅"}
        </motion.div>
        <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, textAlign: "center", fontSize: "20px", color: NAVY }}>
          Submit Exam?
        </h3>
        <p style={{ color: "#6B7280", fontSize: "14px", textAlign: "center", marginTop: "8px", lineHeight: 1.6 }}>
          {unanswered > 0
            ? <><strong style={{ color: "#D97706" }}>{unanswered} question{unanswered !== 1 ? "s" : ""} unanswered</strong> — they'll be marked wrong.</>
            : "All questions answered. Ready to submit?"}
        </p>
        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full border-2 font-bold text-sm"
            style={{ borderColor: "#E5E7EB", color: "#6B7280", fontFamily: "'Manrope', sans-serif" }}
          >
            Go Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onSubmit}
            className="flex-1 py-3.5 rounded-full font-bold text-sm"
            style={{ background: ORANGE, color: "white", fontFamily: "'Manrope', sans-serif", boxShadow: "0 4px 16px rgba(249,115,22,0.3)" }}
          >
            Submit
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ExamScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ExamState) ?? { mode: "mock" };
  const { mode, subject, difficulty } = state;
  const isMock = mode === "mock";

  // Questions are generated ONCE on mount and locked for the entire session.
  // sessionStorage persists the set across page refreshes within the same attempt.
  const SESSION_KEY = "mssn_exam_session";
  const [questions] = useState<Question[]>(() => {
    // Try to restore a persisted session for the same exam config
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          questions: Question[];
          mode: string;
          subject?: string;
          difficulty?: string;
        };
        if (saved.mode === mode && saved.subject === (subject ?? "") && saved.difficulty === (difficulty ?? "All")) {
          return saved.questions;
        }
      }
    } catch {}

    // Generate a fresh random set
    const allQs = getExamQuestions();
    if (allQs.length === 0) return [];
    let qs = allQs;
    if (!isMock && subject) qs = qs.filter((q) => q.subject === subject);
    if (difficulty && difficulty !== "All") qs = qs.filter((q) => q.difficulty === difficulty);
    if (qs.length === 0) qs = allQs;
    const shuffled = shuffle(qs);
    const result = isMock
      ? shuffled.slice(0, Math.min(50, shuffled.length))
      : shuffled.slice(0, Math.min(20, shuffled.length));

    // Persist so refreshes keep the same set
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ questions: result, mode, subject: subject ?? "", difficulty: difficulty ?? "All" })
      );
    } catch {}

    return result;
  });

  const [timeLeft, setTimeLeft] = useState(isMock ? 30 * 60 : 0);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [flagged, setFlagged] = useState<boolean[]>(Array(questions.length).fill(false));
  const [showGrid, setShowGrid] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedAnim, setSelectedAnim] = useState<number | null>(null);
  const elapsedRef = useRef(0);

  const handleSubmit = useCallback(() => {
    // Clear the persisted session so the next attempt gets a fresh shuffle
    try { sessionStorage.removeItem("mssn_exam_session"); } catch {}
    const results = questions.map((q, i) => ({
      question: q,
      selectedIndex: answers[i],
      correct: answers[i] === q.correctIndex,
    }));
    navigate("/results", {
      state: { results, score: results.filter((r) => r.correct).length, total: questions.length, timeUsed: elapsedRef.current, mode, subject },
    });
  }, [questions, answers, navigate, mode, subject]);

  useEffect(() => {
    const interval = setInterval(() => {
      elapsedRef.current += 1;
      if (isMock) setTimeLeft((t) => { if (t <= 1) { handleSubmit(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [isMock, handleSubmit]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const timerColor = isMock
    ? timeLeft <= 60 ? "#DC2626" : timeLeft <= 300 ? "#D97706" : ORANGE
    : ORANGE;

  // Guard: no questions uploaded yet
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#F5F0E6", fontFamily: "'Manrope', sans-serif" }}>
        <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#FEF2F2" }}>
            <AlertTriangle size={32} style={{ color: "#DC2626" }} />
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: "#111", fontSize: "20px", marginBottom: "8px" }}>
            No Questions Available
          </h2>
          <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
            An admin needs to upload questions before you can take an exam.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/home")}
            className="w-full py-3.5 rounded-full font-bold text-sm"
            style={{ background: NAVY, color: "white", fontFamily: "'Manrope', sans-serif" }}
          >
            ← Back to Home
          </motion.button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const unanswered = answers.filter((a) => a === null).length;

  const selectAnswer = (idx: number) => {
    setSelectedAnim(idx);
    setTimeout(() => setSelectedAnim(null), 300);
    const updated = [...answers];
    updated[current] = idx;
    setAnswers(updated);
  };

  const navigatorGrid = (
    <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(36px, 1fr))" }}>
      {questions.map((_, i) => {
        const answered = answers[i] !== null;
        const isFlagged = flagged[i];
        const isActive = i === current;
        return (
          <motion.button
            key={i}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setCurrent(i); setShowGrid(false); }}
            className="w-9 h-9 rounded-xl text-xs font-bold transition-all"
            style={{
              background: isActive ? ORANGE : answered ? `${ORANGE}88` : "#F3F4F6",
              color: isActive || answered ? "white" : "#6B7280",
              border: isFlagged ? "2px solid #DC2626" : "2px solid transparent",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {i + 1}
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F0E6", fontFamily: "'Manrope', sans-serif" }}>
      {/* Top Bar */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #F0F0F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        {/* Logo + Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: NAVY }}>
              <span style={{ color: "white", fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "13px" }}>M</span>
            </div>
            <span className="hidden sm:block" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "13px", color: NAVY }}>
              MSSN<span style={{ color: ORANGE }}>CBT</span>
            </span>
          </div>

          <motion.div
            animate={isMock && timeLeft <= 60 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: `${timerColor}12`, border: `1.5px solid ${timerColor}35` }}
          >
            <motion.span
              style={{ fontSize: "16px" }}
              animate={isMock && timeLeft <= 300 ? { rotateZ: [0, -15, 15, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              ⏱️
            </motion.span>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: timerColor, fontSize: "17px" }}>
              {isMock ? fmt(timeLeft) : fmt(elapsedRef.current)}
            </span>
            {isMock && timeLeft <= 300 && (
              <div className="flex items-center gap-1">
                <TriangleAlert size={12} style={{ color: timerColor }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: timerColor }}>
                  {timeLeft <= 60 ? "Last min!" : "5 min"}
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Question counter + grid toggle */}
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: "15px" }}>
            {current + 1}<span style={{ color: "#9CA3AF" }}>/{questions.length}</span>
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowGrid(true)}
            className="lg:hidden p-2 rounded-xl"
            style={{ background: `${ORANGE}12` }}
          >
            <Grid3X3 size={18} style={{ color: ORANGE }} />
          </motion.button>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowSubmit(true)}
          className="px-5 py-2.5 rounded-full font-bold text-sm"
          style={{ background: ORANGE, color: "white", fontFamily: "'Manrope', sans-serif", boxShadow: "0 4px 12px rgba(249,115,22,0.2)" }}
        >
          Submit Exam
        </motion.button>
      </motion.header>

      {/* Progress bar */}
      <div className="h-1.5 w-full" style={{ background: "#F3F4F6" }}>
        <motion.div
          className="h-full rounded-r-full"
          style={{ background: ORANGE }}
          initial={{ width: "0%" }}
          animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Question Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* Subject & Difficulty tags */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: `${ORANGE}12`, color: ORANGE }}
                  >
                    {q.subject}
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.05 }}
                    className="px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      background: q.difficulty === "Easy" ? "#DCFCE7" : q.difficulty === "Medium" ? "#FEF9C3" : "#FEE2E2",
                      color: q.difficulty === "Easy" ? "#16A34A" : q.difficulty === "Medium" ? "#CA8A04" : "#DC2626",
                    }}
                  >
                    {q.difficulty}
                  </motion.span>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold hidden sm:inline" style={{ background: "#F3F4F6", color: "#9CA3AF" }}>
                    {q.topic}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { const f = [...flagged]; f[current] = !f[current]; setFlagged(f); }}
                    className="p-2 rounded-xl transition-all"
                    style={{ background: flagged[current] ? "#FEE2E2" : "white" }}
                  >
                    <Flag size={16} style={{ color: flagged[current] ? "#DC2626" : "#9CA3AF" }} fill={flagged[current] ? "#DC2626" : "none"} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    className="p-2 rounded-xl"
                    style={{ background: "white" }}
                  >
                    <AlertTriangle size={16} style={{ color: "#9CA3AF" }} />
                  </motion.button>
                </div>
              </div>

              {/* Question card */}
              <motion.div
                className="rounded-3xl p-6 sm:p-8 mb-5"
                style={{ background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
              >
                <p style={{ fontSize: "11px", fontWeight: 800, color: ORANGE, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "12px" }}>
                  Question {current + 1} of {questions.length}
                </p>
                <p style={{ fontSize: "17px", fontWeight: 700, color: NAVY, lineHeight: 1.65 }}>
                  {q.question}
                </p>
              </motion.div>

              {/* Answer options */}
              <div className="space-y-3">
                {q.options.map((option, idx) => {
                  const selected = answers[current] === idx;
                  const isAnimating = selectedAnim === idx;
                  return (
                    <motion.button
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, x: 16 },
                        visible: { opacity: 1, x: 0, transition: { delay: idx * 0.06, duration: 0.3 } },
                      }}
                      initial="hidden"
                      animate={isAnimating ? { scale: [1, 0.97, 1.02, 1] } : "visible"}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => selectAnswer(idx)}
                      className="w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all"
                      style={{
                        borderColor: selected ? ORANGE : "transparent",
                        background: selected ? `${ORANGE}08` : "white",
                        boxShadow: selected ? `0 4px 20px ${ORANGE}18` : "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <motion.div
                        animate={selected ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : {}}
                        transition={{ duration: 0.3 }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: selected ? ORANGE : "#F3F4F6",
                          color: selected ? "white" : "#9CA3AF",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: 800,
                          fontSize: "13px",
                        }}
                      >
                        {["A", "B", "C", "D"][idx]}
                      </motion.div>
                      <span style={{ fontSize: "15px", color: selected ? NAVY : "#374151", fontWeight: selected ? 700 : 500, lineHeight: 1.5 }}>
                        {option}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <motion.button
              whileHover={{ scale: 1.04, x: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-full border-2 font-bold text-sm disabled:opacity-30"
              style={{ borderColor: "#E5E7EB", color: "#6B7280", background: "white", fontFamily: "'Manrope', sans-serif" }}
            >
              <ChevronLeft size={16} /> Previous
            </motion.button>

            {current < questions.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.04, x: 2, boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCurrent((c) => c + 1)}
                className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm"
                style={{ background: ORANGE, color: "white", fontFamily: "'Manrope', sans-serif", boxShadow: "0 4px 14px rgba(249,115,22,0.25)" }}
              >
                Next <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(220,38,38,0.35)" }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowSubmit(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm"
                style={{ background: "#DC2626", color: "white", fontFamily: "'Manrope', sans-serif" }}
              >
                🏁 Submit Exam
              </motion.button>
            )}
          </div>
        </div>

        {/* Desktop Navigator */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl p-5 sticky top-24"
            style={{ background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, fontSize: "13px", marginBottom: "14px" }}>
              📍 Navigator
            </h3>
            {navigatorGrid}
            <div className="mt-4 space-y-1.5">
              {[
                { color: ORANGE, label: "Answered", border: "none" },
                { color: "#F3F4F6", label: "Unanswered", border: "1px solid #E5E7EB" },
                { color: "white", label: "Flagged", border: "2px solid #DC2626" },
              ].map(({ color, label, border }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-lg flex-shrink-0" style={{ background: color, border }} />
                  <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #F3F4F6" }}>
              <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>
                {unanswered} unanswered · {flagged.filter(Boolean).length} flagged
              </p>
            </div>
          </motion.div>
        </aside>
      </div>

      {/* Mobile Grid Drawer */}
      <AnimatePresence>
        {showGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-end"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto"
              style={{ background: "white" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY }}>
                  📍 Question Navigator
                </h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowGrid(false)}>
                  <X size={20} style={{ color: "#9CA3AF" }} />
                </motion.button>
              </div>
              {navigatorGrid}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmit && (
          <SubmitModal unanswered={unanswered} onSubmit={handleSubmit} onClose={() => setShowSubmit(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
