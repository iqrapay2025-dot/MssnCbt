import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { Home, BookOpen, Trophy, BarChart2, User, LogOut, Globe } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { NotificationBell, NotificationsPanel } from "./NotificationsPanel";
import mssnLogo from "../../imports/mssn_logo-removebg-preview__3_.png";

const GREEN = "#1F4E3D";

const NAV_ITEMS = [
  { path: "/home",         label: "Home",        Icon: Home      },
  { path: "/practice",    label: "Practice",    Icon: BookOpen  },
  { path: "/leaderboard", label: "Leaderboard", Icon: Trophy    },
  { path: "/reports",     label: "Reports",     Icon: BarChart2 },
  { path: "/profile",     label: "Profile",     Icon: User      },
];

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetStats } = useUser();
  const [notifOpen, setNotifOpen] = useState(false);

  const { signOut } = useAuth();

  const handleLogout = async () => {
    resetStats();
    await signOut();
    navigate("/");
  };

  return (
    <>
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* ── Desktop Sidebar ─────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-64 min-h-screen fixed left-0 top-0 z-40"
        style={{ background: "white", borderRight: "1px solid #F0F0F0", boxShadow: "2px 0 12px rgba(0,0,0,0.04)" }}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-4 py-4 cursor-pointer"
          onClick={() => navigate("/home")}
          style={{ background: GREEN, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          aria-label="Go to Home"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.92)", padding: "4px" }}
            >
              <img src={mssnLogo} alt="MSSN UNILORIN" style={{ width: 40, height: 40, objectFit: "contain" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "'Poppins', sans-serif", color: "white", fontWeight: 800, fontSize: "13px", lineHeight: 1 }}>
                MSSN <span style={{ color: "#A7D9C4" }}>CBT</span>
              </p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", marginTop: "3px" }}>Post-UTME Practice</p>
            </div>
            <NotificationBell onClick={() => setNotifOpen(true)} />
          </div>
        </motion.div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="App sections">
          {NAV_ITEMS.map(({ path, label, Icon }, i) => {
            const active = location.pathname === path;
            return (
              <motion.button
                key={path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                aria-current={active ? "page" : undefined}
                aria-label={label}
                style={{
                  background: active ? `${GREEN}15` : "transparent",
                  color: active ? GREEN : "#6B7280",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  borderLeft: active ? `3px solid ${GREEN}` : "3px solid transparent",
                }}
              >
                <Icon
                  size={18}
                  style={{ color: active ? GREEN : "#9CA3AF", flexShrink: 0 }}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
                {label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-2 h-2 rounded-full"
                    style={{ background: GREEN }}
                    aria-hidden="true"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 space-y-2" style={{ borderTop: "1px solid #F3F4F6" }}>
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ color: "#6B7280", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "13px" }}
          >
            <Globe size={15} style={{ color: "#9CA3AF" }} />
            Back to Homepage
          </motion.button>
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ color: "#DC2626", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "13px" }}
          >
            <LogOut size={15} style={{ color: "#DC2626" }} />
            Log Out
          </motion.button>
          <p style={{ fontFamily: "'Manrope', sans-serif", color: "#D1D5DB", fontSize: "10px", paddingLeft: "12px" }}>
            © {new Date().getFullYear()} MSSN UNILORIN
          </p>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
        aria-label="Mobile navigation"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(14px)",
          borderTop: "1px solid #F0F0F0",
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-around px-1 py-2">
          {NAV_ITEMS.map(({ path, label, Icon }) => {
            const active = location.pathname === path;
            return (
              <motion.button
                key={path}
                whileTap={{ scale: 0.85 }}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl"
                aria-current={active ? "page" : undefined}
                aria-label={label}
                style={{ minWidth: 52 }}
              >
                <motion.div
                  animate={active ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  <Icon
                    size={20}
                    style={{ color: active ? GREEN : "#9CA3AF" }}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </motion.div>
                <span
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    color: active ? GREEN : "#9CA3AF",
                    fontSize: "9px",
                    fontWeight: 700,
                  }}
                >
                  {label}
                </span>
                {active && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: GREEN }}
                  />
                )}
              </motion.button>
            );
          })}

          {/* Bell button in mobile nav */}
          <div className="flex flex-col items-center gap-1 px-1 py-1.5" style={{ minWidth: 52 }}>
            <NotificationBell onClick={() => setNotifOpen(true)} />
            <span style={{ fontFamily: "'Manrope', sans-serif", color: "#9CA3AF", fontSize: "9px", fontWeight: 700 }}>
              Alerts
            </span>
          </div>
        </div>
      </nav>
    </>
  );
}
