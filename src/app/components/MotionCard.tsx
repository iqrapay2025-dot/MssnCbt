import { motion } from "motion/react";
import type { ReactNode } from "react";

const GREEN = "#F97316";

/* ─── Shared animation variants ─────────────────────────────────────────── */

const easeCurve = [0.22, 1, 0.36, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: easeCurve },
  }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, delay: i * 0.1, ease: easeCurve },
  }),
};

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Card that fades up on viewport enter ───────────────────────────────── */

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  onClick?: () => void;
  hover3d?: boolean;
}

export function MotionCard({ children, className = "", style = {}, delay = 0, onClick, hover3d }: MotionCardProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      custom={delay}
      variants={fadeUp}
      whileHover={
        hover3d
          ? {
              scale: 1.03,
              rotateX: 2,
              rotateY: -2,
              boxShadow: "0 20px 48px rgba(249,115,22,0.12)",
              transition: { duration: 0.2 },
            }
          : { scale: 1.02, boxShadow: "0 12px 32px rgba(0,0,0,0.08)", transition: { duration: 0.2 } }
      }
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
      style={{ cursor: onClick ? "pointer" : "default", perspective: 800, ...style }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating pill tag ──────────────────────────────────────────────────── */

interface PillTagProps {
  label: string;
  color: string;
  textColor?: string;
  delay?: number;
  amplitude?: number;
}

export function FloatingPill({ label, color, textColor = "white", delay = 0, amplitude = 10 }: PillTagProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4, type: "spring", stiffness: 200 }}
      animate={{ y: [0, -amplitude, 0] }}
      style={{
        background: color,
        color: textColor,
        display: "inline-block",
        padding: "8px 18px",
        borderRadius: "999px",
        fontFamily: "'Manrope', sans-serif",
        fontWeight: 700,
        fontSize: "13px",
        boxShadow: `0 4px 16px ${color}55`,
        animationDuration: `${2.5 + delay}s`,
      }}
    >
      {label}
    </motion.span>
  );
}

/* ─── Flat Icon Card (replaces old 3D card) ──────────────────────────────── */

import type { LucideIcon } from "lucide-react";

interface FlatIconCardProps {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  color: string;
  delay?: number;
  onClick?: () => void;
}

export function FlatIconCard({ icon: Icon, label, sublabel, color, delay = 0, onClick }: FlatIconCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: `0 12px 28px ${color}25`, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "18px 16px",
        textAlign: "center",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "12px",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 10px",
        }}
      >
        <Icon size={20} style={{ color }} strokeWidth={2} />
      </div>
      <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px", color: "#111" }}>{label}</p>
      {sublabel && <p style={{ fontSize: "11px", color: "#888", marginTop: "3px" }}>{sublabel}</p>}
    </motion.div>
  );
}

/** @deprecated use FlatIconCard */
export function ThreeDIconCard({ icon, label, sublabel, color, delay, onClick }: FlatIconCardProps) {
  return <FlatIconCard icon={icon} label={label} sublabel={sublabel} color={color} delay={delay} onClick={onClick} />;
}

/* ─── Animated page wrapper ──────────────────────────────────────────────── */

export function PageFade({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Squiggle SVG accent ────────────────────────────────────────────────── */

export function SquiggleAccent({ color = GREEN, className = "" }: { color?: string; className?: string }) {
  return (
    <motion.svg
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      width="80"
      height="30"
      viewBox="0 0 80 30"
      fill="none"
      className={className}
    >
      <motion.path
        d="M2 20 Q20 4 40 20 Q60 36 78 10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
