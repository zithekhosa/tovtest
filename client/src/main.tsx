import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { WebSocketProvider } from "@/hooks/use-websocket-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import React from "react";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <WebSocketProvider>
            <App />
          </WebSocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
