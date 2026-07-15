import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

// ── Helpers ───────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function adminSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ── Server ────────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const { pathname } = new URL(req.url);
  const method = req.method;

  // CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  console.log(`${method} ${pathname}`);

  // ── Health ──────────────────────────────────────────────────────────────────
  if (pathname.endsWith("/health") && method === "GET") {
    return json({ status: "ok" });
  }

  // ── Auth: Sign Up ───────────────────────────────────────────────────────────
  if (pathname.endsWith("/auth/signup") && method === "POST") {
    let body: { email?: string; phone?: string; password?: string; name?: string };
    try { body = await req.json(); } catch { return json({ error: "Invalid request body." }, 400); }

    const { email, phone, password, name } = body;
    if (!password || password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);
    if (!email && !phone) return json({ error: "An email address or phone number is required." }, 400);

    let authEmail: string;
    const metadata: Record<string, string> = { name: name?.trim() || "" };
    if (phone) {
      const clean = phone.replace(/[\s\-().]/g, "");
      const normalised = clean.startsWith("+") ? clean.slice(1)
        : clean.startsWith("234") ? clean
        : clean.startsWith("0") ? `234${clean.slice(1)}`
        : `234${clean}`;
      authEmail = `${normalised}@phone.mssncbt.ng`;
      metadata.phone = phone;
    } else {
      authEmail = email!.trim().toLowerCase();
    }

    const supabase = adminSupabase();
    const { data, error } = await supabase.auth.admin.createUser({
      email: authEmail,
      password,
      user_metadata: metadata,
      email_confirm: true,
    });

    if (error) {
      console.log(`Signup error for ${authEmail}: ${error.message}`);
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("duplicate") || msg.includes("already exists")) {
        return json({ error: "This email or phone number is already registered." }, 409);
      }
      return json({ error: error.message }, 400);
    }

    return json({ ok: true, userId: data.user?.id });
  }

  // ── Questions: GET ──────────────────────────────────────────────────────────
  if (pathname.endsWith("/questions") && method === "GET") {
    try {
      const raw = await kv.get("mssn_admin_questions_v1");
      if (!raw) return json({ questions: [] });
      return json({ questions: JSON.parse(raw as string) });
    } catch (err) {
      console.log(`Error loading questions: ${err}`);
      return json({ questions: [] });
    }
  }

  // ── Questions: POST ─────────────────────────────────────────────────────────
  if (pathname.endsWith("/questions") && method === "POST") {
    let body: { questions?: unknown };
    try { body = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }
    if (!Array.isArray(body.questions)) return json({ error: "questions must be an array." }, 400);
    try {
      await kv.set("mssn_admin_questions_v1", JSON.stringify(body.questions));
      return json({ ok: true, count: body.questions.length });
    } catch (err) {
      console.log(`Error saving questions: ${err}`);
      return json({ error: `Failed to save: ${err}` }, 500);
    }
  }

  // ── AI Explanation ──────────────────────────────────────────────────────────
  if (pathname.endsWith("/explain") && method === "POST") {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return json({ error: "Gemini API key not configured." }, 500);

    let body: { question?: string; options?: string[]; correctIndex?: number };
    try { body = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }

    const { question, options, correctIndex } = body;
    if (!question || !Array.isArray(options) || options.length < 2 || correctIndex === undefined) {
      return json({ error: "Missing required fields." }, 400);
    }

    const labels = ["A", "B", "C", "D"];
    const correctLabel = labels[correctIndex] ?? "A";
    const optionLines = options.map((o, i) => `${labels[i] ?? i + 1}) ${o}`).join("\n");
    const prompt =
      `Question: ${question}\n${optionLines}\nCorrect answer: ${correctLabel}) ${options[correctIndex]}\n\n` +
      `In 2-3 short sentences, explain why the correct answer is right. Keep it clear and simple for a student preparing for a university entrance exam.`;

    let geminiRes: Response;
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
            thinkingConfig: { thinkingBudget: 0 },
          }),
        }
      );
    } catch (err) {
      console.log(`Network error calling Gemini: ${err}`);
      return json({ error: "Failed to reach Gemini API." }, 502);
    }

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.log(`Gemini ${geminiRes.status}: ${errBody}`);
      return json({ error: `Gemini error: ${geminiRes.status}` }, 502);
    }

    const data = await geminiRes.json();
    const parts: Array<{ text?: string; thought?: boolean }> = data?.candidates?.[0]?.content?.parts ?? [];
    const textPart = parts.find((p) => p.text && !p.thought) ?? parts[0];
    const explanation: string = textPart?.text?.trim() ?? "";

    if (!explanation) {
      console.log("Gemini empty response:", JSON.stringify(data));
      return json({ error: "Gemini returned an empty response." }, 502);
    }

    return json({ explanation });
  }

  return json({ error: "Not found." }, 404);
});
