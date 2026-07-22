import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ── CORS ───────────────────────────────────────────────────────────────────────

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

// ── Firebase Admin SDK (via REST) ──────────────────────────────────────────────

/**
 * Send a push notification via Firebase Cloud Messaging (FCM) HTTP v1 API.
 * Uses a service-account JSON stored in an environment variable to obtain an
 * OAuth2 access token, then POSTs the message.
 */
async function sendFcmPush(
  fcmToken: string,
  title: string,
  body: string,
): Promise<boolean> {
  try {
    // 1. Get an OAuth2 access token from the service account
    const saBase64 = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
    if (!saBase64) {
      console.warn("FIREBASE_SERVICE_ACCOUNT_JSON not set — skipping FCM push");
      return false;
    }

    const serviceAccount = JSON.parse(atob(saBase64));
    const { client_email, private_key, project_id } = serviceAccount;

    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = { alg: "RS256", typ: "JWT" };
    const jwtPayload = {
      iss: client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    // Create JWT — use the Web Crypto API
    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(jwtHeader));
    const payloadB64 = btoa(JSON.stringify(jwtPayload));
    const signingInput = `${headerB64}.${payloadB64}`;

    // Import the private key
    const keyData = pemToArrayBuffer(private_key);
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signature = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      cryptoKey,
      encoder.encode(signingInput),
    );
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    const jwt = `${signingInput}.${sigB64}`;

    // 2. Exchange JWT for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.warn("FCM OAuth token exchange failed:", errText);
      return false;
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 3. Send FCM message
    const fcmRes = await fetch(
      `https://fcm.googleapis.com/v1/projects/${project_id}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: { title, body },
            data: { title, body, type: "broadcast" },
          },
        }),
      },
    );

    if (!fcmRes.ok) {
      const errBody = await fcmRes.text();
      console.warn(`FCM send failed for token ${fcmToken.slice(0, 12)}...: ${errBody}`);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("FCM push error:", err);
    return false;
  }
}

/** Convert a PEM-encoded private key to an ArrayBuffer (PKCS#8) */
function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Strip header/footer and whitespace
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/, "")
    .replace(/-----END [A-Z ]+-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buf[i] = binary.charCodeAt(i);
  }
  return buf.buffer;
}

// ── Server ────────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  const { pathname } = new URL(req.url);
  const method = req.method;

  // CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (method !== "POST") {
    return json({ error: "Method not allowed. Use POST." }, 405);
  }

  let body: { title?: string; body?: string; type?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const title = body.title?.trim();
  const messageBody = body.body?.trim();
  const type = body.type || "broadcast";

  if (!title) return json({ error: "title is required." }, 400);
  if (!messageBody) return json({ error: "body is required." }, 400);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // NOTE: We do NOT insert into the notifications table here.
    // The client-side pushNotification() in notificationStore.ts already inserts
    // into the notifications table, and that insert triggers Realtime delivery
    // to all connected users. Inserting again here would create duplicate
    // in-app notifications for every user.

    // Fetch all profiles that have an fcm_token
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("fcm_token")
      .not("fcm_token", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError.message);
      return json({
        ok: true,
        fcm_sent: 0,
        fcm_error: profilesError.message,
      });
    }

    const tokens: string[] = (profiles || [])
      .map((p: any) => p.fcm_token)
      .filter(Boolean);

    if (tokens.length === 0) {
      console.log("No FCM tokens found — no push sent");
      return json({
        ok: true,
        fcm_sent: 0,
        note: "No FCM tokens found on profiles",
      });
    }

    // 3. Send push to each token
    let sentCount = 0;
    for (const token of tokens) {
      const ok = await sendFcmPush(token, title, messageBody);
      if (ok) sentCount++;
    }

    return json({
      ok: true,
      fcm_sent: sentCount,
      fcm_total: tokens.length,
    });
  } catch (err) {
    console.error("send-notification error:", err);
    return json({ error: String(err) }, 500);
  }
});