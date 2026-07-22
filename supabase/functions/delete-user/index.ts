import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, 405);
  }

  let body: { user_id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const userId = body.user_id?.trim();
  if (!userId) {
    return json({ error: "user_id is required." }, 400);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Delete from profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError.message);
      // Continue anyway — the auth user delete is the critical part
    }

    // 2. Delete from auth.users (this is what prevents re-registration)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError.message);
      return json({
        ok: false,
        error: `Failed to delete auth user: ${authError.message}`,
      }, 500);
    }

    return json({
      ok: true,
      message: "User deleted from both profiles and auth.users",
    });
  } catch (err) {
    console.error("delete-user error:", err);
    return json({ error: String(err) }, 500);
  }
});