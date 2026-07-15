const STORE_KEY = "mssn_notifications";
const CUSTOM_EVENT = "mssn-notification";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "questions" | "broadcast" | "system";
  timestamp: number;
  read: boolean;
}

export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as AppNotification[];
  } catch {}
  return [];
}

function saveNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(notifications));
  } catch {}
}

export function pushNotification(notif: Omit<AppNotification, "id" | "read">): void {
  const all = loadNotifications();
  const newNotif: AppNotification = { ...notif, id: `notif-${Date.now()}-${Math.random()}`, read: false };
  all.unshift(newNotif);
  // Keep at most 50 notifications
  if (all.length > 50) all.splice(50);
  saveNotifications(all);

  // Fire storage event for cross-tab (storage event only fires in OTHER tabs)
  // Dispatch a custom event so the SAME tab also reacts
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: newNotif }));
}

export function markAllRead(): void {
  const all = loadNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(all);
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: null }));
}

export function markRead(id: string): void {
  const all = loadNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(all);
}

export function deleteNotification(id: string): void {
  const all = loadNotifications().filter((n) => n.id !== id);
  saveNotifications(all);
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: null }));
}

export function clearAllNotifications(): void {
  saveNotifications([]);
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: null }));
}

export function getUnreadCount(): number {
  return loadNotifications().filter((n) => !n.read).length;
}

export const NOTIFICATION_EVENT = CUSTOM_EVENT;
