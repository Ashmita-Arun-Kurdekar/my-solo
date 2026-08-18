import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Toaster } from "react-hot-toast";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/premium.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{ style: { background: "#172033", color: "#f8fafc", border: "1px solid rgba(255,255,255,.12)", borderRadius: "14px" } }} />
  </React.StrictMode>
);
