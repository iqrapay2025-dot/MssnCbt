const LB_KEY = "mssn_leaderboard";
const UID_KEY = "mssn_user_id";

export interface LBEntry {
  userId: string;
  name: string;
  nickname: string;
  sessions: number;
  avgScore: number;
  bestScore: number;
  streak: number;
  lastUpdated: string;
}

export function getUserId(): string {
  let id = localStorage.getItem(UID_KEY);
  if (!id) {
    id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(UID_KEY, id);
  }
  return id;
}

export function loadLeaderboard(): LBEntry[] {
  try {
    const raw = localStorage.getItem(LB_KEY);
    if (raw) return JSON.parse(raw) as LBEntry[];
  } catch {}
  return [];
}

export function upsertLeaderboard(entry: LBEntry): void {
  const entries = loadLeaderboard();
  const idx = entries.findIndex((e) => e.userId === entry.userId);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  try {
    localStorage.setItem(LB_KEY, JSON.stringify(entries));
  } catch {}
}
