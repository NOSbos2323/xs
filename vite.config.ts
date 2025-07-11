import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), ...(process.env.VITE_TEMPO === "true" ? [tempo()] : [])],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
    port: 5173,
    host: true,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "localforage",
      "framer-motion",
      "lucide-react",
    ],
    exclude: ["tempo-devtools", "tempo-routes"],
  },
});
