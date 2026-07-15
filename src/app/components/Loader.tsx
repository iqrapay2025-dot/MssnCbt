import mssnLogo from "../../imports/mssn_logo-removebg-preview__3_.png";

const GREEN = "#1F4E3D";
const ORANGE = "#F97316";
const CREAM = "#F5F0E6";

/** Dual-ring spinner — used on the splash screen and full-page loads */
export function SpinnerLoader({ size = 48, color = GREEN }: { size?: number; color?: string }) {
  const ring = size * 0.1;
  const inner = size * 0.7;

  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <style>{`
        @keyframes mssn-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes mssn-spin-back { 0%{transform:rotate(0deg)} 100%{transform:rotate(-360deg)} }
        .mssn-outer {
          width:${size}px; height:${size}px;
          border-radius:50%;
          border:${ring}px solid;
          border-color:${color} ${color} transparent transparent;
          animation:mssn-spin 1s linear infinite;
          display:inline-block;
          position:relative;
        }
        .mssn-outer::after {
          content:'';
          position:absolute;
          left:0;right:0;top:0;bottom:0;
          margin:auto;
          width:${inner}px; height:${inner}px;
          border-radius:50%;
          border:${ring}px solid;
          border-color:transparent transparent ${ORANGE} ${ORANGE};
          animation:mssn-spin-back 0.5s linear infinite;
          transform-origin:center center;
        }
      `}</style>
      <span className="mssn-outer" />
    </div>
  );
}

/** Three bouncing dots — used inside cards or buttons for inline loading */
export function DotsLoader({ color = GREEN }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <style>{`
        @keyframes mssn-bounce {
          0%,80%,100%{transform:scale(0);opacity:0.4}
          40%{transform:scale(1);opacity:1}
        }
        .mssn-dot {
          width:8px; height:8px; border-radius:50%;
          background:${color};
          animation:mssn-bounce 1.4s infinite ease-in-out both;
        }
        .mssn-dot:nth-child(1){animation-delay:-0.32s}
        .mssn-dot:nth-child(2){animation-delay:-0.16s}
      `}</style>
      <span className="mssn-dot" />
      <span className="mssn-dot" />
      <span className="mssn-dot" />
    </div>
  );
}

/** Progress bar that crawls across the top of the screen — used for route changes */
export function TopProgressBar({ visible }: { visible: boolean }) {
  return (
    <>
      <style>{`
        @keyframes mssn-progress {
          0%{width:0%;opacity:1}
          70%{width:85%;opacity:1}
          100%{width:100%;opacity:0}
        }
        .mssn-progress-bar {
          position:fixed;top:0;left:0;height:3px;
          background:linear-gradient(90deg,${GREEN},${ORANGE});
          z-index:9999;
          border-radius:0 2px 2px 0;
          animation: mssn-progress 800ms ease-out forwards;
          pointer-events:none;
        }
      `}</style>
      {visible && <div className="mssn-progress-bar" />}
    </>
  );
}

/** Full-screen splash overlay shown on first app load */
export function SplashLoader() {
  return (
    <div
      role="status"
      aria-label="Loading MSSNUIL CBT platform"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: CREAM,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "24px",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <img
          src={mssnLogo}
          alt="MSSN UNILORIN logo"
          style={{ width: 90, height: 90, objectFit: "contain", marginBottom: "4px" }}
        />
        <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "18px", color: GREEN }}>
          MSSN <span style={{ color: ORANGE }}>CBT</span>
        </p>
        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Post-UTME Practice Platform</p>
      </div>
      <SpinnerLoader size={44} color={GREEN} />
    </div>
  );
}
