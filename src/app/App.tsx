import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { Toaster } from "sonner";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useHistoryStore } from "@/hooks/useHistoryStore";

export function App() {
  const resolved = useThemeStore((s) => s.resolved);
  const loadFromDisk = useHistoryStore((s) => s.loadFromDisk);

  useEffect(() => {
    loadFromDisk();
  }, [loadFromDisk]);

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
