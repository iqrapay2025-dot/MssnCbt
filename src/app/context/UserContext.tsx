import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { upsertLeaderboard, getUserId } from "../utils/leaderboardStore";

export interface SessionRecord {
  date: string;
  score: number;
  total: number;
  timeUsed: number;
  mode: string;
  subject?: string;
  subjectBreakdown?: Record<string, { correct: number; total: number }>;
}

export interface UserStats {
  sessions: number;
  avgScore: number;
  bestScore: number;
  streak: number;
  history: SessionRecord[];
  scoreHistory: { date: string; score: number }[];
}

interface UserContextValue {
  stats: UserStats;
  recordSession: (rec: Omit<SessionRecord, "date">) => void;
  resetStats: () => void;
}

const DEFAULT_STATS: UserStats = {
  sessions: 0,
  avgScore: 0,
  bestScore: 0,
  streak: 0,
  history: [],
  scoreHistory: [],
};

const UserContext = createContext<UserContextValue>({
  stats: DEFAULT_STATS,
  recordSession: () => {},
  resetStats: () => {},
});

function load(): UserStats {
  try {
    const raw = localStorage.getItem("mssn_user_stats");
    if (raw) return JSON.parse(raw) as UserStats;
  } catch {}
  return DEFAULT_STATS;
}

function save(s: UserStats) {
  try {
    localStorage.setItem("mssn_user_stats", JSON.stringify(s));
  } catch {}
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<UserStats>(load);

  useEffect(() => {
    save(stats);
  }, [stats]);

  const recordSession = useCallback((rec: Omit<SessionRecord, "date">) => {
    setStats((prev) => {
      const pct = Math.round((rec.score / rec.total) * 100);
      const newHistory = [
        { ...rec, date: new Date().toLocaleString() },
        ...prev.history,
      ];
      const sessions = prev.sessions + 1;
      const totalScore = prev.avgScore * prev.sessions + pct;
      const avgScore = Math.round(totalScore / sessions);
      const bestScore = Math.max(prev.bestScore, pct);

      // Simple streak: increment if today is different from last session date
      const today = new Date().toDateString();
      const lastDate = prev.history[0]
        ? new Date(prev.history[0].date).toDateString()
        : null;
      const streak = lastDate === today ? prev.streak : prev.streak + 1;

      const shortDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const scoreHistory = [
        ...prev.scoreHistory,
        { date: `${shortDate} #${sessions}`, score: pct },
      ].slice(-10);

      const next: UserStats = { sessions, avgScore, bestScore, streak, history: newHistory, scoreHistory };
      save(next);
      // Sync to leaderboard store so Leaderboard page shows real data
      upsertLeaderboard({
        userId: getUserId(),
        name: localStorage.getItem("mssn_user_name") || "Student",
        nickname: localStorage.getItem("mssn_user_nickname") || "student",
        sessions,
        avgScore,
        bestScore,
        streak,
        lastUpdated: new Date().toISOString(),
      });
      return next;
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
    localStorage.removeItem("mssn_user_stats");
  }, []);

  return (
    <UserContext.Provider value={{ stats, recordSession, resetStats }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
