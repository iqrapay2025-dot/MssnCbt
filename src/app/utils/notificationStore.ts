import { supabase } from "../context/AuthContext";
import type { RealtimeChannel } from "@supabase/supabase-js";

const LOCAL_KEY = "mssn_notifications";
const CUSTOM_EVENT = "mssn-notification";
const REALTIME_CHANNEL = "mssn-notifications-channel";
const GUEST_ID_KEY = "mssn_guest_notification_id";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "questions" | "broadcast" | "system";
  timestamp: number;
  read: boolean;
}

/** Generate a stable guest ID so guests can subscribe to Realtime changes */
function getGuestId(): string {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    try { localStorage.setItem(GUEST_ID_KEY, id); } catch {}
  }
  return id;
}

/**
 * Resolve a usable identifier for the Realtime subscription.
 * Authenticated users use their Supabase user ID; guests get a stable local ID.
 */
export function resolveNotificationUserId(userId: string | null | undefined): string {
  return userId || getGuestId();
}

// ── Singleton Realtime subscription state ─────────────────────────────────
let sharedChannel: RealtimeChannel | null = null;
let sharedSubId: string | null = null;
const callbacks = new Set<(notif: AppNotification) => void>();

/**
 * Initialize (or re-initialize) the single shared Realtime subscription for
 * notifications. Accepts an optional userId — if empty/falsy a local guest ID
 * is used so that guest users can also receive real-time notifications.
 *
 * Once the channel is subscribed, individual components register their
 * callbacks via `registerNotificationCallback()` — they never create their
 * own channel.
 */
function ensureSharedSubscription(subId: string): void {
  // If already subscribed with the same id, do nothing
  if (sharedChannel && sharedSubId === subId) return;

  // If subscribed with a different id, tear down first
  if (sharedChannel) {
    supabase.removeChannel(sharedChannel);
    sharedChannel = null;
  }

  sharedSubId = subId;

  sharedChannel = supabase
    .channel(REALTIME_CHANNEL)
    .on(
      "postgres_changes" as any,
      { event: "INSERT", schema: "public", table: "notifications" },
      async (payload: any) => {
        if (!payload.new) return;
        const row = payload.new as any;
        const notif: AppNotification = {
          id: row.id,
          title: row.title,
          body: row.body,
          type: row.type,
          timestamp: new Date(row.created_at).getTime(),
          read: (row.read_by || []).includes(subId),
        };

        // Merge into local storage
        const all = loadNotifications();
        if (!all.find((n) => n.id === notif.id)) {
          all.unshift(notif);
          if (all.length > 50) all.splice(50);
          saveToLocal(all);
        }

        // Dispatch custom event (for NotificationBell badge count etc.)
        window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: notif }));

        // Notify all registered callbacks
        callbacks.forEach((cb) => cb(notif));
      },
    )
    .subscribe();
}

/**
 * Register a callback to receive real-time notification updates.
 * This does NOT create a new subscription — it registers with the singleton.
 * The subscription is lazily created on first call if not already active.
 *
 * Returns an unregister function. Call on component unmount.
 */
export function registerNotificationCallback(
  userId: string,
  onNewNotification: (notif: AppNotification) => void,
): () => void {
  // Ensure the shared subscription is active
  ensureSharedSubscription(userId);

  // Add this callback to the shared set
  callbacks.add(onNewNotification);

  // Return unregister function
  return () => {
    callbacks.delete(onNewNotification);
  };
}

/**
 * Tear down the shared subscription entirely (e.g. on logout).
 */
export function destroyNotificationSubscription(): void {
  if (sharedChannel) {
    supabase.removeChannel(sharedChannel);
    sharedChannel = null;
  }
  sharedSubId = null;
  callbacks.clear();
}

/** Load persisted notifications from localStorage (offline cache) */
export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw) as AppNotification[];
  } catch {}
  return [];
}

function saveToLocal(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(notifications));
  } catch {}
}

/**
 * Fetch all notifications from the Supabase notifications table.
 * Merges them into localStorage and returns the combined list.
 */
export async function fetchServerNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching server notifications:", error);
      return loadNotifications();
    }

    if (!data || data.length === 0) return loadNotifications();

    const mapped: AppNotification[] = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      type: row.type,
      timestamp: new Date(row.created_at).getTime(),
      read: (row.read_by || []).includes(userId),
    }));

    // Merge with local — pick whichever is newer, prefer server
    const local = loadNotifications();
    const serverIds = new Set(mapped.map((n) => n.id));
    const merged = [...mapped, ...local.filter((n) => !serverIds.has(n.id))].slice(0, 50);
    saveToLocal(merged);
    return merged;
  } catch {
    return loadNotifications();
  }
}

/**
 * Push a notification to the Supabase notifications table (admin-only).
 * Falls back to localStorage-only if the DB insert fails.
 */
export async function pushNotification(
  notif: Omit<AppNotification, "id" | "read">,
): Promise<void> {
  // Always save locally first (instant feedback for the admin)
  const localNotif: AppNotification = {
    ...notif,
    id: `local-${Date.now()}-${Math.random()}`,
    read: false,
  };
  const all = loadNotifications();
  all.unshift(localNotif);
  if (all.length > 50) all.splice(50);
  saveToLocal(all);
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: localNotif }));

  // Push to Supabase notifications table — this triggers real-time delivery
  // to all connected users via the Realtime subscription
  try {
    const { error } = await supabase.from("notifications").insert({
      title: notif.title,
      body: notif.body,
      type: notif.type,
    });
    if (error) {
      console.error("Error pushing notification to server:", error.message);
    }
  } catch (err) {
    console.error("Failed to push notification to server:", err);
  }
}

export async function markAllRead(userId: string): Promise<void> {
  // Update local
  const all = loadNotifications().map((n) => ({ ...n, read: true }));
  saveToLocal(all);

  // Update server — add user id to read_by for each unread notification
  try {
    const { data } = await supabase
      .from("notifications")
      .select("id, read_by")
      .not("read_by", "cs", `{${userId}}`);

    if (data && data.length > 0) {
      for (const row of data) {
        const readBy = row.read_by || [];
        if (!readBy.includes(userId)) {
          await supabase
            .from("notifications")
            .update({ read_by: [...readBy, userId] })
            .eq("id", row.id);
        }
      }
    }
  } catch {}

  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: null }));
}

export async function markRead(id: string, userId: string): Promise<void> {
  // Update local
  const all = loadNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  saveToLocal(all);

  // Update server
  try {
    const { data } = await supabase
      .from("notifications")
      .select("read_by")
      .eq("id", id)
      .single();

    if (data) {
      const readBy = data.read_by || [];
      if (!readBy.includes(userId)) {
        await supabase
          .from("notifications")
          .update({ read_by: [...readBy, userId] })
          .eq("id", id);
      }
    }
  } catch {}
}

export async function deleteNotification(id: string): Promise<void> {
  // Remove from local
  const all = loadNotifications().filter((n) => n.id !== id);
  saveToLocal(all);
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: null }));

  // Delete from server (admin only — RLS will enforce)
  try {
    await supabase.from("notifications").delete().eq("id", id);
  } catch {}
}

export async function clearAllNotifications(): Promise<void> {
  saveToLocal([]);
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: null }));
}

export function getUnreadCount(): number {
  return loadNotifications().filter((n) => !n.read).length;
}

export const NOTIFICATION_EVENT = CUSTOM_EVENT;

/**
 * Legacy function kept for backward compatibility.
 * Now delegates to the singleton pattern instead of creating separate channels.
 * @deprecated Use registerNotificationCallback() instead.
 */
export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notif: AppNotification) => void,
): () => void {
  return registerNotificationCallback(userId, onNewNotification);
}