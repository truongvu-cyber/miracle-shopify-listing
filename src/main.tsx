import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/App";
import "@/styles/globals.css";
import { useThemeStore } from "@/hooks/useThemeStore";

// Initialize theme before render
useThemeStore.getState().initTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
