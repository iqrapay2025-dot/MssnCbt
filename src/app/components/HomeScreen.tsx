import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Navigation } from "./Navigation";
import { MotionCard, PageFade, SquiggleAccent } from "./MotionCard";
import { useUser } from "../context/UserContext";
import {
  Zap, ChevronRight, Clock, Star, Flame, Trophy,
  BookOpen, Target, TrendingUp, AlertTriangle,
  ChevronLeft, Quote, CheckCircle2,
} from "lucide-react";

const GREEN = "#1F4E3D";
const CREAM = "#F5F0E6";

// Hero carousel slides — exam/study themed images with backdrop overlay
const HERO_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1513258496099-48168024aec0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    label: "Practice Smarter",
  },
  {
    url: "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    label: "Timed Mock Exams",
  },
  {
    url: "https://images.unsplash.com/photo-1741699428220-65f37f3fbbcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    label: "Deep Study Sessions",
  },
  {
    url: "https://images.unsplash.com/photo-1617529497832-5ad49d9b5928?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    label: "Track Your Progress",
  },
];

const SUBJECT_CARDS = [
  { icon: BookOpen, label: "English", sublabel: "Comprehension, Grammar", color: "#4F46E5", bg: "#EEF2FF", subject: "English" },
  { icon: Target,   label: "Mathematics", sublabel: "Algebra, Geometry", color: "#D97706", bg: "#FFFBEB", subject: "Mathematics" },
  { icon: TrendingUp, label: "Current Affairs", sublabel: "Politics, Economy", color: "#059669", bg: "#ECFDF5", subject: "Current Affairs" },
  { icon: Star,     label: "Gen. Knowledge", sublabel: "Science, History", color: "#DC2626", bg: "#FEF2F2", subject: "General Knowledge" },
];

const TESTIMONIALS = [
  {
    name: "Aisha Abdullahi",
    location: "Ilorin, Kwara State",
    role: "UNILORIN 2024 Admitted",
    quote: "I used MSSN CBT Practice for 3 weeks before my Post-UTME. The timed mock exams really prepared me for the pressure. I scored 76 and got admitted into Medicine!",
    score: 76,
    avatar: "A",
  },
  {
    name: "Ibrahim Suleiman",
    location: "Lagos State",
    role: "Mass Communication Student",
    quote: "The question explanations are gold. I didn't just memorize answers — I actually understood why each answer was correct. Highly recommend to every aspirant.",
    score: 82,
    avatar: "I",
  },
  {
    name: "Fatimah Bello",
    location: "Kwara State",
    role: "Computer Science, 200L",
    quote: "As-salamu alaykum! This platform is a blessing. The leaderboard kept me motivated and the reports showed me exactly where I was weak. JazakAllahu Khairan!",
    score: 89,
    avatar: "F",
  },
  {
    name: "Muhammad Yusuf",
    location: "Kano State",
    role: "Engineering Aspirant",
    quote: "The mathematics practice section is exceptional. Step-by-step solutions helped me go from failing Maths to scoring 85 in my actual Post-UTME.",
    score: 85,
    avatar: "M",
  },
  {
    name: "Khadijah Umar",
    location: "Abuja",
    role: "Law Student, 100L",
    quote: "I practiced every day for two weeks on this platform. The subject breakdown in Reports helped me focus on my weakest areas. Alhamdulillah, I got admitted!",
    score: 80,
    avatar: "K",
  },
];

const PILL_TAGS = [
  { label: "English", color: "#4F46E5" },
  { label: "Mathematics", color: "#D97706" },
  { label: "Current Affairs", color: "#059669" },
  { label: "Gen. Knowledge", color: "#DC2626" },
  { label: "Timed Mode", color: "#7C3AED" },
  { label: "CBT Ready", color: GREEN },
  { label: "Leaderboard", color: "#B45309" },
  { label: "Reports", color: "#0891B2" },
];

// ── Hero Carousel ─────────────────────────────────────────────────────────────
function HeroCarousel({ userName }: { userName: string }) {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const goTo = (i: number) => {
    setSlide(i);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startAutoplay();
  };

  const prev = () => goTo((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => goTo((slide + 1) % HERO_SLIDES.length);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "440px" }}>
      {/* Sliding background images */}
      <AnimatePresence mode="sync">
        <motion.img
          key={slide}
          src={HERO_SLIDES[slide].url}
          alt={HERO_SLIDES[slide].label}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        />
      </AnimatePresence>

      {/* Deep gradient overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(110deg, rgba(15,30,24,0.88) 0%, rgba(31,78,61,0.78) 45%, rgba(31,78,61,0.45) 100%)",
          backdropFilter: "blur(1px)",
        }}
      />

      {/* Geometric texture */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="home-geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#home-geo)" />
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* Greeting pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          <span style={{ fontSize: "12px", color: "white", fontWeight: 700 }}>
            🕌 As-salamu alaykum, {userName}!
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 4.5vw, 46px)",
            color: "white",
            lineHeight: 1.15,
            marginBottom: "12px",
            textShadow: "0 2px 16px rgba(0,0,0,0.3)",
          }}
        >
          Practice smarter,<br />
          <span style={{ color: "#A7D9C4" }}>score higher</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", maxWidth: "420px", lineHeight: 1.65, marginBottom: "24px" }}
        >
          Your UNILORIN Post-UTME journey starts here. Timed exams, instant feedback, full reports.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 12px 32px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/pre-exam", { state: { mode: "mock" } })}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl"
            style={{
              background: "white",
              color: GREEN,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 800,
              fontSize: "14px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <Zap size={16} style={{ color: GREEN }} fill={GREEN} />
            Start Mock Exam
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/practice")}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2"
            style={{
              borderColor: "rgba(255,255,255,0.45)",
              color: "white",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            Practice by Topic <ChevronRight size={15} />
          </motion.button>
        </motion.div>
      </div>

      {/* Slide controls — overlaid at bottom */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-between max-w-5xl mx-auto px-4 sm:px-6">
        {/* Dots + slide label */}
        <div className="flex items-center gap-3">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? "24px" : "7px",
                height: "7px",
                background: i === slide ? "white" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 600, marginLeft: "4px" }}>
            {HERO_SLIDES[slide].label}
          </span>
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            <ChevronLeft size={15} style={{ color: "white" }} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={next}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            <ChevronRight size={15} style={{ color: "white" }} />
          </motion.button>
        </div>
      </div>

      {/* Curved bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
        style={{
          background: CREAM,
          borderRadius: "100% 100% 0 0 / 40px 40px 0 0",
        }}
      />
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = TESTIMONIALS.length;

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 4500);
  };

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const goTo = (i: number) => {
    setCurrent(i);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startAutoplay();
  };

  const prev = () => goTo((current - 1 + total) % total);
  const next = () => goTo((current + 1) % total);

  const t = TESTIMONIALS[current];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-10 w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-5"
      >
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "22px", color: "#111" }}>
          What students say 💬
        </h2>
        <p style={{ color: "#888", fontSize: "14px", marginTop: "4px" }}>
          Thousands of aspirants have used MSSN CBT Practice to get admitted
        </p>
      </motion.div>

      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-3xl p-6 sm:p-8"
            style={{ background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-start gap-3 mb-5">
              <Quote size={28} style={{ color: GREEN, opacity: 0.4, flexShrink: 0 }} />
              <p style={{ fontSize: "15px", color: "#333", lineHeight: 1.75, fontStyle: "italic" }}>
                "{t.quote}"
              </p>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: GREEN, color: "white", fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "16px" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", fontSize: "14px" }}>{t.name}</p>
                  <p style={{ fontSize: "12px", color: "#aaa" }}>{t.role}</p>
                  <p style={{ fontSize: "11px", color: "#bbb" }}>{t.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: `${GREEN}12`, border: `1px solid ${GREEN}25` }}>
                <Trophy size={15} style={{ color: GREEN }} />
                <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: GREEN, fontSize: "16px" }}>{t.score}%</span>
                <span style={{ fontSize: "11px", color: GREEN, opacity: 0.7 }}>Post-UTME</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className="rounded-full transition-all duration-300"
                style={{ width: i === current ? "24px" : "8px", height: "8px", background: i === current ? GREEN : "#ddd" }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prev}
              className="w-9 h-9 rounded-xl flex items-center justify-center border-2"
              style={{ borderColor: "#e5e5e5", background: "white" }}>
              <ChevronLeft size={16} style={{ color: "#555" }} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={next}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: GREEN }}>
              <ChevronRight size={16} style={{ color: "white" }} />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Focus Area (real-time from stats) ─────────────────────────────────────────
interface SubjectAvg { subject: string; avg: number; count: number }

function computeSubjectAvgs(history: ReturnType<typeof useUser>["stats"]["history"]): SubjectAvg[] {
  const map: Record<string, { total: number; count: number }> = {};
  for (const rec of history) {
    if (!rec.subject) continue;
    const pct = Math.round((rec.score / rec.total) * 100);
    if (!map[rec.subject]) map[rec.subject] = { total: 0, count: 0 };
    map[rec.subject].total += pct;
    map[rec.subject].count += 1;
  }
  return Object.entries(map).map(([subject, { total, count }]) => ({
    subject,
    avg: Math.round(total / count),
    count,
  }));
}

const SUBJECT_COLOR: Record<string, string> = {
  English: "#4F46E5",
  Mathematics: "#D97706",
  "Current Affairs": "#059669",
  "General Knowledge": "#DC2626",
};

function FocusArea() {
  const navigate = useNavigate();
  const { stats } = useUser();

  // Compute from all sessions — include mock (no subject) and practice sessions
  const practiceHistory = stats.history.filter((r) => r.subject);
  const subjectAvgs = computeSubjectAvgs(stats.history);
  const hasSubjectData = subjectAvgs.length > 0;

  // Weakest subject = lowest avg score
  const weakest = hasSubjectData
    ? subjectAvgs.sort((a, b) => a.avg - b.avg)[0]
    : null;

  // If no sessions at all, show empty state
  if (stats.sessions === 0) {
    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} style={{ color: "#D97706" }} />
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "18px", color: "#111" }}>
            Focus Area
          </h2>
        </div>
        <MotionCard style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "#FFF8E6" }}>
              <AlertTriangle size={22} style={{ color: "#D97706" }} />
            </div>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", fontSize: "16px", marginBottom: "6px" }}>
              No data yet
            </p>
            <p style={{ color: "#aaa", fontSize: "13px", lineHeight: 1.6, maxWidth: "280px" }}>
              Complete practice sessions to see which subjects need the most work.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/practice")}
              className="mt-4 px-5 py-2.5 rounded-2xl"
              style={{ background: GREEN, color: "white", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "13px" }}
            >
              Start Practicing →
            </motion.button>
          </div>
        </MotionCard>
      </section>
    );
  }

  // Has mock sessions but no practice subject data
  if (!weakest) {
    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} style={{ color: "#D97706" }} />
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "18px", color: "#111" }}>
            Focus Area
          </h2>
        </div>
        <MotionCard style={{ background: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EEF2FF" }}>
              <CheckCircle2 size={20} style={{ color: "#4F46E5" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "10px", fontWeight: 800, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Focus Area
              </p>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "16px", color: "#111" }}>
                Practice by subject to see insights
              </h3>
              <p style={{ color: "#888", fontSize: "13px", marginTop: "4px", lineHeight: 1.5 }}>
                You've done {stats.sessions} mock exam{stats.sessions !== 1 ? "s" : ""}. Try subject-specific practice to get per-subject focus recommendations.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/practice")}
              className="px-4 py-2.5 rounded-xl flex-shrink-0"
              style={{ background: GREEN, color: "white", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "13px" }}
            >
              Practice →
            </motion.button>
          </div>
        </MotionCard>
      </section>
    );
  }

  const color = SUBJECT_COLOR[weakest.subject] ?? "#D97706";
  const bgColor = `${color}18`;

  // All subjects sorted best to worst
  const allSorted = [...subjectAvgs].sort((a, b) => b.avg - a.avg);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 w-full">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} style={{ color: "#D97706" }} />
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "18px", color: "#111" }}>
          Focus Area
        </h2>
        <span style={{ fontSize: "12px", color: "#aaa", marginLeft: "4px" }}>based on your results</span>
      </div>

      <div className="space-y-3">
        {/* Weakest subject highlight */}
        <MotionCard hover3d style={{ background: "white", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: `1.5px solid ${color}22` }}>
          <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bgColor }}>
              <AlertTriangle size={20} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "10px", fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Needs Most Attention
              </p>
              <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "17px", color: "#111" }}>
                {weakest.subject}
              </h3>
              <p style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>
                Your average: <strong style={{ color: weakest.avg < 50 ? "#DC2626" : "#D97706" }}>{weakest.avg}%</strong>
                {" "}· based on {weakest.count} session{weakest.count !== 1 ? "s" : ""}
              </p>
              <div className="mt-3 h-2 rounded-full" style={{ background: "#f0f0f0" }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${weakest.avg}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/practice", { state: { subject: weakest.subject } })}
              className="px-4 py-2.5 rounded-xl flex-shrink-0"
              style={{ background: GREEN, color: "white", fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "13px" }}
            >
              Practice →
            </motion.button>
          </div>
        </MotionCard>

        {/* All subjects mini bar */}
        {allSorted.length > 1 && (
          <MotionCard style={{ background: "white", borderRadius: "20px", padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", fontSize: "13px", marginBottom: "12px" }}>
              All subjects
            </p>
            <div className="space-y-2.5">
              {allSorted.map((s) => {
                const c = SUBJECT_COLOR[s.subject] ?? "#6B7280";
                return (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#333" }}>{s.subject}</span>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: c }}>{s.avg}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#f0f0f0" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.avg}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: c }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </MotionCard>
        )}
      </div>
    </section>
  );
}

// ── Main HomeScreen ───────────────────────────────────────────────────────────
export function HomeScreen() {
  const navigate = useNavigate();
  const { stats } = useUser();
  const hasActivity = stats.sessions > 0;
  const userName = localStorage.getItem("mssn_user_name") || "Student";

  const statItems = [
    { icon: Clock,   label: "Sessions",  value: stats.sessions.toString(),                              color: GREEN },
    { icon: Star,    label: "Avg Score", value: stats.sessions > 0 ? `${stats.avgScore}%` : "—",       color: "#D97706" },
    { icon: Flame,   label: "Streak",    value: stats.streak > 0 ? `${stats.streak}d` : "—",           color: "#DC2626" },
    { icon: Trophy,  label: "Best",      value: stats.sessions > 0 ? `${stats.bestScore}%` : "—",      color: "#7C3AED" },
  ];

  return (
    <PageFade>
      <div className="lg:pl-64 min-h-screen w-full overflow-x-hidden" style={{ background: CREAM, fontFamily: "'Manrope', sans-serif" }}>
        <Navigation />

        {/* ── Hero Carousel ── */}
        <HeroCarousel userName={userName} />

        {/* ── Stats Row ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-6 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statItems.map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-4 flex items-center gap-3"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "18px", color: "#111", lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {!hasActivity && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ textAlign: "center", color: "#bbb", fontSize: "12px", marginTop: "12px" }}>
              Complete your first exam to see your stats
            </motion.p>
          )}
        </section>

        {/* ── Pill Tags ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 w-full">
          <div className="flex flex-wrap gap-2">
            {PILL_TAGS.map(({ label, color }, i) => (
              <motion.span key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200 }}
                className="inline-block px-4 py-2 rounded-full"
                style={{ background: color, color: "white", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "12px" }}>
                {label}
              </motion.span>
            ))}
          </div>
        </section>

        {/* ── Subject Cards ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 w-full">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex items-center justify-between mb-4">
            <div>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "20px", color: "#111" }}>Your Subjects</h2>
              <div className="flex items-center gap-2 mt-1">
                <SquiggleAccent color={GREEN} />
                <p style={{ color: "#888", fontSize: "13px" }}>Tap to practice</p>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/practice")}
              style={{ color: GREEN, fontWeight: 700, fontSize: "13px" }}>
              See all →
            </motion.button>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUBJECT_CARDS.map(({ icon: Icon, label, sublabel, color, bg, subject }, i) => (
              <MotionCard key={label} delay={i} onClick={() => navigate("/practice", { state: { subject } })}
                style={{ background: "white", borderRadius: "20px", padding: "18px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", fontSize: "14px", lineHeight: 1.2 }}>{label}</p>
                <p style={{ fontSize: "11px", color: "#aaa", marginTop: "3px" }}>{sublabel}</p>
              </MotionCard>
            ))}
          </div>
        </section>

        {/* ── Focus Area (real-time) ── */}
        <FocusArea />

        {/* ── Recent Sessions ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "20px", color: "#111" }}>Recent Sessions</h2>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate("/reports")}
              style={{ color: GREEN, fontWeight: 700, fontSize: "13px" }}>
              View All →
            </motion.button>
          </div>

          {stats.history.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-3xl p-8 text-center" style={{ background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${GREEN}15` }}>
                <BookOpen size={26} style={{ color: GREEN }} />
              </div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "#111", fontSize: "16px" }}>No sessions yet</p>
              <p style={{ color: "#aaa", fontSize: "13px", marginTop: "4px" }}>Complete your first exam to see results here</p>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/pre-exam", { state: { mode: "mock" } })}
                className="mt-5 px-6 py-3 rounded-2xl font-bold text-sm"
                style={{ background: GREEN, color: "white", fontFamily: "'Manrope', sans-serif" }}>
                Take Your First Exam →
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {stats.history.slice(0, 5).map((rec, i) => {
                const pct = Math.round((rec.score / rec.total) * 100);
                const pass = pct >= 60;
                return (
                  <MotionCard key={i} delay={i}
                    style={{ background: "white", borderRadius: "18px", padding: "16px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: pass ? `${GREEN}15` : "#fdecea" }}>
                        <TrendingUp size={18} style={{ color: pass ? GREEN : "#DC2626" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontWeight: 700, color: "#111", fontSize: "14px" }} className="truncate">
                          {rec.mode === "mock" ? "Full Mock Exam" : `${rec.subject || "Practice"} Session`}
                        </p>
                        <p style={{ color: "#aaa", fontSize: "12px" }}>{rec.date}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "18px", color: pass ? GREEN : "#DC2626" }}>
                          {pct}%
                        </p>
                        <p style={{ fontSize: "11px", color: "#aaa" }}>{rec.score}/{rec.total}</p>
                      </div>
                    </div>
                  </MotionCard>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Testimonials ── */}
        <TestimonialsSection />

        <div className="h-8 lg:h-2" />
      </div>
    </PageFade>
  );
}
