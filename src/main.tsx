import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Particles from "./components/background/particles.tsx";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Particles />
      <App />
    </StrictMode>,
  );
} else {
  console.error("Elemento raiz não encontrado");
}
