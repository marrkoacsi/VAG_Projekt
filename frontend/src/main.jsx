import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// ha az App.css-ben van minden stílus:
import "./App.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
