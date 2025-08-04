import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { WebSocketProvider } from "@/hooks/use-websocket-context";

// Clear cache and force reload if needed
if (import.meta.env.DEV) {
  // In development, clear cache on hot reload
  if (typeof module !== 'undefined' && module.hot) {
    module.hot.accept(() => {
      console.log('Hot reload detected, clearing cache...');
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    });
  }
}

// Clear service workers that might be caching old code
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

// Clear localStorage cache if needed
const lastVersion = localStorage.getItem('app-version');
const currentVersion = '2.0.0'; // Increment this when making breaking changes
if (lastVersion !== currentVersion) {
  localStorage.clear();
  localStorage.setItem('app-version', currentVersion);
  console.log('App version changed, cleared cache');
}

// Global error handler to prevent WebSocket errors from breaking the app
const handleGlobalError = (event: ErrorEvent) => {
  // Ignore WebSocket connection errors from cached scripts
  if (event.message && event.message.includes('WebSocket connection to') && event.message.includes('undefined')) {
    console.log('Ignoring cached WebSocket connection error');
    event.preventDefault();
    return;
  }
  
  console.error('Global error caught:', event.error);
};

// Global unhandled promise rejection handler
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  // Ignore WebSocket connection errors from cached scripts
  if (event.reason && event.reason.message && event.reason.message.includes('WebSocket') && event.reason.message.includes('undefined')) {
    console.log('Ignoring cached WebSocket promise rejection');
    event.preventDefault();
    return;
  }
  
  console.error('Unhandled promise rejection:', event.reason);
};

// Add global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  // Temporarily disable StrictMode to prevent double API calls during development
  // <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <WebSocketProvider>
              <Router>
                <App />
              </Router>
            </WebSocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  // </React.StrictMode>,
);
