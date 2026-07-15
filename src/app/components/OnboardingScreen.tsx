import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import mssnLogo from "../../imports/mssn_logo-removebg-preview__3_.png";

const ORANGE = "#F97316";
const NAVY = "#0F172A";
const AMBER = "#FBBF24";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

const STATS_FLOAT = [
  { emoji: "📚", label: "1,500+", sub: "Students enrolled", top: "12%", left: "5%", delay: 0.5 },
  { emoji: "🏆", label: "89%", sub: "Avg. pass rate", top: "52%", right: "5%", delay: 0.7 },
  { emoji: "⭐", label: "4.9/5", sub: "Student rating", bottom: "18%", left: "8%", delay: 0.9 },
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName =
      mode === "signup" && form.name.trim()
        ? form.name.trim()
        : form.email.split("@")[0] || "Student";
    localStorage.setItem("mssn_user_name", displayName);
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Manrope', sans-serif", background: "#fff" }}>

      {/* ── LEFT: Form Panel ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[46%] flex flex-col justify-center px-8 sm:px-14 py-12 overflow-y-auto">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-3 mb-10"
        >
          <img src={mssnLogo} alt="MSSN UNILORIN" style={{ width: 52, height: 52, objectFit: "contain" }} />
          <div>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "15px", color: NAVY, display: "block" }}>
              MSSN<span style={{ color: ORANGE }}>CBT</span>
            </span>
            <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600 }}>Post-UTME Practice</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mb-6"
        >
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "26px", color: NAVY, marginBottom: "6px" }}>
            {mode === "signin" ? "Welcome Back!" : "Create Account"}
          </h1>
          <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: 1.55 }}>
            {mode === "signin"
              ? "Sign in to access your dashboard and continue exam preparation."
              : "Join 1,500+ students preparing for UNILORIN Post-UTME."}
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex rounded-xl p-1 mb-6"
          style={{ background: "#F3F4F6" }}
        >
          {(["signin", "signup"] as const).map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode(tab)}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: mode === tab ? "white" : "transparent",
                color: mode === tab ? NAVY : "#9CA3AF",
                fontFamily: "'Manrope', sans-serif",
                boxShadow: mode === tab ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {tab === "signin" ? "Sign In" : "Sign Up"}
            </motion.button>
          ))}
        </motion.div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {mode === "signup" && (
              <div>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
                    style={{ borderColor: "#E5E7EB", fontSize: "14px", fontFamily: "'Manrope', sans-serif" }}
                    onFocus={(e) => (e.target.style.borderColor = ORANGE)}
                    onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
                  style={{ borderColor: "#E5E7EB", fontSize: "14px", fontFamily: "'Manrope', sans-serif" }}
                  onFocus={(e) => (e.target.style.borderColor = ORANGE)}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border outline-none transition-all"
                  style={{ borderColor: "#E5E7EB", fontSize: "14px", fontFamily: "'Manrope', sans-serif" }}
                  onFocus={(e) => (e.target.style.borderColor = ORANGE)}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF" }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === "signin" && (
              <div className="flex justify-end">
                <button type="button" style={{ fontSize: "13px", color: ORANGE, fontWeight: 700 }}>
                  Forgot Password?
                </button>
              </div>
            )}

            <motion.button
              type="submit"
              whileHover={{ opacity: 0.9, boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-full text-white"
              style={{
                background: ORANGE,
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
              }}
            >
              {mode === "signin" ? "Sign In" : "Create Account"}
            </motion.button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
              <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>OR</span>
              <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
            </div>

            <motion.button
              type="button"
              whileHover={{ background: "#f9fafb" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { localStorage.setItem("mssn_user_name", "Google User"); navigate("/home"); }}
              className="w-full py-3 rounded-full border flex items-center justify-center gap-3 transition-all"
              style={{
                borderColor: "#E5E7EB",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                color: "#374151",
                background: "#ffffff",
              }}
            >
              <GoogleLogo />
              Continue with Google
            </motion.button>
          </motion.form>
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => { localStorage.setItem("mssn_user_name", "Guest"); navigate("/home"); }}
          className="mt-4 w-full py-2.5 rounded-full text-sm border transition-all"
          style={{ borderColor: "#E5E7EB", color: "#9CA3AF", fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}
        >
          Continue as Guest (Demo)
        </motion.button>
      </div>

      {/* ── RIGHT: Hero Visual Panel ──────────────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden" style={{ background: NAVY }}>

        {/* Background exam photo */}
        <img
          src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=900&auto=format&fit=crop"
          alt="Computer exam"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.25 }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(155deg, ${NAVY}cc 0%, ${NAVY}ee 60%, ${NAVY}ff 100%)`,
          }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: `rgba(249,115,22,0.08)` }} />
        <div className="absolute bottom-20 -left-20 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: `rgba(20,184,166,0.06)` }} />

        {/* Floating stat cards */}
        {STATS_FLOAT.map(({ emoji, label, sub, top, left, right, bottom, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { delay, duration: 0.5 },
              scale: { delay, duration: 0.5 },
              y: { delay, duration: 3 + delay, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute z-20 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.15)",
              top, left, right, bottom,
            }}
          >
            <span style={{ fontSize: "22px" }}>{emoji}</span>
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "white", fontSize: "15px" }}>{label}</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{sub}</p>
            </div>
          </motion.div>
        ))}

        {/* Main content */}
        <div className="relative z-10 flex flex-col justify-between h-full px-12 py-14">

          {/* Top: Logo + Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p style={{ fontSize: "12px", fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "20px" }}>
              MSSN UNILORIN · CBT PLATFORM
            </p>
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 900,
                fontSize: "42px",
                color: "white",
                lineHeight: 1.1,
                marginBottom: "18px",
              }}
            >
              Ace Your UNILORIN<br />
              <span style={{ color: ORANGE }}>Post-UTME Exam</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.65, maxWidth: "380px" }}>
              Practice with CBT-style questions, track your performance, and walk into the exam hall fully prepared.
            </p>
          </motion.div>

          {/* Middle: Testimonial card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              borderLeft: `4px solid ${ORANGE}`,
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "15px", lineHeight: 1.65, fontStyle: "italic", marginBottom: "14px" }}>
              "The MSSN CBT platform is the best tool I've used for Post-UTME prep. The timed mock exams feel exactly like the real thing!"
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: `${ORANGE}25`, fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: ORANGE, fontSize: "14px" }}
              >
                A
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: "13px", color: "white" }}>Aisha Abdullahi</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>100 Level Student, UNILORIN</p>
              </div>
            </div>
          </motion.div>

          {/* Bottom: Feature tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.6 }}
          >
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
              Trusted by students
            </p>
            <div className="flex flex-wrap gap-3">
              {["JAMB Approved", "UNILORIN Ready", "MSSN Certified", "CBT Format", "50 Questions"].map((tag) => (
                <div
                  key={tag}
                  className="px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}
                >
                  <span style={{ color: ORANGE, fontSize: "12px", fontWeight: 700 }}>{tag}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
