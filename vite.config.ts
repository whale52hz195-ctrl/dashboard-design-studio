import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  define: {
    // Define process for browser compatibility
    global: "globalThis",
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
  },
  optimizeDeps: {
    include: ['firebase/firestore'],
    exclude: ['firebase-admin', 'google-auth-library', 'google-logging-utils', 'gcp-metadata'],
  },
});
