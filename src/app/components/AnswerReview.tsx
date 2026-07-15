import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, CheckCircle2, XCircle, Filter, ChevronDown, Sparkles } from "lucide-react";
import { PageFade, MotionCard } from "./MotionCard";
import { SkeletonCard, SkeletonLine } from "./Skeleton";
import { saveExplanationForQuestion } from "../utils/questionStore";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import type { Question } from "../data/sampleData";

const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-1943a64d`;

const ORANGE = "#F97316";
const GREEN = "#1F4E3D";
const NAVY = "#0F172A";


interface ResultItem {
  question: Question;
  selectedIndex: number | null;
  correct: boolean;
}

type ExplStatus = "loading" | "done" | "error";
interface ExplEntry {
  status: ExplStatus;
  text: string;
}

// ── Animated "AI thinking" dots ───────────────────────────────────────────────
function ThinkingDots() {
  return (
    <div className="flex items-center gap-2 py-1">
      <Sparkles size={13} style={{ color: ORANGE, opacity: 0.7 }} />
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
            style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: ORANGE }}
          />
        ))}
      </div>
      <span style={{ fontSize: "12px", color: ORANGE, fontWeight: 700 }}>Generating explanation…</span>
    </div>
  );
}

export function AnswerReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { results } = (location.state ?? { results: [] }) as { results: ResultItem[] };

  const [expanded, setExpanded] = useState<number | null>(null);
  const [filterWrong, setFilterWrong] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Per-question AI explanation cache: keyed by Question.id
  const [aiCache, setAiCache] = useState<Record<number, ExplEntry>>({});
  // Tracks in-flight requests so we never fire the same question twice
  const inFlightRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const displayed = filterWrong ? results.filter((r) => !r.correct) : results;

  // ── Fetch AI explanation for one question ──────────────────────────────────
  const fetchExplanation = useCallback(async (q: Question) => {
    if (inFlightRef.current.has(q.id)) return;
    inFlightRef.current.add(q.id);

    setAiCache((prev) => ({ ...prev, [q.id]: { status: "loading", text: "" } }));

    try {
      const res = await fetch(`${SERVER}/explain`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.log(`Explanation server error ${res.status}: ${errBody}`);
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const text: string = (data.explanation ?? "").trim();

      if (!text) throw new Error("Empty explanation returned");

      setAiCache((prev) => ({ ...prev, [q.id]: { status: "done", text } }));
      saveExplanationForQuestion(q.id, text);
    } catch (err) {
      console.log(`Failed to generate explanation for question ${q.id}:`, err);
      setAiCache((prev) => ({ ...prev, [q.id]: { status: "error", text: "" } }));
    } finally {
      // Always release the in-flight lock so retries are possible
      inFlightRef.current.delete(q.id);
    }
  }, []);

  // ── Trigger fetch when a card opens and has no stored explanation ──────────
  useEffect(() => {
    if (expanded === null) return;
    const item = displayed[expanded];
    if (!item) return;
    const q = item.question;

    // Already has a stored explanation — nothing to do
    if (q.explanation && q.explanation.trim()) return;
    // Already loading or successfully fetched — skip
    const cached = aiCache[q.id];
    if (cached?.status === "loading" || cached?.status === "done") return;
    // On error: clear cache so it retries fresh when user reopens
    if (cached?.status === "error") {
      setAiCache((prev) => { const next = { ...prev }; delete next[q.id]; return next; });
    }

    fetchExplanation(q);
  }, [expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helper: resolve what to show in the explanation box ───────────────────
  const resolveExplanation = (q: Question): ExplEntry & { source: "stored" | "ai" } => {
    if (q.explanation && q.explanation.trim()) {
      return { status: "done", text: q.explanation, source: "stored" };
    }
    const cached = aiCache[q.id];
    if (!cached) {
      // Not yet triggered (card not yet opened) — treat as pending
      return { status: "loading", text: "", source: "ai" };
    }
    return { ...cached, source: "ai" };
  };

  return (
    <PageFade>
      <div className="min-h-screen" style={{ background: "#F5F0E6", fontFamily: "'Manrope', sans-serif" }}>
        {/* Sticky header */}
        <div
          className="sticky top-0 z-20 px-4 sm:px-6 py-4"
          style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid #F0F0F0", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
        >
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                style={{ color: ORANGE }}
              >
                <ChevronLeft size={24} />
              </motion.button>
              <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: NAVY, fontSize: "18px" }}>
                Answer Review
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterWrong(!filterWrong)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-bold"
              style={{
                borderColor: filterWrong ? "#DC2626" : "#E5E7EB",
                color: filterWrong ? "#DC2626" : "#6B7280",
                background: filterWrong ? "#FEE2E2" : "white",
                fontFamily: "'Manrope', sans-serif",
              }}
            >
              <Filter size={13} />
              {filterWrong ? "❌ Wrong only" : "All"}
            </motion.button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {/* Page skeleton */}
          {pageLoading && (
            <div className="space-y-3">
              <div className="flex gap-3 mb-4">
                <SkeletonLine width={100} height={32} />
                <SkeletonLine width={100} height={32} />
                <SkeletonLine width={80} height={32} />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} height={64} />
              ))}
            </div>
          )}

          {/* Summary pills */}
          {!pageLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: `${ORANGE}12` }}>
                <CheckCircle2 size={15} style={{ color: ORANGE }} />
                <span style={{ fontWeight: 800, color: ORANGE, fontSize: "13px" }}>
                  {results.filter((r) => r.correct).length} Correct
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "#FEE2E2" }}>
                <XCircle size={15} style={{ color: "#DC2626" }} />
                <span style={{ fontWeight: 800, color: "#DC2626", fontSize: "13px" }}>
                  {results.filter((r) => !r.correct).length} Wrong
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{results.length} total questions</span>
              <div className="flex items-center gap-1.5 ml-auto">
                <Sparkles size={12} style={{ color: GREEN, opacity: 0.7 }} />
                <span style={{ fontSize: "11px", color: GREEN, fontWeight: 700, opacity: 0.7 }}>AI explanations</span>
              </div>
            </motion.div>
          )}

          {/* Question cards */}
          {!pageLoading && (
            <div className="space-y-3">
              {displayed.map((item, i) => {
                const { question: q, selectedIndex, correct } = item;
                const isOpen = expanded === i;
                const expl = resolveExplanation(q);

                return (
                  <MotionCard
                    key={i}
                    delay={Math.min(i, 5)}
                    style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                  >
                    {/* Row header */}
                    <motion.button
                      whileHover={{ background: "#f9f9f9" }}
                      style={{ background: "#ffffff" }}
                      className="w-full flex items-center gap-3 p-4 text-left"
                      onClick={() => setExpanded(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-label={`Question ${results.indexOf(item) + 1}: ${q.question.slice(0, 60)}. ${correct ? "Correct" : "Incorrect"}. ${isOpen ? "Collapse" : "Expand"} details.`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: correct ? `${ORANGE}12` : "#FEE2E2" }}
                      >
                        {correct
                          ? <CheckCircle2 size={16} style={{ color: ORANGE }} />
                          : <XCircle size={16} style={{ color: "#DC2626" }} />}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontSize: "13px", fontWeight: 700, color: NAVY }}>
                          Q{results.indexOf(item) + 1}. {q.question}
                        </p>
                        <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{q.subject} · {q.topic}</p>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={16} style={{ color: "#9CA3AF" }} />
                      </motion.div>
                    </motion.button>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          style={{ overflow: "hidden", borderTop: "1px solid #F3F4F6" }}
                        >
                          <div className="px-4 py-4">
                            <p style={{ fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "14px", lineHeight: 1.6 }}>
                              {q.question}
                            </p>

                            {/* Answer options */}
                            <div className="space-y-2 mb-4">
                              {q.options.map((opt, idx) => {
                                const isSelected = selectedIndex === idx;
                                const isCorrect = q.correctIndex === idx;
                                return (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2"
                                    style={{
                                      borderColor: isCorrect ? ORANGE : isSelected ? "#DC2626" : "#F3F4F6",
                                      background: isCorrect ? `${ORANGE}08` : isSelected ? "#FEE2E2" : "#FAFAFA",
                                    }}
                                  >
                                    <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "12px", color: isCorrect ? ORANGE : isSelected ? "#DC2626" : "#9CA3AF", minWidth: "18px" }}>
                                      {["A", "B", "C", "D"][idx]}
                                    </span>
                                    <span style={{ fontSize: "13px", color: isCorrect ? ORANGE : isSelected ? "#DC2626" : "#6B7280", fontWeight: isCorrect || isSelected ? 700 : 400 }}>
                                      {opt}
                                    </span>
                                    {isCorrect && <CheckCircle2 size={14} style={{ color: ORANGE, marginLeft: "auto" }} />}
                                    {isSelected && !isCorrect && <XCircle size={14} style={{ color: "#DC2626", marginLeft: "auto" }} />}
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Explanation box */}
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="rounded-2xl p-4"
                              style={{ background: `${ORANGE}08`, border: `1px solid ${ORANGE}20` }}
                            >
                              {/* Header */}
                              <div className="flex items-center gap-2 mb-2">
                                <p style={{ fontSize: "11px", fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                  💡 Explanation
                                </p>
                                {expl.source === "ai" && expl.status === "done" && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${GREEN}12`, fontSize: "9px", fontWeight: 800, color: GREEN }}>
                                    <Sparkles size={8} /> AI
                                  </span>
                                )}
                              </div>

                              {/* Content */}
                              {expl.status === "loading" && <ThinkingDots />}

                              {expl.status === "done" && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.4 }}
                                  style={{ fontSize: "13px", color: "#374141", lineHeight: 1.7 }}
                                >
                                  {expl.text}
                                </motion.p>
                              )}

                              {expl.status === "error" && (
                                <div className="flex items-center justify-between gap-2">
                                  <p style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: 1.6, fontStyle: "italic" }}>
                                    Could not generate explanation.
                                  </p>
                                  <button
                                    onClick={() => {
                                      setAiCache((prev) => { const next = { ...prev }; delete next[q.id]; return next; });
                                      fetchExplanation(q);
                                    }}
                                    style={{ fontSize: "11px", fontWeight: 800, color: ORANGE, whiteSpace: "nowrap", background: `${ORANGE}12`, border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "8px" }}
                                    aria-label="Retry generating explanation"
                                  >
                                    ↺ Retry
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </MotionCard>
                );
              })}

              {displayed.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ fontSize: "56px", marginBottom: "12px" }}
                  >
                    🎉
                  </motion.div>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: NAVY, fontSize: "20px" }}>
                    Perfect Score!
                  </p>
                  <p style={{ color: "#9CA3AF", fontSize: "14px", marginTop: "6px" }}>You got every question right!</p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageFade>
  );
}
