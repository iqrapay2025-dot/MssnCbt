import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import mssnLogo from "../../imports/mssn_logo-removebg-preview__3_.png";

const HERO_IMG = "https://images.unsplash.com/photo-1513258496099-48168024aec0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";
const MOCKUP_IMG = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600";

const ORANGE = "#F97316";
const NAVY = "#0F172A";
const AMBER = "#FBBF24";

const FEATURES = [
  {
    icon: "📚",
    color: "#14B8A6",
    title: "Free Study Material",
    desc: "Specially curated practice questions created by our experienced instructors and teachers.",
  },
  {
    icon: "🏆",
    color: "#F97316",
    title: "High-quality Mock Exams",
    desc: "Exams are prepared by highly qualified group of education experts and UNILORIN alumni.",
  },
  {
    icon: "📊",
    color: "#EC4899",
    title: "Report Card",
    desc: "Students will receive detailed performance analysis reports after every session.",
  },
  {
    icon: "🥇",
    color: "#FBBF24",
    title: "Awards",
    desc: "Top-ranked students on the leaderboard receive recognition badges and certificates.",
  },
  {
    icon: "🕐",
    color: "#8B5CF6",
    title: "24/7 Support",
    desc: "We are always here to answer your questions and guide your preparation journey.",
  },
];

const STATS = [
  { value: "1.5k", label: "Students" },
  { value: "4", label: "Subjects" },
  { value: "100+", label: "Topics" },
];

function NavBar({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "Exam Center", href: "/login" },
    { label: "Practice", href: "/login" },
    { label: "Leaderboard", href: "/login" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-12 py-4"
      style={{ background: "white", borderBottom: "1px solid #f0f0f0", boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => navigate("/")}
        aria-label="MSSN CBT Home"
      >
        <img
          src={mssnLogo}
          alt="MSSN UNILORIN"
          style={{ width: 44, height: 44, objectFit: "contain" }}
        />
        <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "15px", color: NAVY }}>
          MSSN<span style={{ color: ORANGE }}>CBT</span>
        </span>
      </motion.div>

      {/* Desktop Links */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="hidden md:flex items-center gap-8"
      >
        {links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "14px", color: "#374151", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = ORANGE)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
          >
            {label}
          </a>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(249,115,22,0.4)" }}
          whileTap={{ scale: 0.97 }}
          onClick={onLogin}
          className="px-5 py-2.5 rounded-full font-bold text-sm hidden md:block"
          style={{
            background: ORANGE,
            color: "white",
            fontFamily: "'Manrope', sans-serif",
            boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
          }}
        >
          Get started
        </motion.button>
        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="w-5 h-0.5 bg-gray-600 mb-1" />
          <div className="w-5 h-0.5 bg-gray-600 mb-1" />
          <div className="w-5 h-0.5 bg-gray-600" />
        </button>
      </motion.div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-6 md:hidden"
          style={{ borderTop: "1px solid #f0f0f0" }}
        >
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="block py-2.5"
              style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "15px", color: "#374151" }}
            >
              {label}
            </a>
          ))}
          <button
            onClick={onLogin}
            className="mt-3 w-full py-3 rounded-full font-bold text-sm"
            style={{ background: ORANGE, color: "white", fontFamily: "'Manrope', sans-serif" }}
          >
            Get started
          </button>
        </div>
      )}
    </nav>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const goLogin = () => navigate("/login");

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: "#fff", overflowX: "hidden" }}>

      {/* ── Announcement Bar ─────────────────────────────────── */}
      <div
        className="w-full text-center py-2.5 px-4"
        style={{ background: AMBER }}
      >
        <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "13px", color: "#111" }}>
          🎉 2024–2025 Post-UTME Registration is open! Start practicing today.{" "}
          <button
            onClick={goLogin}
            style={{ textDecoration: "underline", fontWeight: 900, color: NAVY, background: "none", border: "none", cursor: "pointer" }}
          >
            Enroll Today →
          </button>
        </p>
      </div>

      {/* ── Navbar ───────────────────────────────────────────── */}
      <NavBar onLogin={goLogin} />

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "#fff", minHeight: "88vh", display: "flex", alignItems: "center" }}>
        {/* Decorative bg circles */}
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "rgba(249,115,22,0.06)" }}
        />
        <div
          className="absolute top-40 -left-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "rgba(20,184,166,0.07)" }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 w-full grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — Text */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: "13px", fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}
            >
              MSSN UNILORIN · CBT PLATFORM
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "clamp(32px, 4.5vw, 52px)",
                fontWeight: 400,
                color: NAVY,
                lineHeight: 1.18,
                marginBottom: "8px",
              }}
            >
              Curated questions for
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "clamp(32px, 4.5vw, 52px)",
                fontWeight: 900,
                color: NAVY,
                lineHeight: 1.18,
                marginBottom: "24px",
              }}
            >
              Post-UTME excellence
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{ color: "#6B7280", fontSize: "15px", lineHeight: 1.7, maxWidth: "440px", marginBottom: "32px" }}
            >
              Best platform to ace your UNILORIN Post-UTME. Top-quality practice questions curated by experienced instructors and UNILORIN alumni.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 28px rgba(249,115,22,0.4)" }}
                whileTap={{ scale: 0.97 }}
                onClick={goLogin}
                className="px-7 py-3.5 rounded-full font-bold text-base"
                style={{
                  background: ORANGE,
                  color: "white",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  boxShadow: "0 6px 20px rgba(249,115,22,0.3)",
                }}
              >
                Get started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="px-7 py-3.5 rounded-full border-2 font-bold text-base"
                style={{ borderColor: "#E5E7EB", color: NAVY, fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
              >
                Sign in
              </motion.button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42 }}
              className="flex items-center gap-8"
            >
              {STATS.map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-3">
                  {i > 0 && <div className="h-8 w-px" style={{ background: "#E5E7EB" }} />}
                  <div style={i > 0 ? { paddingLeft: "0" } : {}}>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "22px", color: NAVY }}>{value}</p>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>{label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Illustration composition */}
          <div className="relative flex items-center justify-center">
            {/* Pink/coral blob */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute"
              style={{
                width: "420px",
                height: "420px",
                borderRadius: "60% 40% 70% 30% / 50% 60% 40% 70%",
                background: "linear-gradient(135deg, #FDE68A 0%, #FCA5A5 40%, #F9A8D4 100%)",
                right: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 0,
                opacity: 0.35,
              }}
            />

            {/* Teal blob */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="absolute"
              style={{
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "rgba(20,184,166,0.15)",
                left: "0",
                top: "60%",
                zIndex: 0,
              }}
            />

            {/* Student Photo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="relative z-10"
              style={{ borderRadius: "24px", overflow: "hidden", width: "340px", height: "420px", boxShadow: "0 24px 64px rgba(0,0,0,0.12)" }}
            >
              <img
                src={HERO_IMG}
                alt="Student studying"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
              {/* Colorful overlay shimmer */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, transparent 60%, rgba(249,115,22,0.08) 100%)",
                }}
              />
            </motion.div>

            {/* Floating cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              style={{
                position: "absolute",
                top: "8%",
                right: "-10px",
                background: "white",
                borderRadius: "16px",
                padding: "12px 16px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: "150px",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#FDE68A", fontSize: "20px" }}
              >
                🏆
              </div>
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "16px", color: NAVY }}>100+</p>
                <p style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 600 }}>Practice Topics</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              style={{
                position: "absolute",
                bottom: "12%",
                left: "-5px",
                background: "white",
                borderRadius: "16px",
                padding: "10px 14px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "#BFDBFE", fontSize: "16px" }}
              >
                👥
              </div>
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "13px", color: NAVY }}>1.5k Students</p>
                <p style={{ fontSize: "9px", color: "#9CA3AF" }}>Active learners</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{
                position: "absolute",
                top: "42%",
                right: "-24px",
                background: ORANGE,
                borderRadius: "12px",
                padding: "10px 14px",
                boxShadow: "0 8px 24px rgba(249,115,22,0.35)",
                zIndex: 20,
              }}
            >
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "13px", color: "white" }}>76% Avg Score</p>
              <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.8)" }}>Platform average</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Dark Features Band ────────────────────────────────── */}
      <section style={{ background: NAVY, padding: "72px 0" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {FEATURES.map(({ icon, color, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: `0 20px 40px rgba(0,0,0,0.3)` }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "28px 22px",
                  backdropFilter: "blur(10px)",
                  cursor: "default",
                }}
              >
                <motion.div
                  animate={{ rotateY: [0, 15, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${color}25`, fontSize: "24px" }}
                >
                  {icon}
                </motion.div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "14px", color: "white", marginBottom: "8px" }}>
                  {title}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Section ────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "96px 0" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: "12px", fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}
            >
              ABOUT US
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(24px, 3vw, 36px)",
                color: NAVY,
                lineHeight: 1.25,
                marginBottom: "32px",
              }}
            >
              A platform to revolutionize the experience of online Post-UTME participation
            </motion.h2>

            {/* Testimonial quote */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                borderLeft: `4px solid ${ORANGE}`,
                paddingLeft: "20px",
                marginBottom: "24px",
              }}
            >
              <p style={{ fontSize: "15px", color: "#374151", fontStyle: "italic", lineHeight: 1.7, marginBottom: "12px" }}>
                "The MSSN CBT platform is the best tool I've used for Post-UTME prep. The timed mock exams feel exactly like the real thing at the CBT center!"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: `${ORANGE}20`, fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: ORANGE, fontSize: "14px" }}
                >
                  A
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: "13px", color: NAVY }}>Aisha Abdullahi</p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF" }}>100 Level Student, UNILORIN</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right */}
          <div>
            {[
              {
                text: "The MSSN UNILORIN CBT Practice Platform is the most comprehensive Post-UTME preparation tool available. Our question bank covers all four subjects tested in the actual exam: English Language, Mathematics, Current Affairs, and General Knowledge.",
              },
              {
                text: "It has not only fully replicated the actual UNILORIN Post-UTME exam interface, but also provides detailed explanations and step-by-step solutions after every session — helping students understand their mistakes and improve rapidly.",
              },
              {
                text: "Our platform is regularly updated with fresh questions by qualified educators, and our leaderboard system keeps students motivated by tracking progress against their peers across the entire community.",
              },
            ].map(({ text }, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ color: "#6B7280", fontSize: "14px", lineHeight: 1.8, marginBottom: "20px" }}
              >
                {text}
              </motion.p>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3 mt-6"
            >
              {["JAMB Prep", "Post-UTME", "4 Subjects", "CBT Ready", "Free Access"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: `${ORANGE}12`, color: ORANGE, border: `1px solid ${ORANGE}25` }}
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────── */}
      <section style={{ background: NAVY, padding: "96px 0", position: "relative", overflow: "hidden" }}>
        {/* Decorative shapes */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(249,115,22,0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "10%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(20,184,166,0.06)",
            pointerEvents: "none",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: "11px", fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "16px" }}
            >
              ENHANCED LEARNING
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(28px, 3.5vw, 44px)",
                color: "white",
                lineHeight: 1.2,
                marginBottom: "20px",
              }}
            >
              Start today,
              <br />
              and stand out
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.8, maxWidth: "400px", marginBottom: "16px" }}
            >
              Join over 1,500 students who are already preparing smarter for their UNILORIN Post-UTME exam. Our timed mock sessions replicate the real CBT experience at the exam center.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: 1.8, maxWidth: "400px", marginBottom: "36px" }}
            >
              It's important to be familiar with the system — particularly with the release of updated exam packages. Practice consistently and you will score higher.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, boxShadow: "0 12px 32px rgba(249,115,22,0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={goLogin}
              className="px-8 py-4 rounded-full font-bold text-base"
              style={{
                background: ORANGE,
                color: "white",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                boxShadow: "0 6px 24px rgba(249,115,22,0.35)",
              }}
            >
              Get started
            </motion.button>
          </div>

          {/* Right — App mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            {/* Main mockup frame */}
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "24px",
                padding: "4px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
              }}
            >
              <div
                style={{
                  background: "#1E293B",
                  borderRadius: "20px",
                  overflow: "hidden",
                  height: "360px",
                  position: "relative",
                }}
              >
                <img
                  src={MOCKUP_IMG}
                  alt="CBT Platform"
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
                />
                {/* Overlay UI elements to simulate app */}
                <div style={{ position: "absolute", inset: 0, padding: "20px" }}>
                  {/* Mock top bar */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "10px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <span style={{ color: "white", fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "13px" }}>⏱ 24:30</span>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>Question 12/50</span>
                    <span style={{ background: ORANGE, color: "white", borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 700 }}>Submit</span>
                  </div>
                  {/* Mock question */}
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "12px", padding: "14px", marginBottom: "12px" }}>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", lineHeight: 1.5 }}>
                      Which of the following is an antonym of 'GREGARIOUS'?
                    </p>
                  </div>
                  {/* Mock options */}
                  <div className="grid grid-cols-2 gap-2">
                    {["A. Sociable", "B. Outgoing", "C. Reclusive ✓", "D. Friendly"].map((opt, i) => (
                      <div
                        key={i}
                        style={{
                          background: i === 2 ? "rgba(249,115,22,0.25)" : "rgba(255,255,255,0.06)",
                          border: i === 2 ? `1px solid ${ORANGE}` : "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "10px",
                          padding: "8px 12px",
                          color: i === 2 ? ORANGE : "rgba(255,255,255,0.6)",
                          fontSize: "11px",
                          fontWeight: i === 2 ? 800 : 500,
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  {/* Mock navigator */}
                  <div style={{ position: "absolute", bottom: "16px", right: "16px", display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "120px" }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          background: i < 8 ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.12)",
                          fontSize: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating mini cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "-20px",
                left: "-20px",
                background: "white",
                borderRadius: "14px",
                padding: "12px 16px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px" }}>🎯</span>
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "13px", color: NAVY }}>88% Score</p>
                <p style={{ fontSize: "9px", color: "#9CA3AF" }}>Latest session</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              style={{
                position: "absolute",
                bottom: "-16px",
                right: "-16px",
                background: "white",
                borderRadius: "14px",
                padding: "10px 14px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>📈</span>
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "12px", color: NAVY }}>+14% improvement</p>
                <p style={{ fontSize: "9px", color: "#9CA3AF" }}>vs last month</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer Bar ───────────────────────────────────────── */}
      <footer style={{ background: AMBER, padding: "20px 0" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: NAVY }}
            >
              <span style={{ color: "white", fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "13px" }}>M</span>
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "14px", color: NAVY }}>
              MSSN UNILORIN CBT
            </span>
          </div>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: "12px", color: "#111", fontWeight: 600 }}>
            © {new Date().getFullYear()} MSSN Unilorin · All rights reserved · Built with ❤️ for students
          </p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a key={link} href="#" style={{ fontSize: "12px", fontWeight: 700, color: NAVY, textDecoration: "none" }}>
                {link}
              </a>
            ))}
            <a
              href="/admin"
              style={{ fontSize: "11px", fontWeight: 700, color: "rgba(0,0,0,0.35)", textDecoration: "none" }}
              title="Admin Portal — PIN required"
            >
              Admin Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
