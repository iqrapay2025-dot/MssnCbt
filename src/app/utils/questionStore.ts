import type { Question, Subject, Difficulty } from "../data/sampleData";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { supabase } from "../context/AuthContext";

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

/** Converts a row from public.questions to our AdminQuestion format */
function rowToAdminQuestion(row: any): AdminQuestion {
  const correctIndex = ["A", "B", "C", "D"].indexOf(row.correct);
  return {
    id: row.id,
    question: row.question,
    options: [row.option_a, row.option_b, row.option_c, row.option_d],
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
    subject: row.subject,
    topic: row.topic || "General",
    difficulty: row.difficulty || "Medium",
    explanation: row.explanation || "",
  };
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

/** Saves questions to the Supabase edge function (which writes to questions table). */
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
 * Fetches questions from the Supabase questions table directly
 * (bypasses the edge function KV store). Called on app startup.
 */
export async function syncFromServer(): Promise<void> {
  try {
    // Try to fetch from the questions table directly first
    const { data: tableData, error: tableError } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!tableError && tableData && tableData.length > 0) {
      const questions = tableData.map(rowToAdminQuestion);
      const local = loadAdminQuestions();
      const localIds = new Set(local.map((q) => q.id));
      const newQuestions = questions.filter((q) => !localIds.has(q.id));

      localStorage.setItem(STORE_KEY, JSON.stringify(questions));

      // Only notify if there are genuinely new questions that weren't already cached
      if (newQuestions.length > 0) {
        notifyQuestionsUpdated(questions.length);
      }
      return;
    }

    // Fallback: try the edge function KV store
    const res = await fetch(`${SERVER}/questions`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    const serverQuestions: AdminQuestion[] = Array.isArray(data.questions) ? data.questions : [];
    
    if (serverQuestions.length > 0) {
      const local = loadAdminQuestions();
      const serverCount = serverQuestions.length;
      const localCount = local.length;
      const localIds = new Set(local.map((q) => q.id));
      const newOnes = serverQuestions.filter((q) => !localIds.has(q.id));
      
      if (serverCount !== localCount) {
        localStorage.setItem(STORE_KEY, JSON.stringify(serverQuestions));
        if (newOnes.length > 0) {
          notifyQuestionsUpdated(serverCount);
        }
      }
    }
  } catch {
    // Silently ignore
  }
}

/** Sync questions from Supabase questions table directly (for admin panel) */
export async function syncQuestionsFromSupabase(): Promise<AdminQuestion[]> {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching questions from Supabase:", error);
      return loadAdminQuestions();
    }
    
    if (data && data.length > 0) {
      const questions = data.map(rowToAdminQuestion);
      localStorage.setItem(STORE_KEY, JSON.stringify(questions));
      return questions;
    }
  } catch {}
  return loadAdminQuestions();
}

/** Save questions directly to the Supabase questions table (admin only) */
export async function saveQuestionsToSupabase(questions: AdminQuestion[]): Promise<boolean> {
  try {
    const formatted = questions.map(q => ({
      id: q.id.startsWith("manual-") || q.id.startsWith("imported-") ? undefined : q.id,
      question: q.question,
      option_a: q.options[0],
      option_b: q.options[1],
      option_c: q.options[2],
      option_d: q.options[3],
      correct: ["A", "B", "C", "D"][q.correctIndex] || "A",
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      explanation: q.explanation,
    }));

    const { error } = await supabase.from("questions").insert(formatted);
    if (error) {
      console.error("Error saving to Supabase:", error);
      return false;
    }
    
    // Also save to localStorage for offline access
    localStorage.setItem(STORE_KEY, JSON.stringify(questions));
    notifyQuestionsUpdated(questions.length);
    return true;
  } catch (err) {
    console.error("Error saving to Supabase:", err);
    return false;
  }
}

/** Delete a question from Supabase */
export async function deleteQuestionFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      console.error("Error deleting from Supabase:", error);
      return false;
    }
    return true;
  } catch {
    return false;
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
  const exact = VALID_SUBJECTS.find((v) => v.toLowerCase() === key);
  if (exact) return exact;
  const startsWith = VALID_SUBJECTS.find((v) => key.startsWith(v.toLowerCase().slice(0, 5)));
  if (startsWith) return startsWith;
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
  // Also try to delete from Supabase (fire and forget)
  deleteQuestionFromSupabase(id);
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
 * Subscribe to real-time changes on the questions table.
 * When admin inserts/updates/deletes questions, all connected clients
 * automatically refresh their local cache.
 */
export function subscribeToQuestionsRealtime(onChange: () => void): () => void {
  console.log("📋 [Realtime] Setting up questions subscription...");
  const channel = supabase
    .channel("questions-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "questions" },
      (payload) => {
        const newRow = payload.new as { question?: string } | null;
        console.log("📋 [Realtime] Questions change received:", payload.eventType, newRow?.question?.slice(0,40));
        // Re-sync localStorage from Supabase, then notify listeners
        syncFromServer().then(() => onChange());
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
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
