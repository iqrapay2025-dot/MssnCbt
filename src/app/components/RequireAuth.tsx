import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export function RequireAuth() {
  const { user, loading, isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, isGuest, navigate]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F5F0E6" }}
        aria-label="Loading"
        role="status"
      >
        <Loader2 size={32} style={{ color: "#F97316" }} className="animate-spin" />
      </div>
    );
  }

  if (!user && !isGuest) return null;

  return <Outlet />;
}
