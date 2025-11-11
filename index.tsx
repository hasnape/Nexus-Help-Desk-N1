// index.tsx (racine)
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App, { AppProvider } from "@/App";
import { LanguageProvider } from "@/contexts/LanguageContext";

import "@/index.css";
import "@/styles/bootstrap-lite.css";
import "@/i18n";

const root = document.getElementById("root");
if (!root) throw new Error("Could not find #root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <LanguageProvider>
      <AppProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </LanguageProvider>
  </React.StrictMode>
);
