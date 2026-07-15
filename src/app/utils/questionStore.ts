import type { Question, Subject, Difficulty } from "../data/sampleData";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const STORE_KEY = "mssn_admin_questions";
const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-1943a64d`;

export interface AdminQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  subject: string;
  topic: string;
  difficulty: string;
  explanation: string;
}

export function loadAdminQuestions(): AdminQuestion[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as AdminQuestion[];
  } catch {}
  return [];
}

export function saveAdminQuestions(questions: AdminQuestion[]): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(questions));
  } catch {}
  // Async sync to server — fire and forget, non-blocking
  saveToServer(questions);
}

/** Saves questions to the Supabase KV store for cross-session persistence. */
async function saveToServer(questions: AdminQuestion[]): Promise<void> {
  try {
    await fetch(`${SERVER}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ questions }),
    });
  } catch {
    // Non-critical — localStorage is the primary store
  }
}

/**
 * Fetches questions from the server and populates localStorage if it is empty.
 * Called once on app startup to restore data after browser reload / cache clear.
 */
export async function syncFromServer(): Promise<void> {
  try {
    const local = loadAdminQuestions();
    if (local.length > 0) return; // localStorage already has data

    const res = await fetch(`${SERVER}/questions`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    const questions: AdminQuestion[] = Array.isArray(data.questions) ? data.questions : [];
    if (questions.length > 0) {
      localStorage.setItem(STORE_KEY, JSON.stringify(questions));
      notifyQuestionsUpdated(questions.length);
    }
  } catch {
    // Silently ignore — user will just see empty question bank
  }
}

const VALID_SUBJECTS: Subject[] = ["English", "Mathematics", "Current Affairs", "General Knowledge"];
const VALID_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const SUBJECT_ALIASES: Record<string, Subject> = {
  math: "Mathematics",
  maths: "Mathematics",
  mathematic: "Mathematics",
  mathematics: "Mathematics",
  "further math": "Mathematics",
  "further maths": "Mathematics",
  "further mathematics": "Mathematics",
  english: "English",
  "english language": "English",
  "use of english": "English",
  literature: "English",
  "current affairs": "Current Affairs",
  "current affair": "Current Affairs",
  currentaffairs: "Current Affairs",
  "current events": "Current Affairs",
  "civic education": "Current Affairs",
  civics: "Current Affairs",
  "general knowledge": "General Knowledge",
  "general knowledge ": "General Knowledge",
  gk: "General Knowledge",
  "gen knowledge": "General Knowledge",
  "general studies": "General Knowledge",
  "general paper": "General Knowledge",
  gs: "General Knowledge",
};

function toSubject(s: string): Subject {
  if (!s) return "General Knowledge";
  const key = s.trim().toLowerCase();
  if (SUBJECT_ALIASES[key]) return SUBJECT_ALIASES[key];
  // Exact case-insensitive match
  const exact = VALID_SUBJECTS.find((v) => v.toLowerCase() === key);
  if (exact) return exact;
  // Starts-with match (handles truncated values like "mathemat")
  const startsWith = VALID_SUBJECTS.find((v) => key.startsWith(v.toLowerCase().slice(0, 5)));
  if (startsWith) return startsWith;
  // Partial containment match
  const partial = VALID_SUBJECTS.find((v) => key.includes(v.toLowerCase()) || v.toLowerCase().includes(key));
  return partial ?? "General Knowledge";
}

function toDifficulty(d: string): Difficulty {
  const match = VALID_DIFFICULTIES.find((v) => v.toLowerCase() === d.toLowerCase());
  return match ?? "Medium";
}

/** Returns only admin-uploaded questions. Empty array if admin has not uploaded any. */
export function getExamQuestions(): Question[] {
  const adminQs = loadAdminQuestions();
  return adminQs.map((q, i) => ({
    id: i + 10000,
    subject: toSubject(q.subject),
    topic: q.topic || "General",
    difficulty: toDifficulty(q.difficulty),
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation || "",
  }));
}

export function getAdminQuestionCount(): number {
  return loadAdminQuestions().length;
}

export function deleteAdminQuestion(id: string): void {
  const questions = loadAdminQuestions().filter((q) => q.id !== id);
  saveAdminQuestions(questions);
}

export function clearAdminQuestions(): void {
  try { localStorage.removeItem(STORE_KEY); } catch {}
  saveToServer([]);
  notifyQuestionsUpdated(0);
}

export function notifyQuestionsUpdated(count: number): void {
  const payload = { timestamp: Date.now(), count };
  try { localStorage.setItem("mssn_questions_last_updated", JSON.stringify(payload)); } catch {}
  window.dispatchEvent(new CustomEvent("mssn-questions-updated", { detail: payload }));
}

/**
 * Writes an AI-generated explanation back to the stored AdminQuestion so it is
 * never re-generated. Keyed by Question.id (index + 10000).
 */
export function saveExplanationForQuestion(questionId: number, explanation: string): void {
  const adminQs = loadAdminQuestions();
  const idx = questionId - 10000;
  if (idx < 0 || idx >= adminQs.length) return;
  adminQs[idx] = { ...adminQs[idx], explanation };
  saveAdminQuestions(adminQs);
}
