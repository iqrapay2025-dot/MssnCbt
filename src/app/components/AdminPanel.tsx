import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, FileQuestion, Flag, BarChart2, ChevronLeft, Search,
  Plus, Upload, ChevronDown, X, Lock, Shield, Download,
  CheckCircle2, AlertCircle, Trash2, Eye, EyeOff, Send, MessageSquare, Bell,
} from "lucide-react";
import { PageFade, MotionCard, fadeUp } from "./MotionCard";
import { loadAdminQuestions, saveAdminQuestions, deleteAdminQuestion, clearAdminQuestions, notifyQuestionsUpdated, type AdminQuestion } from "../utils/questionStore";
import { pushNotification } from "../utils/notificationStore";

const GREEN = "#1F4E3D";
const ADMIN_PIN = "admin1234";

type AdminTab = "overview" | "questions" | "add" | "flagged" | "users" | "broadcast";

const TABS: { id: AdminTab; label: string; emoji: string }[] = [
  { id: "overview",   label: "Overview",   emoji: "📊" },
  { id: "questions",  label: "Questions",  emoji: "📋" },
  { id: "add",        label: "Add Q",      emoji: "➕" },
  { id: "broadcast",  label: "Broadcast",  emoji: "📣" },
  { id: "flagged",    label: "Flagged",    emoji: "🚩" },
  { id: "users",      label: "Users",      emoji: "👥" },
];

// ── CSV column spec ───────────────────────────────────────────────────────────
// question, optionA, optionB, optionC, optionD, correct (A/B/C/D),
// subject, topic, difficulty (Easy/Medium/Hard), explanation
const CSV_TEMPLATE = [
  ["question", "optionA", "optionB", "optionC", "optionD", "correct", "subject", "topic", "difficulty", "explanation"],
  [
    "What is the synonym of BENEVOLENT?",
    "Cruel", "Kind", "Angry", "Sad",
    "B", "English", "Vocabulary", "Easy",
    "Benevolent means well-meaning and kindly.",
  ],
  [
    "Solve: 5x = 45",
    "5", "7", "9", "11",
    "C", "Mathematics", "Algebra", "Easy",
    "Divide both sides by 5: x = 45/5 = 9.",
  ],
].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");

interface ParsedQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  subject: string;
  topic: string;
  difficulty: string;
  explanation: string;
  approved: boolean;
}

/** Simple CSV parser that handles quoted fields with commas inside */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { questions: ParsedQuestion[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const errors: string[] = [];
  const questions: ParsedQuestion[] = [];

  if (lines.length < 2) {
    return { questions: [], errors: ["File appears empty or has no data rows."] };
  }

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 6) {
      errors.push(`Row ${i + 1}: too few columns (got ${cols.length}, need at least 6).`);
      continue;
    }
    const [q, a, b, c, d, correct, subject, topic, difficulty, explanation] = cols;
    if (!q) { errors.push(`Row ${i + 1}: question text is empty.`); continue; }
    const correctLetter = correct.toUpperCase().trim();
    const correctIndex = ["A", "B", "C", "D"].indexOf(correctLetter);
    if (correctIndex === -1) {
      errors.push(`Row ${i + 1}: correct column must be A, B, C, or D (got "${correct}").`);
      continue;
    }
    questions.push({
      id: `imported-${Date.now()}-${i}`,
      question: q,
      options: [a || "—", b || "—", c || "—", d || "—"],
      correctIndex,
      subject: subject || "General Knowledge",
      topic: topic || "General",
      difficulty: difficulty || "Medium",
      explanation: explanation || "",
      approved: true,
    });
  }
  return { questions, errors };
}

function downloadCSVTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mssn_questions_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── PIN Gate ──────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const tryUnlock = () => {
    if (pin === ADMIN_PIN) { onUnlock(); }
    else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 2500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F5F0E6" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, x: error ? [0, -8, 8, -8, 8, 0] : 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-3xl p-8 text-center" style={{ background: "white", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${GREEN}15` }}>
            <Shield size={32} style={{ color: GREEN }} />
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "22px", color: "#111", marginBottom: "6px" }}>
            Admin Access
          </h2>
          <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "24px" }}>Enter your admin PIN to continue</p>

          <div className="relative mb-3">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#aaa" }} />
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
              placeholder="Enter PIN"
              className="w-full pl-11 pr-11 py-3.5 rounded-2xl border-2 outline-none text-center tracking-widest"
              style={{ borderColor: error ? "#DC2626" : "#eee", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px" }}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: "#aaa" }}
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ color: "#DC2626", fontSize: "12px", marginBottom: "12px" }}>
              Incorrect PIN. Try again.
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={tryUnlock}
            className="w-full py-3.5 rounded-2xl font-bold"
            style={{ background: GREEN, color: "white", fontFamily: "'Manrope', sans-serif", fontSize: "15px" }}
          >
            Unlock Admin Panel
          </motion.button>
          <p style={{ fontSize: "11px", color: "#ddd", marginTop: "16px" }}>Hint: admin1234</p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({
  questions,
  errors,
  onClose,
  onPublish,
}: {
  questions: ParsedQuestion[];
  errors: string[];
  onClose: () => void;
  onPublish: (qs: ParsedQuestion[]) => void;
}) {
  const [items, setItems] = useState(questions);
  const approved = items.filter((q) => q.approved);

  const toggle = (id: string) =>
    setItems((prev) => prev.map((q) => (q.id === id ? { ...q, approved: !q.approved } : q)));

  const removeItem = (id: string) => setItems((prev) => prev.filter((q) => q.id !== id));

  const DIFF_COLOR: Record<string, string> = { Easy: "#059669", Medium: "#D97706", Hard: "#DC2626" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="bg-white h-full w-full max-w-2xl overflow-y-auto flex flex-col"
        style={{ boxShadow: "-8px 0 48px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-5 py-4 flex items-center justify-between z-10" style={{ borderBottom: "1px solid #F3F4F6" }}>
          <div>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", fontSize: "17px" }}>
              Review Imported Questions
            </h3>
            <p style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>
              {approved.length} of {items.length} approved · uncheck to skip
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose}>
            <X size={20} style={{ color: "#888" }} />
          </motion.button>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          {/* Parse errors */}
          {errors.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} style={{ color: "#DC2626" }} />
                <p style={{ fontWeight: 700, fontSize: "13px", color: "#DC2626" }}>
                  {errors.length} row{errors.length !== 1 ? "s" : ""} skipped
                </p>
              </div>
              {errors.map((e, i) => (
                <p key={i} style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}>• {e}</p>
              ))}
            </div>
          )}

          {items.length === 0 && (
            <div className="rounded-2xl p-8 text-center" style={{ background: "#F9FAFB" }}>
              <p style={{ color: "#aaa", fontSize: "14px" }}>No valid questions found in the file.</p>
            </div>
          )}

          {items.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="rounded-2xl p-4"
              style={{
                background: q.approved ? "white" : "#F9FAFB",
                border: `1.5px solid ${q.approved ? `${GREEN}30` : "#E5E7EB"}`,
                opacity: q.approved ? 1 : 0.55,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Approve toggle */}
                <button
                  onClick={() => toggle(q.id)}
                  className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center"
                  style={{ borderColor: q.approved ? GREEN : "#D1D5DB", background: q.approved ? GREEN : "white" }}
                >
                  {q.approved && <CheckCircle2 size={12} style={{ color: "white" }} />}
                </button>

                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#111", marginBottom: "8px", lineHeight: 1.5 }}>
                    {i + 1}. {q.question}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                        style={{
                          background: oi === q.correctIndex ? `${GREEN}12` : "#F9FAFB",
                          border: `1px solid ${oi === q.correctIndex ? `${GREEN}35` : "#F0F0F0"}`,
                        }}
                      >
                        <span
                          className="w-5 h-5 rounded-lg flex-shrink-0 flex items-center justify-center"
                          style={{
                            background: oi === q.correctIndex ? GREEN : "#E5E7EB",
                            color: oi === q.correctIndex ? "white" : "#9CA3AF",
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 800,
                            fontSize: "10px",
                          }}
                        >
                          {["A", "B", "C", "D"][oi]}
                        </span>
                        <span style={{ fontSize: "12px", color: oi === q.correctIndex ? GREEN : "#374151", fontWeight: oi === q.correctIndex ? 700 : 400 }} className="truncate">
                          {opt}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: q.subject, color: "#4F46E5" },
                      { label: q.topic, color: "#6B7280" },
                      { label: q.difficulty, color: DIFF_COLOR[q.difficulty] || "#6B7280" },
                    ].map(({ label, color }) => (
                      <span key={label} className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${color}15`, color }}>
                        {label}
                      </span>
                    ))}
                  </div>

                  {q.explanation && (
                    <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px", lineHeight: 1.5 }}>
                      💡 {q.explanation}
                    </p>
                  )}
                </div>

                {/* Remove */}
                <motion.button
                  whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={() => removeItem(q.id)}
                  className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: "#FEF2F2" }}
                >
                  <Trash2 size={13} style={{ color: "#DC2626" }} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white px-5 py-4 flex gap-3" style={{ borderTop: "1px solid #F3F4F6" }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 font-bold text-sm"
            style={{ borderColor: "#E5E7EB", color: "#6B7280", fontFamily: "'Manrope', sans-serif" }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(31,78,61,0.25)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPublish(approved)}
            disabled={approved.length === 0}
            className="flex-1 py-3 rounded-2xl font-bold text-sm"
            style={{
              background: approved.length > 0 ? GREEN : "#E5E7EB",
              color: approved.length > 0 ? "white" : "#9CA3AF",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            Publish {approved.length > 0 ? `${approved.length} Question${approved.length !== 1 ? "s" : ""}` : "—"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main AdminPanel ───────────────────────────────────────────────────────────
export function AdminPanel() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");

  // Published questions — persisted to localStorage
  const [publishedQuestions, setPublishedQuestions] = useState<ParsedQuestion[]>(() =>
    loadAdminQuestions() as ParsedQuestion[]
  );

  const [confirmClear, setConfirmClear] = useState(false);

  // Import state
  const [importType, setImportType] = useState<"CSV" | "PDF" | "DOCX" | null>(null);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<{ questions: ParsedQuestion[]; errors: string[] } | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPT_MAP: Record<"CSV" | "PDF" | "DOCX", string> = {
    CSV: ".csv,text/csv",
    PDF: ".pdf,application/pdf",
    DOCX: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImportedFile(file);
    setParseError(null);
  };

  const triggerFileInput = (type: "CSV" | "PDF" | "DOCX") => {
    setImportType(type);
    setImportedFile(null);
    setParseError(null);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.accept = ACCEPT_MAP[type];
        fileInputRef.current.value = "";
        fileInputRef.current.click();
      }
    }, 0);
  };

  const handleParse = () => {
    if (!importedFile || !importType) return;

    if (importType !== "CSV") {
      setParseError(`${importType} parsing requires a server. Please export your questions as CSV using the template and re-import.`);
      return;
    }

    setParsing(true);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      setParsing(false);
      if (result.questions.length === 0 && result.errors.length === 0) {
        setParseError("The CSV file appears to be empty or has no valid rows.");
      } else {
        setReviewData(result);
      }
    };
    reader.onerror = () => {
      setParsing(false);
      setParseError("Could not read the file. Please try again.");
    };
    reader.readAsText(importedFile);
  };

  const handlePublish = (approved: ParsedQuestion[]) => {
    const next = [...publishedQuestions, ...approved];
    saveAdminQuestions(next as AdminQuestion[]);
    setPublishedQuestions(next);
    // Fire side-effects after state is set, not inside the updater
    notifyQuestionsUpdated(next.length);
    pushNotification({
      title: "New questions added!",
      body: `${approved.length} new question${approved.length !== 1 ? "s" : ""} have been added to the question bank. Refresh to practice!`,
      type: "questions",
      timestamp: Date.now(),
    });
    setPublishSuccess(approved.length);
    setReviewData(null);
    setImportedFile(null);
    setImportType(null);
    setTimeout(() => setPublishSuccess(0), 4000);
  };

  const handleDeleteQuestion = (id: string) => {
    deleteAdminQuestion(id);
    setPublishedQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleClearAll = () => {
    clearAdminQuestions();
    setPublishedQuestions([]);
    setConfirmClear(false);
  };

  // Manual form
  const [addForm, setAddForm] = useState({
    subject: "English", topic: "", difficulty: "Medium",
    question: "", optA: "", optB: "", optC: "", optD: "",
    correct: "A", explanation: "",
  });
  const [manualSuccess, setManualSuccess] = useState(false);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<{ title: string; body: string; ts: number }[]>([]);

  const handleBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    pushNotification({
      title: broadcastTitle.trim(),
      body: broadcastBody.trim(),
      type: "broadcast",
      timestamp: Date.now(),
    });
    setBroadcastHistory((prev) => [{ title: broadcastTitle.trim(), body: broadcastBody.trim(), ts: Date.now() }, ...prev].slice(0, 10));
    setBroadcastTitle("");
    setBroadcastBody("");
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  const handleManualPublish = () => {
    if (!addForm.question || !addForm.optA || !addForm.optB || !addForm.optC || !addForm.optD) return;
    const correctIndex = ["A", "B", "C", "D"].indexOf(addForm.correct);
    const q: ParsedQuestion = {
      id: `manual-${Date.now()}`,
      question: addForm.question,
      options: [addForm.optA, addForm.optB, addForm.optC, addForm.optD],
      correctIndex,
      subject: addForm.subject,
      topic: addForm.topic || "General",
      difficulty: addForm.difficulty,
      explanation: addForm.explanation,
      approved: true,
    };
    const next = [...publishedQuestions, q];
    saveAdminQuestions(next as AdminQuestion[]);
    setPublishedQuestions(next);
    // Fire side-effects after state is set, not inside the updater
    notifyQuestionsUpdated(next.length);
    pushNotification({
      title: "New question added!",
      body: `A new ${q.subject} question on "${q.topic}" has been published to the question bank.`,
      type: "questions",
      timestamp: Date.now(),
    });
    setAddForm({ subject: "English", topic: "", difficulty: "Medium", question: "", optA: "", optB: "", optC: "", optD: "", correct: "A", explanation: "" });
    setManualSuccess(true);
    setTimeout(() => setManualSuccess(false), 3000);
  };

  const filteredQuestions = publishedQuestions.filter(
    (q) => q.question.toLowerCase().includes(search.toLowerCase()) || q.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  return (
    <PageFade>
      <div className="min-h-screen overflow-x-hidden" style={{ background: "#F9FAFB", fontFamily: "'Manrope', sans-serif" }}>

        {/* Header */}
        <motion.header
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 px-4 sm:px-8 py-4 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ x: -4 }} whileTap={{ scale: 0.9 }} onClick={() => navigate("/home")} style={{ color: GREEN }}>
              <ChevronLeft size={22} />
            </motion.button>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GREEN }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: "14px", fontFamily: "'Poppins', sans-serif" }}>M</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", fontSize: "15px" }}>Admin Panel</p>
              <p style={{ fontSize: "10px", color: "#aaa" }}>MSSN UNILORIN CBT</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {publishSuccess > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: `${GREEN}15`, border: `1px solid ${GREEN}30` }}
              >
                <CheckCircle2 size={14} style={{ color: GREEN }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: GREEN }}>{publishSuccess} published!</span>
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setUnlocked(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "#fdecea", color: "#DC2626" }}
            >
              Lock
            </motion.button>
          </div>
        </motion.header>

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-52 min-h-screen sticky top-16 self-start" style={{ background: "white", borderRight: "1px solid #F3F4F6" }}>
            <nav className="p-4 space-y-1">
              {TABS.map(({ id, label, emoji }, i) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setTab(id); setSearch(""); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left"
                  style={{ background: tab === id ? GREEN : "transparent", color: tab === id ? "white" : "#666", fontWeight: 700, fontSize: "13px" }}
                >
                  <span style={{ fontSize: "16px" }}>{emoji}</span>
                  {label}
                  {id === "questions" && publishedQuestions.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: tab === id ? "rgba(255,255,255,0.2)" : `${GREEN}15`, color: tab === id ? "white" : GREEN }}>
                      {publishedQuestions.length}
                    </span>
                  )}
                </motion.button>
              ))}
            </nav>
          </aside>

          {/* Mobile bottom tabs */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderTop: "1px solid #F3F4F6" }}>
            {TABS.map(({ id, label, emoji }) => (
              <button key={id} onClick={() => { setTab(id); setSearch(""); }} className="flex-1 flex flex-col items-center py-2 gap-0.5">
                <span style={{ fontSize: "16px" }}>{emoji}</span>
                <span style={{ fontSize: "9px", color: tab === id ? GREEN : "#aaa", fontWeight: 700 }}>{label}</span>
              </button>
            ))}
          </nav>

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-8 min-w-0">

            {/* ── Overview ── */}
            {tab === "overview" && (
              <div>
                <motion.h2 initial="hidden" animate="visible" variants={fadeUp}
                  style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: "#111", fontSize: "22px", marginBottom: "20px" }}>
                  Platform Overview 📊
                </motion.h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Users,        label: "Total Users",    value: "0",                              note: "No users registered yet" },
                    { icon: Users,        label: "Active Today",   value: "0",                              note: "No active sessions" },
                    { icon: BarChart2,    label: "Sessions Today", value: "0",                              note: "—" },
                    { icon: FileQuestion, label: "Questions",      value: publishedQuestions.length.toString(), note: publishedQuestions.length === 0 ? "No questions published" : "Published" },
                  ].map(({ icon: Icon, label, value, note }, i) => (
                    <MotionCard key={label} delay={i} style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${GREEN}12` }}>
                        <Icon size={20} style={{ color: GREEN }} />
                      </div>
                      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "28px", color: GREEN }}>{value}</p>
                      <p style={{ fontWeight: 700, color: "#333", fontSize: "13px", marginTop: "2px" }}>{label}</p>
                      <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>{note}</p>
                    </MotionCard>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <MotionCard style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", marginBottom: "12px" }}>Subject Activity</p>
                    <div className="py-8 text-center" style={{ color: "#ccc" }}>
                      <BarChart2 size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                      <p style={{ fontSize: "13px" }}>No activity yet</p>
                    </div>
                  </MotionCard>
                  <MotionCard style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", marginBottom: "12px" }}>Recent Users</p>
                    <div className="py-8 text-center" style={{ color: "#ccc" }}>
                      <Users size={32} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
                      <p style={{ fontSize: "13px" }}>No users registered yet</p>
                    </div>
                  </MotionCard>
                </div>
              </div>
            )}

            {/* ── Questions ── */}
            {tab === "questions" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: "#111", fontSize: "22px" }}>
                    Questions ({publishedQuestions.length}) 📋
                  </h2>
                  <div className="flex items-center gap-2">
                    {publishedQuestions.length > 0 && !confirmClear && (
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => setConfirmClear(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm"
                        style={{ background: "#FEF2F2", color: "#DC2626", fontFamily: "'Manrope', sans-serif" }}>
                        <Trash2 size={15} /> Clear All
                      </motion.button>
                    )}
                    {confirmClear && (
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: "12px", color: "#DC2626", fontWeight: 700 }}>Remove all {publishedQuestions.length} questions?</span>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={handleClearAll}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs"
                          style={{ background: "#DC2626", color: "white", fontFamily: "'Manrope', sans-serif" }}>
                          Yes, clear
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setConfirmClear(false)}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs"
                          style={{ background: "#F3F4F6", color: "#6B7280", fontFamily: "'Manrope', sans-serif" }}>
                          Cancel
                        </motion.button>
                      </div>
                    )}
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setTab("add")}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm"
                      style={{ background: GREEN, color: "white", fontFamily: "'Manrope', sans-serif" }}>
                      <Plus size={15} /> Add New
                    </motion.button>
                  </div>
                </div>

                {publishedQuestions.length > 0 && (
                  <div className="relative mb-4">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#aaa" }} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 bg-white outline-none"
                      style={{ borderColor: "#eee", fontFamily: "'Manrope', sans-serif", fontSize: "14px" }} />
                  </div>
                )}

                {publishedQuestions.length === 0 ? (
                  <div className="rounded-3xl p-10 text-center" style={{ background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                    <FileQuestion size={36} style={{ margin: "0 auto 12px", color: "#ddd" }} />
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#aaa", fontSize: "16px" }}>No questions yet</p>
                    <p style={{ fontSize: "13px", color: "#ccc", marginTop: "4px" }}>Add manually or import from CSV</p>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setTab("add")}
                      className="mt-5 px-6 py-3 rounded-2xl font-bold text-sm inline-flex items-center gap-2"
                      style={{ background: GREEN, color: "white", fontFamily: "'Manrope', sans-serif" }}>
                      <Plus size={15} /> Add First Question
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredQuestions.map((q, i) => (
                      <MotionCard key={q.id} delay={Math.min(i, 5)} style={{ background: "white", borderRadius: "20px", padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>{q.question}</p>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { label: q.subject, color: "#4F46E5" },
                                { label: q.topic, color: "#6B7280" },
                                { label: q.difficulty, color: q.difficulty === "Easy" ? "#059669" : q.difficulty === "Medium" ? "#D97706" : "#DC2626" },
                                { label: "✅ Published", color: GREEN },
                              ].map(({ label, color }) => (
                                <span key={label} className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: `${color}15`, color }}>
                                  {label}
                                </span>
                              ))}
                            </div>
                            {q.explanation && (
                              <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px" }}>💡 {q.explanation.slice(0, 80)}{q.explanation.length > 80 ? "…" : ""}</p>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: "#FEF2F2" }}
                            title="Delete question"
                          >
                            <Trash2 size={14} style={{ color: "#DC2626" }} />
                          </motion.button>
                        </div>
                      </MotionCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Add Question ── */}
            {tab === "add" && (
              <div className="max-w-2xl">
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: "#111", fontSize: "22px", marginBottom: "20px" }}>
                  ➕ Add Question
                </h2>

                {/* ── Import card ── */}
                <MotionCard style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
                  <div className="flex items-center justify-between mb-1">
                    <p style={{ fontWeight: 800, color: "#111", fontSize: "14px" }}>📤 Import from file</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={downloadCSVTemplate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ background: `${GREEN}12`, color: GREEN }}
                    >
                      <Download size={12} /> CSV Template
                    </motion.button>
                  </div>
                  <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "12px" }}>
                    Download the CSV template, fill in your questions, then import. PDF/DOCX import requires a backend.
                  </p>

                  <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />

                  {/* Format buttons */}
                  <div className="flex gap-3 flex-wrap mb-3">
                    {(["CSV", "PDF", "DOCX"] as const).map((type) => (
                      <motion.button
                        key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => triggerFileInput(type)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 text-sm font-bold"
                        style={{
                          borderColor: importType === type ? GREEN : "#ddd",
                          color: importType === type ? GREEN : type !== "CSV" ? "#bbb" : "#555",
                          background: importType === type ? `${GREEN}08` : "white",
                          fontFamily: "'Manrope', sans-serif",
                        }}
                      >
                        <Upload size={13} /> {type}
                        {type !== "CSV" && <span style={{ fontSize: "10px", color: "#bbb" }}>(server)</span>}
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {importType && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {/* File selected */}
                        {importedFile ? (
                          <div>
                            <div className="rounded-2xl p-4 flex items-center gap-3 mb-3"
                              style={{ background: `${GREEN}0A`, border: `1.5px solid ${GREEN}30` }}>
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GREEN}15` }}>
                                <Upload size={18} style={{ color: GREEN }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111" }} className="truncate">{importedFile.name}</p>
                                <p style={{ fontSize: "11px", color: "#aaa" }}>{(importedFile.size / 1024).toFixed(1)} KB · {importType}</p>
                              </div>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => { setImportedFile(null); setImportType(null); setParseError(null); }}
                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: "#fdecea" }}>
                                <X size={13} style={{ color: "#DC2626" }} />
                              </motion.button>
                            </div>

                            {/* Parse error */}
                            {parseError && (
                              <div className="rounded-2xl p-4 mb-3 flex items-start gap-2" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
                                <AlertCircle size={16} style={{ color: "#DC2626", flexShrink: 0, marginTop: "1px" }} />
                                <p style={{ fontSize: "12px", color: "#DC2626", lineHeight: 1.5 }}>{parseError}</p>
                              </div>
                            )}

                            <motion.button
                              whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(31,78,61,0.2)" }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleParse}
                              disabled={parsing}
                              className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                              style={{ background: GREEN, color: "white", fontFamily: "'Manrope', sans-serif", opacity: parsing ? 0.7 : 1 }}
                            >
                              {parsing ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 rounded-full border-2 border-white border-t-transparent"
                                  />
                                  Parsing…
                                </>
                              ) : (
                                <>✅ Parse & Review Questions</>
                              )}
                            </motion.button>
                          </div>
                        ) : (
                          /* Drop zone */
                          <motion.button
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full rounded-2xl border-2 border-dashed p-5 text-center"
                            style={{ borderColor: GREEN, background: `${GREEN}06` }}
                          >
                            <Upload size={28} style={{ color: GREEN, margin: "0 auto 8px", opacity: 0.5 }} />
                            <p style={{ fontSize: "13px", color: "#555", fontWeight: 600 }}>
                              Click to browse for a <strong>{importType}</strong> file
                            </p>
                            <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
                              {importType === "CSV"
                                ? "Use the CSV template for the correct format"
                                : `${importType} import requires backend integration — use CSV instead`}
                            </p>
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </MotionCard>

                {/* ── Manual form ── */}
                <MotionCard style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontWeight: 800, color: "#111", fontSize: "14px", marginBottom: "16px" }}>✏️ Manual Entry</p>

                  {manualSuccess && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-3 mb-4 flex items-center gap-2"
                      style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}30` }}>
                      <CheckCircle2 size={16} style={{ color: GREEN }} />
                      <p style={{ fontSize: "13px", fontWeight: 700, color: GREEN }}>Question published successfully!</p>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Subject", field: "subject", options: ["English", "Mathematics", "Current Affairs", "General Knowledge"] },
                        { label: "Difficulty", field: "difficulty", options: ["Easy", "Medium", "Hard"] },
                      ].map(({ label, field, options }) => (
                        <div key={field}>
                          <label style={{ fontSize: "11px", fontWeight: 800, color: "#888", textTransform: "uppercase" }}>{label}</label>
                          <div className="relative mt-1">
                            <select value={addForm[field as keyof typeof addForm]}
                              onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })}
                              className="w-full px-3 py-2.5 rounded-xl border-2 outline-none appearance-none bg-white"
                              style={{ borderColor: "#eee", fontFamily: "'Manrope', sans-serif", fontSize: "13px" }}>
                              {options.map((o) => <option key={o}>{o}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#aaa" }} />
                          </div>
                        </div>
                      ))}
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 800, color: "#888", textTransform: "uppercase" }}>Topic</label>
                        <input value={addForm.topic} onChange={(e) => setAddForm({ ...addForm, topic: e.target.value })}
                          placeholder="e.g. Algebra"
                          className="w-full mt-1 px-3 py-2.5 rounded-xl border-2 outline-none"
                          style={{ borderColor: "#eee", fontFamily: "'Manrope', sans-serif", fontSize: "13px" }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 800, color: "#888", textTransform: "uppercase" }}>Question Text</label>
                      <textarea value={addForm.question} onChange={(e) => setAddForm({ ...addForm, question: e.target.value })}
                        placeholder="Enter the full question text..." rows={3}
                        className="w-full mt-1 px-4 py-3 rounded-xl border-2 outline-none resize-none"
                        style={{ borderColor: "#eee", fontFamily: "'Manrope', sans-serif", fontSize: "13px" }} />
                    </div>

                    {(["A", "B", "C", "D"] as const).map((letter) => (
                      <div key={letter}>
                        <label style={{ fontSize: "11px", fontWeight: 800, color: "#888", textTransform: "uppercase" }}>Option {letter}</label>
                        <input value={addForm[`opt${letter}` as keyof typeof addForm]}
                          onChange={(e) => setAddForm({ ...addForm, [`opt${letter}`]: e.target.value })}
                          placeholder={`Option ${letter}`}
                          className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 outline-none"
                          style={{ borderColor: "#eee", fontFamily: "'Manrope', sans-serif", fontSize: "13px" }} />
                      </div>
                    ))}

                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 800, color: "#888", textTransform: "uppercase" }}>Correct Answer</label>
                      <div className="flex gap-2 mt-1">
                        {["A", "B", "C", "D"].map((l) => (
                          <motion.button key={l} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => setAddForm({ ...addForm, correct: l })}
                            className="w-10 h-10 rounded-xl font-bold text-sm"
                            style={{ background: addForm.correct === l ? GREEN : "#F3F4F6", color: addForm.correct === l ? "white" : "#555", fontFamily: "'Poppins', sans-serif" }}>
                            {l}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 800, color: "#888", textTransform: "uppercase" }}>Explanation</label>
                      <textarea value={addForm.explanation} onChange={(e) => setAddForm({ ...addForm, explanation: e.target.value })}
                        placeholder="Explain why the correct answer is right..." rows={3}
                        className="w-full mt-1 px-4 py-3 rounded-xl border-2 outline-none resize-none"
                        style={{ borderColor: "#eee", fontFamily: "'Manrope', sans-serif", fontSize: "13px" }} />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(31,78,61,0.25)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleManualPublish}
                      disabled={!addForm.question || !addForm.optA || !addForm.optB || !addForm.optC || !addForm.optD}
                      className="w-full py-3.5 rounded-2xl font-bold"
                      style={{
                        background: addForm.question && addForm.optA ? GREEN : "#E5E7EB",
                        color: addForm.question && addForm.optA ? "white" : "#9CA3AF",
                        fontFamily: "'Manrope', sans-serif",
                      }}>
                      ✅ Publish Question
                    </motion.button>
                  </div>
                </MotionCard>
              </div>
            )}

            {/* ── Broadcast ── */}
            {tab === "broadcast" && (
              <div className="max-w-2xl">
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: "#111", fontSize: "22px", marginBottom: "4px" }}>
                  📣 Broadcast to All Users
                </h2>
                <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "20px" }}>
                  Messages are delivered instantly to users' notification panels, even while they're using the app.
                </p>

                <MotionCard style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#F9731615" }}>
                      <MessageSquare size={17} style={{ color: "#F97316" }} />
                    </div>
                    <p style={{ fontWeight: 800, color: "#111", fontSize: "14px" }}>Compose Message</p>
                  </div>

                  {broadcastSent && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-3 mb-4 flex items-center gap-2"
                      style={{ background: "#F9731612", border: "1px solid #F9731630" }}
                    >
                      <CheckCircle2 size={16} style={{ color: "#F97316" }} />
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#F97316" }}>Message broadcast to all users!</p>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 800, color: "#888", textTransform: "uppercase" }}>Title</label>
                      <input
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="e.g. Announcement: New questions added"
                        maxLength={80}
                        className="w-full mt-1 px-4 py-2.5 rounded-xl border-2 outline-none"
                        style={{ borderColor: "#eee", fontFamily: "'Manrope', sans-serif", fontSize: "13px" }}
                      />
                      <p style={{ fontSize: "10px", color: "#aaa", textAlign: "right", marginTop: "3px" }}>{broadcastTitle.length}/80</p>
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 800, color: "#888", textTransform: "uppercase" }}>Message</label>
                      <textarea
                        value={broadcastBody}
                        onChange={(e) => setBroadcastBody(e.target.value)}
                        placeholder="Type your message to all students here..."
                        rows={4}
                        maxLength={300}
                        className="w-full mt-1 px-4 py-3 rounded-xl border-2 outline-none resize-none"
                        style={{ borderColor: "#eee", fontFamily: "'Manrope', sans-serif", fontSize: "13px" }}
                      />
                      <p style={{ fontSize: "10px", color: "#aaa", textAlign: "right", marginTop: "3px" }}>{broadcastBody.length}/300</p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(249,115,22,0.25)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleBroadcast}
                      disabled={!broadcastTitle.trim() || !broadcastBody.trim()}
                      className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
                      style={{
                        background: broadcastTitle.trim() && broadcastBody.trim() ? "#F97316" : "#E5E7EB",
                        color: broadcastTitle.trim() && broadcastBody.trim() ? "white" : "#9CA3AF",
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: "14px",
                      }}
                    >
                      <Send size={15} /> Send to All Users
                    </motion.button>
                  </div>
                </MotionCard>

                {/* Broadcast history */}
                {broadcastHistory.length > 0 && (
                  <MotionCard style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Bell size={15} style={{ color: "#9CA3AF" }} />
                      <p style={{ fontWeight: 800, color: "#111", fontSize: "14px" }}>Recent Broadcasts</p>
                    </div>
                    <div className="space-y-3">
                      {broadcastHistory.map((b, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="p-3 rounded-2xl" style={{ background: "#F9FAFB", border: "1px solid #F3F4F6" }}>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: "#111" }}>{b.title}</p>
                          <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "3px", lineHeight: 1.5 }}>{b.body}</p>
                          <p style={{ fontSize: "10px", color: "#aaa", marginTop: "4px" }}>
                            {new Date(b.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {new Date(b.ts).toLocaleDateString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </MotionCard>
                )}
              </div>
            )}

            {/* ── Flagged ── */}
            {tab === "flagged" && (
              <div>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: "#111", fontSize: "22px", marginBottom: "20px" }}>🚩 Flagged Questions</h2>
                <div className="rounded-3xl p-12 text-center" style={{ background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <Flag size={36} style={{ margin: "0 auto 12px", color: "#ddd" }} />
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#aaa", fontSize: "16px" }}>No flagged questions</p>
                  <p style={{ fontSize: "13px", color: "#ccc", marginTop: "4px" }}>Questions reported by students will appear here</p>
                </div>
              </div>
            )}

            {/* ── Users ── */}
            {tab === "users" && (
              <div>
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: "#111", fontSize: "22px", marginBottom: "20px" }}>👥 User Activity</h2>
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#aaa" }} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 bg-white outline-none"
                    style={{ borderColor: "#eee", fontFamily: "'Manrope', sans-serif", fontSize: "14px" }} />
                </div>
                <div className="rounded-3xl p-12 text-center" style={{ background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <Users size={36} style={{ margin: "0 auto 12px", color: "#ddd" }} />
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#aaa", fontSize: "16px" }}>No users yet</p>
                  <p style={{ fontSize: "13px", color: "#ccc", marginTop: "4px" }}>Users who register will appear here</p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Review slide-over */}
        <AnimatePresence>
          {reviewData && (
            <ReviewModal
              questions={reviewData.questions}
              errors={reviewData.errors}
              onClose={() => setReviewData(null)}
              onPublish={handlePublish}
            />
          )}
        </AnimatePresence>
      </div>
    </PageFade>
  );
}
