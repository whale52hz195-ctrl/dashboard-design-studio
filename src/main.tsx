import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./polyfills"; // Import polyfills for Firebase Admin SDK

createRoot(document.getElementById("root")!).render(<App />);
