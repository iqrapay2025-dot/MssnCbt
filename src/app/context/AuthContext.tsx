import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createClient, type User, type Session } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

// Singleton Supabase client — import this anywhere auth calls are needed
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  /** True while the initial session check is in progress */
  loading: boolean;
  /** True when user chose "Continue as Guest" */
  isGuest: boolean;
  /** Resolved display name from Supabase metadata → localStorage fallback */
  displayName: string;
  continueAsGuest: (name?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  isGuest: false,
  displayName: "Student",
  continueAsGuest: () => {},
  signOut: async () => {},
});

function syncDisplayName(user: User | null) {
  if (!user) return;
  const phone = user.user_metadata?.phone as string | undefined;
  const name =
    (user.user_metadata?.name as string | undefined)?.trim() ||
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    (phone ? `User ${phone.slice(-4)}` : "") ||
    (!user.email?.endsWith("@phone.mssncbt.ng")
      ? user.email?.split("@")[0]
      : "") ||
    "Student";
  if (name) localStorage.setItem("mssn_user_name", name);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(
    () => !!localStorage.getItem("mssn_guest_mode"),
  );

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      syncDisplayName(s?.user ?? null);
      setLoading(false);
    });

    // Keep auth state in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        syncDisplayName(s?.user ?? null);
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const displayName =
    (user?.user_metadata?.name as string | undefined)?.trim() ||
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    (user?.user_metadata?.phone
      ? `User ${(user.user_metadata.phone as string).slice(-4)}`
      : "") ||
    (!user?.email?.endsWith("@phone.mssncbt.ng")
      ? user?.email?.split("@")[0] ?? ""
      : "") ||
    localStorage.getItem("mssn_user_name") ||
    "Student";

  const continueAsGuest = (name = "Guest User") => {
    localStorage.setItem("mssn_guest_mode", "true");
    localStorage.setItem("mssn_user_name", name);
    setIsGuest(true);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("mssn_guest_mode");
    localStorage.removeItem("mssn_user_name");
    setIsGuest(false);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, isGuest, displayName, continueAsGuest, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
