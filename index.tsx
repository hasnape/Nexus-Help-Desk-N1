// src/index.tsx (racine)
import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import "@/index.css";
import "@/styles/bootstrap-lite.css";
import "@/i18n";

const root = document.getElementById("root");
if (!root) throw new Error("Could not find #root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
