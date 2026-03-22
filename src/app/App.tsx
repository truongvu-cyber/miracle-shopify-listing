import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Toaster } from "sonner";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Loader2 } from "lucide-react";

function AuthGuard() {
  const { user, loading, checkAuth } = useAuthStore();
  const resolved = useThemeStore((s) => s.resolved);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    if (!loading && user && window.location.pathname === "/login") {
      window.location.href = "/";
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme={resolved}
        toastOptions={{
          style: {
            fontFamily: "inherit",
          },
        }}
      />
    </>
  );
}

export function App() {
  return <AuthGuard />;
}
