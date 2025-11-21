import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { initializeDatabase } from "./services/database.ts";
import { ThemeProvider } from "next-themes";

// Initialize the database when the app starts
console.log("Starting database initialization...");
initializeDatabase().then(() => {
  console.log("Database initialized successfully");
  // Render the app only after database is initialized
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    );
  } else {
    console.error("Root element not found");
  }
}).catch((error) => {
  console.error("Failed to initialize database:", error);
  // Even if database fails, we still render the app
  // The app should handle database errors gracefully
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    );
  } else {
    console.error("Root element not found");
  }
});