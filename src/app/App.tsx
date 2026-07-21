import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { UserProvider } from "./context/UserContext";
import { AuthProvider } from "./context/AuthContext";
import { SplashLoader } from "./components/Loader";
import { QuestionUpdateBanner } from "./components/QuestionUpdateBanner";
import mssnLogo from "../imports/mssn_logo-removebg-preview__3_.png";
import { syncFromServer, subscribeToQuestionsRealtime } from "./utils/questionStore";
import { registerFirebaseSW } from "./utils/notificationPermission";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set favicon
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = mssnLogo;
    link.type = "image/png";

    // Set page lang for screen readers
    document.documentElement.lang = "en";

    // Sync questions from server (restores after reload if localStorage was wiped)
    syncFromServer();

    // Register Firebase messaging service worker for push notifications
    registerFirebaseSW();

    // Subscribe to real-time question changes — when admin adds/deletes questions,
    // all connected clients automatically refresh their local cache
    const unsubscribe = subscribeToQuestionsRealtime(() => {
      // Re-sync from server when questions table changes
      syncFromServer();
    });

    const t = setTimeout(() => setLoading(false), 1200);
    return () => {
      clearTimeout(t);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) return <SplashLoader />;

  return (
    <AuthProvider>
      <UserProvider>
        {/* Skip-to-content link for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-xl focus:font-bold focus:text-white"
          style={{ background: "#1F4E3D" }}
        >
          Skip to main content
        </a>
        <QuestionUpdateBanner />
        <RouterProvider router={router} />
      </UserProvider>
    </AuthProvider>
  );
}
