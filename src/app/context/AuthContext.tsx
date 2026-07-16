import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createClient, type User, type Session } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

// Singleton Supabase client — import this anywhere auth calls are needed
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

const USER_COUNT_KEY = "mssn_user_count";
const USER_LIST_KEY = "mssn_user_list";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  /** True while the initial session check is in progress */
  loading: boolean;
  /** True when user chose "Continue as Guest" */
  isGuest: boolean;
  /** Resolved display name from Supabase metadata → localStorage fallback */
  displayName: string;
  /** Whether the authenticated user has admin role */
  isAdmin: boolean;
  continueAsGuest: (name?: string) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  isGuest: false,
  displayName: "Student",
  isAdmin: false,
  continueAsGuest: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
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

function getUserCount(): number {
  try {
    return parseInt(localStorage.getItem(USER_COUNT_KEY) || "0", 10);
  } catch { return 0; }
}

function incrementUserCount(): void {
  try {
    localStorage.setItem(USER_COUNT_KEY, String(getUserCount() + 1));
  } catch {}
}

function getRegisteredUsers(): { name: string; email: string; date: string }[] {
  try {
    const raw = localStorage.getItem(USER_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function addRegisteredUser(name: string, email: string): void {
  try {
    const users = getRegisteredUsers();
    if (!users.find(u => u.email === email)) {
      users.unshift({ name, email, date: new Date().toLocaleDateString() });
      localStorage.setItem(USER_LIST_KEY, JSON.stringify(users.slice(0, 100)));
    }
  } catch {}
}

export { getUserCount, getRegisteredUsers };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(
    () => !!localStorage.getItem("mssn_guest_mode"),
  );
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (uid: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();
      setIsAdmin(data?.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      syncDisplayName(s?.user ?? null);
      if (s?.user) {
        const email = s.user.email || "";
        const name = (s.user.user_metadata?.name as string) || email.split("@")[0] || "Student";
        addRegisteredUser(name, email);
        checkAdminRole(s.user.id);
      }
      setLoading(false);
    });

    // Keep auth state in sync
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        syncDisplayName(s?.user ?? null);
        
        if (event === "SIGNED_IN" && s?.user) {
          const email = s.user.email || "";
          const name = (s.user.user_metadata?.name as string) || email.split("@")[0] || "Student";
          addRegisteredUser(name, email);
          incrementUserCount();
          checkAdminRole(s.user.id);
        }
        
        if (event === "SIGNED_OUT") {
          setIsAdmin(false);
        }
        
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await checkAdminRole(user.id);
    }
  };

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
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, isGuest, displayName, isAdmin, continueAsGuest, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}