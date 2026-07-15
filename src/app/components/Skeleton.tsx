import { motion } from "motion/react";

const shimmer = {
  initial: { backgroundPosition: "-400px 0" },
  animate: { backgroundPosition: "400px 0" },
};

const shimmerStyle = {
  background: "linear-gradient(90deg, #ede8df 25%, #f5f0e6 50%, #ede8df 75%)",
  backgroundSize: "800px 100%",
  borderRadius: "12px",
};

function Pulse({ style = {}, className = "" }: { style?: React.CSSProperties; className?: string }) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      className={className}
      style={{ ...shimmerStyle, ...style }}
    />
  );
}

export function SkeletonLine({ width = "100%", height = 14, className = "" }: { width?: string | number; height?: number; className?: string }) {
  return <Pulse style={{ width, height, borderRadius: "8px" }} className={className} />;
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return <Pulse style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0 }} />;
}

export function SkeletonCard({ height = 120, className = "" }: { height?: number; className?: string }) {
  return (
    <Pulse style={{ width: "100%", height, borderRadius: "24px" }} className={className} />
  );
}

/** Skeleton for the stat mini-cards (2-col or 4-col grid) */
export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid gap-3 mb-6 ${count === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 flex flex-col items-center gap-2" style={{ background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <SkeletonCircle size={40} />
          <SkeletonLine width="60%" height={20} />
          <SkeletonLine width="50%" height={10} />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a leaderboard list row */
export function SkeletonListRow() {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <SkeletonLine width={28} height={14} />
      <SkeletonCircle size={36} />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="50%" height={12} />
        <SkeletonLine width="30%" height={10} />
      </div>
      <SkeletonLine width={40} height={16} />
    </div>
  );
}

/** Skeleton for a subject card on practice page */
export function SkeletonSubjectCard() {
  return (
    <div className="rounded-3xl p-5 flex items-center gap-4" style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <SkeletonCircle size={48} />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="40%" height={14} />
        <SkeletonLine width="80%" height={8} />
      </div>
      <SkeletonLine width={36} height={14} />
    </div>
  );
}

/** Skeleton for a chart area */
export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center gap-2 mb-4">
        <SkeletonCircle size={32} />
        <SkeletonLine width={120} height={14} />
      </div>
      <SkeletonCard height={height} />
    </div>
  );
}
