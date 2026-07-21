import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { supabase } from "../context/AuthContext";
import { FIREBASE_CONFIG, FIREBASE_VAPID_KEY } from "./firebaseConfig";

// Initialize Firebase only once
function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(FIREBASE_CONFIG);
  }
  return getApps()[0];
}

/**
 * Request browser notification permission and save the FCM token to the user's profile.
 * If permission is denied or unsupported, silently skip — the user still gets in-app
 * notifications via the notifications table.
 */
export async function requestNotificationPermission(userId: string): Promise<void> {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return; // Not in a browser context
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission not granted:", permission);
      return;
    }

    const app = getFirebaseApp();
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: FIREBASE_VAPID_KEY });

    if (token) {
      await supabase.from("profiles").update({ fcm_token: token }).eq("id", userId);
    }
  } catch (err) {
    // Silently fail — notifications are non-critical
    console.warn("Failed to request notification permission:", err);
  }
}

/**
 * Register the Firebase messaging service worker.
 * Call this once on app startup.
 */
export function registerFirebaseSW(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  // Register the service worker if not already registered
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(() => {
      console.log("Firebase messaging SW registered");
    })
    .catch((err) => {
      console.warn("Failed to register Firebase SW:", err);
    });
}