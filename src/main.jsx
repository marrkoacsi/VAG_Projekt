import React from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./App.css";
import "./styles/global.css";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Ide másold be a Google Cloud Console-ban kapott Client ID-t */}
    <GoogleOAuthProvider clientId="50382576612-fg6ovama0ttos2iu11jc8g0k8rn2n83n.apps.googleusercontent.com">
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
