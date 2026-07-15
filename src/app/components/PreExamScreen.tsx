import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import {
  Clock, FileQuestion, BookOpen, Wifi, AlertCircle, ChevronLeft, Zap,
  PhoneOff, Target, Flag,
} from "lucide-react";
import { PageFade, MotionCard, fadeUp, stagger } from "./MotionCard";
import type { Subject, Difficulty } from "../data/sampleData";
import { getExamQuestions } from "../utils/questionStore";

const ORANGE = "#F97316";
const NAVY = "#0F172A";

interface PreExamState {
  mode: "mock" | "practice";
  subject?: Subject;
  difficulty?: Difficulty | "All";
}

export function PreExamScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as PreExamState) ?? { mode: "mock" };
  const { mode, subject, difficulty } = state;
  const isMock = mode === "mock";

  const allQs = getExamQuestions();
  const noQuestionsUploaded = allQs.length === 0;
  const filteredQs = (() => {
    let qs = allQs;
    if (!isMock && subject) qs = qs.filter((q) => q.subject === subject);
    if (difficulty && difficulty !== "All") qs = qs.filter((q) => q.difficulty === difficulty);
    if (qs.length === 0) qs = allQs;
    return qs;
  })();
  const questionCount = isMock
    ? Math.min(50, filteredQs.length)
    : Math.min(20, filteredQs.length);

  const infoCards = [
    { icon: FileQuestion, label: "Questions", value: String(questionCount), color: "#4F46E5" },
    { icon: Clock, label: "Time Limit", value: isMock ? "30 min" : "No limit", color: ORANGE },
    { icon: BookOpen, label: "Subjects", value: isMock ? "All 4" : subject ?? "All", color: "#D97706" },
  ];

  const instructions = [
    { icon: PhoneOff, color: "#D97706", text: "Put away distractions. This is your exam time." },
    { icon: Wifi, color: "#3B82F6", text: "Ensure a stable internet connection before starting." },
    { icon: Clock, color: ORANGE, text: isMock ? "Timer begins immediately — manage your time wisely." : "Practice mode is untimed — no pressure!" },
    { icon: Flag, color: "#DC2626", text: "Flag questions to revisit before final submission." },
  ];

  return (
    <PageFade>
      <div
        className="min-h-screen flex items-center justify-center px-4 py-10"
        style={{ background: "#F5F0E6", fontFamily: "'Manrope', sans-serif" }}
      >
        <div className="w-full max-w-lg">
          {/* Back */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6"
            style={{ color: ORANGE, fontWeight: 700, fontSize: "14px" }}
          >
            <ChevronLeft size={18} /> Back
          </motion.button>

          {/* Header card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl p-7 mb-4 relative overflow-hidden"
            style={{ background: NAVY }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: "rgba(249,115,22,0.1)" }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "rgba(20,184,166,0.06)" }} />

            <div className="relative z-10">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: `${ORANGE}25`, border: `1px solid ${ORANGE}40` }}
              >
                {isMock ? (
                  <Target size={28} style={{ color: ORANGE }} strokeWidth={2} />
                ) : (
                  <BookOpen size={28} style={{ color: ORANGE }} strokeWidth={2} />
                )}
              </motion.div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {isMock ? "Full Mock Exam" : "Topic Practice"}
              </p>
              <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "26px", color: "white", marginTop: "4px" }}>
                {isMock ? "Post-UTME Mock" : `${subject} Practice`}
              </h1>
              {!isMock && difficulty && difficulty !== "All" && (
                <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: `${ORANGE}20`, color: ORANGE, border: `1px solid ${ORANGE}30` }}>
                  {difficulty} Level
                </span>
              )}
            </div>
          </motion.div>

          {/* Info cards */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-3 gap-3 mb-4">
            {infoCards.map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-2xl p-4 text-center"
                style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={20} style={{ color }} strokeWidth={2} />
                </div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "14px", color: NAVY }}>{value}</p>
                <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Instructions */}
          <MotionCard style={{ background: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: NAVY, marginBottom: "14px" }}>
              Before you begin
            </p>
            <div className="space-y-3">
              {instructions.map(({ icon: Icon, color, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15` }}
                  >
                    <Icon size={17} style={{ color }} strokeWidth={2} />
                  </div>
                  <p style={{ color: "#6B7280", fontSize: "13px", lineHeight: 1.55 }}>{text}</p>
                </motion.div>
              ))}
            </div>
          </MotionCard>

          {/* Bismillah */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl p-4 mb-5 text-center"
            style={{ background: `${ORANGE}08`, border: `1px solid ${ORANGE}20` }}
          >
            <p style={{ fontFamily: "'Poppins', sans-serif", color: ORANGE, fontWeight: 700, fontSize: "18px" }}>
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
            <p style={{ color: "#9CA3AF", fontSize: "12px", marginTop: "4px" }}>
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          </motion.div>

          {/* No questions warning */}
          {noQuestionsUploaded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 }}
              className="rounded-2xl p-4 mb-4 flex items-start gap-3"
              style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}
            >
              <AlertCircle size={18} style={{ color: "#DC2626", flexShrink: 0, marginTop: "1px" }} />
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#DC2626", fontSize: "13px" }}>
                  No questions available
                </p>
                <p style={{ color: "#DC2626", fontSize: "12px", marginTop: "2px", opacity: 0.8 }}>
                  An admin must upload questions before you can start an exam.
                </p>
              </div>
            </motion.div>
          )}

          {/* Start button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={!noQuestionsUploaded ? { scale: 1.03, boxShadow: "0 16px 40px rgba(249,115,22,0.35)" } : {}}
            whileTap={!noQuestionsUploaded ? { scale: 0.97 } : {}}
            onClick={() => !noQuestionsUploaded && navigate("/exam", { state })}
            className="w-full rounded-full flex items-center justify-center gap-3"
            style={{
              background: noQuestionsUploaded ? "#E5E7EB" : ORANGE,
              color: noQuestionsUploaded ? "#9CA3AF" : "white",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 900,
              fontSize: "16px",
              boxShadow: noQuestionsUploaded ? "none" : "0 8px 28px rgba(249,115,22,0.35)",
              padding: "18px",
              cursor: noQuestionsUploaded ? "not-allowed" : "pointer",
            }}
          >
            <Zap size={20} fill={noQuestionsUploaded ? "#9CA3AF" : "white"} />
            {noQuestionsUploaded ? "No Questions Uploaded" : `Start ${isMock ? "Exam" : "Practice"} Now`}
          </motion.button>
        </div>
      </div>
    </PageFade>
  );
}
