import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

// Conditionally import tempo only in development
let tempoPlugin;
try {
  if (process.env.NODE_ENV === "development") {
    const { tempo } = await import("tempo-devtools/dist/vite");
    tempoPlugin = tempo();
  }
} catch (error) {
  console.warn("Tempo plugin not available:", error);
}

export default defineConfig({
  plugins: [react(), ...(tempoPlugin ? [tempoPlugin] : [])],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress tempo-related warnings in production
        if (
          warning.code === "UNRESOLVED_IMPORT" &&
          warning.source?.includes("tempo")
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
});
