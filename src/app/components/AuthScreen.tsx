import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail, Phone, Lock, Eye, EyeOff, User,
  ChevronLeft, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { useAuth, supabase } from "../context/AuthContext";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import mssnLogo from "../../imports/mssn_logo-removebg-preview__3_.png";

const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-1943a64d`;
const GREEN = "#1F4E3D";
const ORANGE = "#F97316";
const NAVY = "#0F172A";

export type AuthView = "welcome" | "signup" | "login" | "forgot" | "success" | "reset";
type Method = "email" | "phone";

interface AuthScreenProps {
  initialView?: AuthView;
}

// ── Utilities ──────────────────────────────────────────────────────────────────

function normalizePhone(input: string): string {
  const clean = input.replace(/[\s\-().]/g, "");
  if (clean.startsWith("+234")) return clean;
  if (clean.startsWith("234")) return `+${clean}`;
  if (clean.startsWith("0")) return `+234${clean.slice(1)}`;
  return `+234${clean}`;
}

function phoneToSyntheticEmail(phone: string): string {
  const norm = normalizePhone(phone);
  return `${norm.slice(1)}@phone.mssncbt.ng`;
}

function validateEmail(v: string): string {
  if (!v.trim()) return "Email address is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Enter a valid email address";
  return "";
}

function validatePhone(v: string): string {
  if (!v.trim()) return "Phone number is required";
  if (!/^\+234[789]\d{9}$/.test(normalizePhone(v))) {
    return "Enter a valid Nigerian phone number (e.g. 08012345678)";
  }
  return "";
}

function validatePassword(v: string): string {
  if (!v) return "Password is required";
  if (v.length < 8) return "Password must be at least 8 characters";
  return "";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mt-1.5" role="alert">
      <AlertCircle size={12} style={{ color: "#DC2626", flexShrink: 0 }} aria-hidden="true" />
      <p style={{ fontSize: "12px", color: "#DC2626" }}>{children}</p>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  error?: string;
  right?: React.ReactNode;
  autoComplete?: string;
  id?: string;
}

function InputField({ label, type, value, onChange, placeholder, icon, error, right, autoComplete, id }: InputFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
  const borderColor = error ? "#DC2626" : "#E5E7EB";
  return (
    <div>
      <label
        htmlFor={fieldId}
        style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} aria-hidden="true">
          {icon}
        </div>
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          aria-invalid={!!error}
          className="w-full pl-10 py-3 rounded-xl border outline-none"
          style={{
            paddingRight: right ? "44px" : "16px",
            borderColor,
            fontSize: "14px",
            fontFamily: "'Manrope', sans-serif",
            background: "white",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? "#DC2626" : ORANGE;
            e.target.style.boxShadow = `0 0 0 3px ${error ? "#DC2626" : ORANGE}20`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = borderColor;
            e.target.style.boxShadow = "none";
          }}
        />
        {right && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{right}</div>
        )}
      </div>
      {error && <ErrorMsg><span id={`${fieldId}-error`}>{error}</span></ErrorMsg>}
    </div>
  );
}

interface PhoneInputProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  id?: string;
}

function PhoneInputField({ value, onChange, error, id = "phone" }: PhoneInputProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? "#DC2626" : focused ? ORANGE : "#E5E7EB";
  return (
    <div>
      <label
        htmlFor={id}
        style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}
      >
        Phone Number
      </label>
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ border: `1px solid ${borderColor}`, transition: "border-color 0.15s, box-shadow 0.15s", boxShadow: focused ? `0 0 0 3px ${borderColor}20` : "none" }}
      >
        <div
          className="flex items-center gap-1.5 px-3 flex-shrink-0"
          style={{ background: "#F9FAFB", borderRight: `1px solid ${borderColor}` }}
          aria-hidden="true"
        >
          <span style={{ fontSize: "15px" }}>🇳🇬</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#374151" }}>+234</span>
        </div>
        <input
          id={id}
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="08012345678"
          autoComplete="tel"
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          className="flex-1 px-4 py-3 outline-none bg-white"
          style={{ fontSize: "14px", fontFamily: "'Manrope', sans-serif" }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
      {error && <ErrorMsg><span id={`${id}-error`}>{error}</span></ErrorMsg>}
    </div>
  );
}

function MethodTabs({ method, setMethod }: { method: Method; setMethod: (m: Method) => void }) {
  return (
    <div
      className="flex rounded-xl p-1 mb-5"
      style={{ background: "#F3F4F6" }}
      role="tablist"
      aria-label="Sign in method"
    >
      {(["email", "phone"] as Method[]).map((m) => (
        <motion.button
          key={m}
          type="button"
          role="tab"
          aria-selected={method === m}
          whileTap={{ scale: 0.97 }}
          onClick={() => setMethod(m)}
          className="flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
          style={{
            background: method === m ? "white" : "transparent",
            color: method === m ? NAVY : "#9CA3AF",
            fontFamily: "'Manrope', sans-serif",
            boxShadow: method === m ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "background 0.2s, color 0.2s",
            border: "none",
            cursor: "pointer",
          }}
        >
          {m === "email" ? <Mail size={14} aria-hidden="true" /> : <Phone size={14} aria-hidden="true" />}
          {m === "email" ? "Email" : "Phone Number"}
        </motion.button>
      ))}
    </div>
  );
}

function SubmitButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={loading ? {} : { opacity: 0.92, boxShadow: "0 8px 24px rgba(249,115,22,0.38)" }}
      whileTap={loading ? {} : { scale: 0.98 }}
      className="w-full py-3.5 rounded-full text-white flex items-center justify-center gap-2 mt-1"
      style={{
        background: loading ? "#FDA97B" : ORANGE,
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 700,
        fontSize: "15px",
        boxShadow: "0 4px 16px rgba(249,115,22,0.28)",
        cursor: loading ? "not-allowed" : "pointer",
        border: "none",
      }}
      aria-busy={loading}
    >
      {loading ? (
        <><Loader2 size={17} className="animate-spin" aria-hidden="true" /> Processing…</>
      ) : children}
    </motion.button>
  );
}

function ServerError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div
      className="flex items-start gap-2.5 p-3.5 rounded-xl"
      style={{ background: "#FEE2E2" }}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle size={15} style={{ color: "#DC2626", flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
      <p style={{ fontSize: "13px", color: "#DC2626", lineHeight: 1.5 }}>{msg}</p>
    </div>
  );
}

// ── Right panel (desktop only) ─────────────────────────────────────────────────

const STATS = [
  { emoji: "📚", val: "1,500+", sub: "Students enrolled", style: { top: "10%", left: "5%" }, delay: 0.5 },
  { emoji: "🏆", val: "89%", sub: "Avg. pass rate", style: { top: "48%", right: "4%" }, delay: 0.7 },
  { emoji: "⭐", val: "4.9/5", sub: "Student rating", style: { bottom: "22%", left: "5%" }, delay: 0.9 },
];

function RightPanel() {
  return (
    <div
      className="hidden lg:flex flex-1 flex-col relative overflow-hidden"
      style={{ background: NAVY }}
      aria-hidden="true"
    >
      <img
        src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=900&auto=format&fit=crop"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.15 }}
      />
      <div className="absolute inset-0" style={{ background: `linear-gradient(155deg, ${NAVY}cc 0%, ${NAVY}f0 60%, ${NAVY} 100%)` }} />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(249,115,22,0.08)" }} />
      <div className="absolute bottom-16 -left-16 w-60 h-60 rounded-full pointer-events-none" style={{ background: "rgba(20,184,166,0.06)" }} />

      {STATS.map(({ emoji, val, sub, style, delay }) => (
        <motion.div
          key={val}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { delay, duration: 0.5 },
            scale: { delay, duration: 0.5 },
            y: { delay: delay + 0.5, duration: 3 + delay, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute z-20 px-4 py-3 rounded-2xl flex items-center gap-3"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.15)",
            ...style,
          }}
        >
          <span style={{ fontSize: "22px" }}>{emoji}</span>
          <div>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "white", fontSize: "15px" }}>{val}</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{sub}</p>
          </div>
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col justify-between h-full px-12 py-14">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)", padding: "6px" }}>
              <img src={mssnLogo} alt="MSSN UNILORIN" style={{ width: 36, height: 36, objectFit: "contain" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, color: "white", fontSize: "14px" }}>
                MSSN <span style={{ color: ORANGE }}>CBT</span>
              </p>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Post-UTME Practice Platform</p>
            </div>
          </div>
          <p style={{ fontSize: "11px", fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "14px" }}>
            MSSN UNILORIN · CBT PLATFORM
          </p>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "36px", color: "white", lineHeight: 1.15, marginBottom: "14px" }}>
            Ace Your UNILORIN<br /><span style={{ color: ORANGE }}>Post-UTME Exam</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.7, maxWidth: "360px" }}>
            Practice with CBT-style questions, track your performance, and walk into the exam hall fully prepared.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.4 }}
          className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", borderLeft: `4px solid ${ORANGE}` }}
        >
          <p style={{ color: "rgba(255,255,255,0.88)", fontSize: "14px", lineHeight: 1.7, fontStyle: "italic", marginBottom: "14px" }}>
            "The MSSNUIL CBT platform is the best tool I've used for Post-UTME prep. The timed mock exams feel exactly like the real thing!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${ORANGE}28`, fontFamily: "'Poppins', sans-serif", fontWeight: 900, color: ORANGE, fontSize: "14px" }}>
              A
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: "13px", color: "white" }}>Aisha Abdullahi</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>100 Level Student, UNILORIN</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.6 }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
            Trusted by students
          </p>
          <div className="flex flex-wrap gap-2">
            {["JAMB Approved", "UNILORIN Ready", "MSSN Certified", "CBT Format", "50 Questions"].map((tag) => (
              <div key={tag} className="px-3 py-1.5 rounded-full" style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}>
                <span style={{ color: ORANGE, fontSize: "11px", fontWeight: 700 }}>{tag}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Main AuthScreen ────────────────────────────────────────────────────────────

export function AuthScreen({ initialView = "welcome" }: AuthScreenProps) {
  const navigate = useNavigate();
  const { user, isGuest, loading: authLoading, continueAsGuest } = useAuth();

  const [view, setView] = useState<AuthView>(initialView);
  const [method, setMethod] = useState<Method>("email");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupAgreed, setSignupAgreed] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Reset password state (after recovery link)
  const [resetPass, setResetPass] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [showResetPass, setShowResetPass] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Success state
  const [successName, setSuccessName] = useState("");

  // Redirect after auth — admin goes to /admin, others to /home
  const redirectAfterAuth = (uid: string) => {
    try{
    supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .single()
      .then(({ data }) => navigate(data?.role === "admin" ? "/admin" : "/home", { replace: true }))
    } catch {
      navigate("/home", { replace: true })
    }
  };


  // Redirect if already authenticated
  useEffect(() => {
    if (authLoading) return;
    if (isGuest) { navigate("/home", { replace: true }); return; }
    if (user) { redirectAfterAuth(user.id); }
  }, [user, isGuest, authLoading, navigate]);

  // Detect Supabase password-recovery redirect
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setView("reset");
    });
    return () => subscription.unsubscribe();
  }, []);

  function resetErrors() {
    setFieldErrors({});
    setServerError("");
  }

  function goTo(v: AuthView) {
    resetErrors();
    setView(v);
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!signupName.trim()) errs.name = "Full name is required";
    if (method === "email") {
      const err = validateEmail(signupEmail);
      if (err) errs.email = err;
    } else {
      const err = validatePhone(signupPhone);
      if (err) errs.phone = err;
    }
    const passErr = validatePassword(signupPassword);
    if (passErr) errs.password = passErr;
    if (signupPassword && signupPassword !== signupConfirm) errs.confirm = "Passwords do not match";
    if (!signupAgreed) errs.terms = "You must agree to the Terms & Conditions to continue";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setFieldErrors({});
    setServerError("");
    setLoading(true);
    try {
      const authEmail = method === "email"
        ? signupEmail.trim().toLowerCase()
        : phoneToSyntheticEmail(signupPhone);

      // Use supabase.auth.signUp directly — no edge function needed.
      // Requires "Confirm email" to be OFF in Supabase Dashboard → Auth → Settings.
      const { error: signUpErr } = await supabase.auth.signUp({
        email: authEmail,
        password: signupPassword,
        options: {
          data: {
            name: signupName.trim(),
            ...(method === "phone" ? { phone: signupPhone } : {}),
          },
        },
      });

      if (signUpErr) {
        const msg = signUpErr.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("email address already")) {
          setServerError("This email or phone is already registered. Try logging in instead.");
        } else {
          setServerError(signUpErr.message);
        }
        return;
      }

      // Immediately sign in — works when Supabase "Confirm email" is disabled
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: signupPassword,
      });

      if (signInErr) {
        // "Confirm email" is likely ON — account exists but needs email verification
        setServerError("Account created! Check your email for a confirmation link, then log in.");
        goTo("login");
        return;
      }

      setSuccessName(signupName.trim());
      goTo("success");
      setTimeout(() => navigate("/home"), 2600);
    } catch {
      setServerError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (method === "email") {
      const err = validateEmail(loginEmail);
      if (err) errs.email = err;
    } else {
      const err = validatePhone(loginPhone);
      if (err) errs.phone = err;
    }
    if (!loginPassword) errs.password = "Password is required";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setFieldErrors({});
    setServerError("");
    setLoading(true);
    try {
      const authEmail = method === "email"
        ? loginEmail.trim().toLowerCase()
        : phoneToSyntheticEmail(loginPhone);
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: loginPassword });
      if (error) {
        // Generic error — do not hint whether it was the email/phone or the password
        setServerError("Incorrect email/phone or password. Please try again.");
        return;
      }
      if (signInData.user) redirectAfterAuth(signInData.user.id);
    } catch {
      setServerError("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "phone") {
      setServerError("Password reset via phone is not yet available. Please use your email address or contact support.");
      return;
    }
    const emailErr = validateEmail(forgotEmail);
    if (emailErr) { setFieldErrors({ email: emailErr }); return; }
    setFieldErrors({});
    setServerError("");
    setLoading(true);
    try {
      // resetPasswordForEmail uses Supabase's built-in SMTP to actually deliver the email.
      // generateLink (admin API) only creates a token — it never sends anything.
      await supabase.auth.resetPasswordForEmail(forgotEmail.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      });
      // Always show success state — never reveal whether the email exists (anti-enumeration)
      setForgotSent(true);
    } catch {
      setServerError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const passErr = validatePassword(resetPass);
    if (passErr) errs.password = passErr;
    if (resetPass && resetPass !== resetConfirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setServerError("");
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.auth.updateUser({ password: resetPass });
      if (error) { setServerError(error.message); return; }
      setSuccessName(
        (userData.user?.user_metadata?.name as string | undefined)?.trim() ||
        userData.user?.email?.split("@")[0] ||
        "Student"
      );
      goTo("success");
      setTimeout(() => navigate("/home"), 2600);
    } catch {
      setServerError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── View renders ─────────────────────────────────────────────────────────────

  const BackBtn = ({ to, label = "Back" }: { to: AuthView; label?: string }) => (
    <button
      type="button"
      onClick={() => goTo(to)}
      className="flex items-center gap-1.5 mb-6"
      style={{ color: "#6B7280", fontWeight: 700, fontSize: "13px", background: "none", border: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
      aria-label={label}
    >
      <ChevronLeft size={16} aria-hidden="true" /> {label}
    </button>
  );

  const views: Record<AuthView, React.ReactNode> = {

    // ── Welcome ───────────────────────────────────────────────────────────────
    welcome: (
      <motion.div
        key="welcome"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.18)" }}>
            <img src={mssnLogo} alt="MSSN UNILORIN" style={{ width: 48, height: 48, objectFit: "contain" }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "20px", color: "white", lineHeight: 1 }}>
              MSSN<span style={{ color: ORANGE }}>CBT</span>
            </p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 600, marginTop: "3px" }}>UNILORIN Post-UTME Practice</p>
          </div>
        </div>

        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "30px", color: "white", lineHeight: 1.2, marginBottom: "12px" }}>
          Prepare smarter<br />for your Post-UTME
        </h1>
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "14px", lineHeight: 1.7, marginBottom: "28px" }}>
          Join 1,500+ students using MSSN's exam-focused CBT platform to ace their UNILORIN admission exam.
        </p>

        {/* Quick stats */}
        <div className="flex items-center gap-8 mb-8">
          {[["1,500+", "Students"], ["4", "Subjects"], ["100+", "Topics"]].map(([val, lbl], i) => (
            <div key={lbl} className="flex items-center gap-3">
              {i > 0 && <div className="h-7 w-px" style={{ background: "rgba(255,255,255,0.18)" }} />}
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "19px", color: "white" }}>{val}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{lbl}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <motion.button
            type="button"
            whileHover={{ opacity: 0.92, boxShadow: "0 10px 28px rgba(249,115,22,0.45)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("signup")}
            className="w-full py-4 rounded-full text-white font-bold text-base"
            style={{
              background: ORANGE,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              boxShadow: "0 4px 18px rgba(249,115,22,0.35)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Create Account — It's Free
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ background: "rgba(255,255,255,0.12)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("login")}
            className="w-full py-4 rounded-full border-2 font-bold text-base"
            style={{
              borderColor: "rgba(255,255,255,0.4)",
              color: "white",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              background: "rgba(255,255,255,0.06)",
              cursor: "pointer",
            }}
          >
            Log In to Existing Account
          </motion.button>
        </div>
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => { continueAsGuest(); navigate("/home"); }}
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 600, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
          >
            Continue as Guest (demo only — progress not saved)
          </button>
        </div>
      </motion.div>
    ),

    // ── Sign Up ───────────────────────────────────────────────────────────────
    signup: (
      <motion.div
        key="signup"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25 }}
      >
        <BackBtn to="welcome" />
        <div className="mb-5">
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "24px", color: NAVY, marginBottom: "4px" }}>
            Create your account
          </h2>
          <p style={{ color: "#6B7280", fontSize: "13px" }}>Join 1,500+ students preparing for UNILORIN Post-UTME</p>
        </div>

        <MethodTabs method={method} setMethod={(m) => { setMethod(m); resetErrors(); }} />

        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          <InputField
            label="Full Name"
            type="text"
            value={signupName}
            onChange={setSignupName}
            placeholder="Enter your full name"
            icon={<User size={15} />}
            error={fieldErrors.name}
            autoComplete="name"
          />
          {method === "email" ? (
            <InputField
              label="Email Address"
              type="email"
              value={signupEmail}
              onChange={setSignupEmail}
              placeholder="you@example.com"
              icon={<Mail size={15} />}
              error={fieldErrors.email}
              autoComplete="email"
            />
          ) : (
            <PhoneInputField value={signupPhone} onChange={setSignupPhone} error={fieldErrors.phone} id="signup-phone" />
          )}
          <InputField
            label="Password"
            type={showSignupPass ? "text" : "password"}
            value={signupPassword}
            onChange={setSignupPassword}
            placeholder="At least 8 characters"
            icon={<Lock size={15} />}
            error={fieldErrors.password}
            autoComplete="new-password"
            id="signup-password"
            right={
              <button type="button" onClick={() => setShowSignupPass(!showSignupPass)} style={{ color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }} aria-label={showSignupPass ? "Hide password" : "Show password"}>
                {showSignupPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <InputField
            label="Confirm Password"
            type={showSignupConfirm ? "text" : "password"}
            value={signupConfirm}
            onChange={setSignupConfirm}
            placeholder="Re-enter your password"
            icon={<Lock size={15} />}
            error={fieldErrors.confirm}
            autoComplete="new-password"
            id="signup-confirm"
            right={
              <button type="button" onClick={() => setShowSignupConfirm(!showSignupConfirm)} style={{ color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }} aria-label={showSignupConfirm ? "Hide confirm password" : "Show confirm password"}>
                {showSignupConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {/* Terms & Conditions */}
          <div>
            <label
              className="flex items-start gap-3 cursor-pointer select-none"
              htmlFor="terms-checkbox"
            >
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  id="terms-checkbox"
                  type="checkbox"
                  checked={signupAgreed}
                  onChange={(e) => { setSignupAgreed(e.target.checked); setFieldErrors(prev => ({ ...prev, terms: "" })); }}
                  className="sr-only"
                  aria-required="true"
                />
                <div
                  className="w-5 h-5 rounded flex items-center justify-center transition-all"
                  style={{
                    background: signupAgreed ? GREEN : "white",
                    border: `2px solid ${fieldErrors.terms ? "#DC2626" : signupAgreed ? GREEN : "#D1D5DB"}`,
                  }}
                >
                  {signupAgreed && <CheckCircle2 size={12} style={{ color: "white" }} aria-hidden="true" />}
                </div>
              </div>
              <span style={{ fontSize: "13px", color: "#374151", lineHeight: 1.55 }}>
                I agree to the{" "}
                <a href="#" style={{ color: ORANGE, fontWeight: 700, textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>Terms & Conditions</a>
                {" "}and{" "}
                <a href="#" style={{ color: ORANGE, fontWeight: 700, textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
              </span>
            </label>
            {fieldErrors.terms && <ErrorMsg>{fieldErrors.terms}</ErrorMsg>}
          </div>

          <ServerError msg={serverError} />
          <SubmitButton loading={loading}>Create Account</SubmitButton>
        </form>

        <p className="text-center mt-4" style={{ fontSize: "13px", color: "#6B7280" }}>
          Already have an account?{" "}
          <button type="button" onClick={() => goTo("login")}
            style={{ color: ORANGE, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
            Log In
          </button>
        </p>
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
          <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 700 }}>OR</span>
          <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
        </div>
        <button
          type="button"
          onClick={() => { continueAsGuest(); navigate("/home"); }}
          className="w-full py-3 rounded-full border-2 font-bold text-sm"
          style={{ borderColor: "#E5E7EB", color: "#6B7280", fontFamily: "'Manrope', sans-serif", background: "white", cursor: "pointer" }}
        >
          Continue as Guest
        </button>
      </motion.div>
    ),

    // ── Log In ────────────────────────────────────────────────────────────────
    login: (
      <motion.div
        key="login"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25 }}
      >
        <BackBtn to="welcome" />
        <div className="mb-5">
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "24px", color: NAVY, marginBottom: "4px" }}>
            Welcome back
          </h2>
          <p style={{ color: "#6B7280", fontSize: "13px" }}>Sign in to continue your exam preparation</p>
        </div>

        <MethodTabs method={method} setMethod={(m) => { setMethod(m); resetErrors(); }} />

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          {method === "email" ? (
            <InputField
              label="Email Address"
              type="email"
              value={loginEmail}
              onChange={setLoginEmail}
              placeholder="you@example.com"
              icon={<Mail size={15} />}
              error={fieldErrors.email}
              autoComplete="email"
            />
          ) : (
            <PhoneInputField value={loginPhone} onChange={setLoginPhone} error={fieldErrors.phone} id="login-phone" />
          )}

          <div>
            <InputField
              label="Password"
              type={showLoginPass ? "text" : "password"}
              value={loginPassword}
              onChange={setLoginPassword}
              placeholder="Enter your password"
              icon={<Lock size={15} />}
              error={fieldErrors.password}
              autoComplete="current-password"
              id="login-password"
              right={
                <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} style={{ color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }} aria-label={showLoginPass ? "Hide password" : "Show password"}>
                  {showLoginPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => { setForgotEmail(loginEmail); goTo("forgot"); }}
                style={{ fontSize: "13px", color: ORANGE, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <ServerError msg={serverError} />
          <SubmitButton loading={loading}>Log In</SubmitButton>
        </form>

        <p className="text-center mt-4" style={{ fontSize: "13px", color: "#6B7280" }}>
          Don't have an account?{" "}
          <button type="button" onClick={() => goTo("signup")}
            style={{ color: ORANGE, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "'Manrope', sans-serif" }}>
            Create one — it's free
          </button>
        </p>
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
          <span style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 700 }}>OR</span>
          <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
        </div>
        <button
          type="button"
          onClick={() => { continueAsGuest(); navigate("/home"); }}
          className="w-full py-3 rounded-full border-2 font-bold text-sm"
          style={{ borderColor: "#E5E7EB", color: "#6B7280", fontFamily: "'Manrope', sans-serif", background: "white", cursor: "pointer" }}
        >
          Continue as Guest
        </button>
      </motion.div>
    ),

    // ── Forgot Password ───────────────────────────────────────────────────────
    forgot: (
      <motion.div
        key="forgot"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25 }}
      >
        <BackBtn to="login" label="Back to Login" />
        <div className="mb-5">
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "24px", color: NAVY, marginBottom: "4px" }}>
            Reset your password
          </h2>
          <p style={{ color: "#6B7280", fontSize: "13px", lineHeight: 1.6 }}>
            Enter your registered email and we'll send you a reset link.
          </p>
        </div>

        {forgotSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${GREEN}14` }}>
              <CheckCircle2 size={32} style={{ color: GREEN }} aria-hidden="true" />
            </div>
            <h3 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "18px", color: NAVY, marginBottom: "8px" }}>
              Check your inbox
            </h3>
            <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: 1.7 }}>
              If an account exists for <strong style={{ color: NAVY }}>{forgotEmail}</strong>, you'll receive a password reset link shortly. Also check your spam folder.
            </p>
            <button
              type="button"
              onClick={() => { setForgotSent(false); goTo("login"); }}
              className="mt-6 w-full py-3.5 rounded-full text-white font-bold"
              style={{ background: ORANGE, fontFamily: "'Poppins', sans-serif", fontWeight: 700, border: "none", cursor: "pointer" }}
            >
              Back to Login
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
            <MethodTabs method={method} setMethod={(m) => { setMethod(m); resetErrors(); }} />
            {method === "phone" ? (
              <div
                className="p-4 rounded-xl"
                style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}
                role="note"
              >
                <p style={{ fontSize: "13px", color: "#92400E", lineHeight: 1.65 }}>
                  📱 <strong>Phone reset unavailable.</strong> Password reset via SMS is not yet configured. Please use your email address to reset your password, or contact MSSN support.
                </p>
              </div>
            ) : (
              <InputField
                label="Email Address"
                type="email"
                value={forgotEmail}
                onChange={setForgotEmail}
                placeholder="you@example.com"
                icon={<Mail size={15} />}
                error={fieldErrors.email}
                autoComplete="email"
                id="forgot-email"
              />
            )}
            <ServerError msg={serverError} />
            {method === "email" && (
              <SubmitButton loading={loading}>Send Reset Link</SubmitButton>
            )}
          </form>
        )}
      </motion.div>
    ),

    // ── Reset Password (after email link) ─────────────────────────────────────
    reset: (
      <motion.div
        key="reset"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25 }}
      >
        <div className="mb-5">
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "24px", color: NAVY, marginBottom: "4px" }}>
            Set a new password
          </h2>
          <p style={{ color: "#6B7280", fontSize: "13px" }}>Choose a strong password for your account.</p>
        </div>
        <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
          <InputField
            label="New Password"
            type={showResetPass ? "text" : "password"}
            value={resetPass}
            onChange={setResetPass}
            placeholder="At least 8 characters"
            icon={<Lock size={15} />}
            error={fieldErrors.password}
            autoComplete="new-password"
            id="reset-password"
            right={
              <button type="button" onClick={() => setShowResetPass(!showResetPass)} style={{ color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }} aria-label={showResetPass ? "Hide password" : "Show password"}>
                {showResetPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <InputField
            label="Confirm New Password"
            type={showResetConfirm ? "text" : "password"}
            value={resetConfirm}
            onChange={setResetConfirm}
            placeholder="Re-enter new password"
            icon={<Lock size={15} />}
            error={fieldErrors.confirm}
            autoComplete="new-password"
            id="reset-confirm"
            right={
              <button type="button" onClick={() => setShowResetConfirm(!showResetConfirm)} style={{ color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }} aria-label={showResetConfirm ? "Hide password" : "Show password"}>
                {showResetConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />
          <ServerError msg={serverError} />
          <SubmitButton loading={loading}>Update Password</SubmitButton>
        </form>
      </motion.div>
    ),

    // ── Success ───────────────────────────────────────────────────────────────
    success: (
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
        className="text-center py-10"
        role="status"
        aria-live="polite"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: `${GREEN}14` }}
        >
          <CheckCircle2 size={40} style={{ color: GREEN }} strokeWidth={2} aria-hidden="true" />
        </motion.div>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "26px", color: NAVY, marginBottom: "8px" }}>
          Account created!
        </h2>
        <p style={{ color: "#6B7280", fontSize: "15px", lineHeight: 1.7 }}>
          Welcome to MSSNUIL CBT, <strong style={{ color: NAVY }}>{successName}</strong>! 🎉<br />
          <span style={{ fontSize: "13px" }}>Taking you to your dashboard…</span>
        </p>
        <motion.div className="mt-6 mx-auto max-w-[200px]">
          <div className="h-1.5 rounded-full" style={{ background: "#E5E7EB" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "linear" }}
              className="h-full rounded-full"
              style={{ background: GREEN }}
            />
          </div>
        </motion.div>
      </motion.div>
    ),
  };

  // ── Layout ──────────────────────────────────────────────────────────────────

  const isWelcome = view === "welcome";

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Left: Form panel */}
      <motion.div
        className="w-full lg:w-[480px] flex flex-col justify-center px-8 sm:px-12 py-10 overflow-y-auto min-h-screen"
        animate={{ backgroundColor: isWelcome ? GREEN : "#ffffff" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Small logo for non-welcome form views */}
        <AnimatePresence>
          {!isWelcome && view !== "success" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mb-6"
            >
              <img src={mssnLogo} alt="MSSN" style={{ width: 32, height: 32, objectFit: "contain" }} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "14px", color: NAVY }}>
                MSSN<span style={{ color: ORANGE }}>CBT</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {views[view]}
        </AnimatePresence>
      </motion.div>

      {/* Right: Visual panel (desktop only) */}
      <RightPanel />
    </div>
  );
}
