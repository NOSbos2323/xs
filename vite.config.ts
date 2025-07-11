import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh optimizations
      fastRefresh: true,
      // Use SWC for faster compilation
      jsxImportSource: undefined,
    }),
    tempo(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff2,mp3,woff,ttf,eot,json}",
        ],
        maximumFileSizeToCacheInBytes: 10000000, // Increased to 10MB for complete offline support
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        offlineGoogleAnalytics: false, // Disable for better offline performance
        // Complete offline navigation support
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/, /^\/api\//],
        // Cache all routes for offline access
        navigateFallbackAllowlist: [
          /^(?!.*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp3|json)$).*/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "dicebear-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days for offline
              },
            },
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "unsplash-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days for offline
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst", // Must use NetworkFirst with networkTimeoutSeconds
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 2,
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "CacheFirst", // Changed to CacheFirst for offline
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "fonts-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "audio",
            handler: "CacheFirst",
            options: {
              cacheName: "audio-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      includeAssets: ["yacin-gym-logo.png", "success-sound.mp3"],
      manifest: {
        name: "Amino Gym - نظام إدارة الصالة الرياضية",
        short_name: "Amino Gym",
        description:
          "نظام إدارة شامل للصالة الرياضية مع إدارة الأعضاء والمدفوعات - يعمل دون انترنت بالكامل",
        theme_color: "#1e293b",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "ar",
        dir: "rtl",
        prefer_related_applications: false,
        // Enhanced offline capabilities
        display_override: [
          "window-controls-overlay",
          "standalone",
          "minimal-ui",
        ],
        protocol_handlers: [],
        icons: [
          {
            src: "yacin-gym-logo.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "yacin-gym-logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        categories: ["fitness", "health", "business", "productivity"],
        shortcuts: [
          {
            name: "الأعضاء",
            short_name: "الأعضاء",
            description: "إدارة أعضاء الصالة الرياضية",
            url: "/home?tab=attendance",
            icons: [{ src: "yacin-gym-logo.png", sizes: "96x96" }],
          },
          {
            name: "المدفوعات",
            short_name: "المدفوعات",
            description: "إدارة المدفوعات والاشتراكات",
            url: "/home?tab=payments",
            icons: [{ src: "yacin-gym-logo.png", sizes: "96x96" }],
          },
          {
            name: "حضور اليوم",
            short_name: "الحضور",
            description: "عرض حضور اليوم",
            url: "/home?tab=today-attendance",
            icons: [{ src: "yacin-gym-logo.png", sizes: "96x96" }],
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.warn"],
        passes: 3, // Increased passes for better compression
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        hoist_funs: true,
        hoist_vars: true,
      },
      mangle: {
        safari10: true,
        toplevel: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("@radix-ui")) {
              return "radix-ui";
            }
            if (id.includes("lucide-react")) {
              return "icons";
            }
            if (id.includes("framer-motion")) {
              return "animations";
            }
            if (id.includes("localforage")) {
              return "storage";
            }
            return "vendor";
          }
          // App chunks
          if (id.includes("/services/")) {
            return "services";
          }
          if (id.includes("/components/ui/")) {
            return "ui-components";
          }
          if (id.includes("/components/")) {
            return "components";
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                .replace(".tsx", "")
                .replace(".ts", "")
            : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    cssCodeSplit: true,
    // Enable tree shaking
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    reportCompressedSize: false, // Disable gzip size reporting for faster builds
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
    strictPort: true,
    // Performance optimizations
    hmr: {
      overlay: false, // Disable error overlay for better performance
    },
    fs: {
      strict: true,
      allow: [
        resolve(__dirname, "."),
        resolve(__dirname, "src"),
        resolve(__dirname, "public"),
        resolve(__dirname, "node_modules"),
      ],
      deny: ["/home", "/root", "/etc", "/usr", "/var", "/tmp"],
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "localforage",
      "framer-motion",
      "lucide-react",
    ],
    exclude: ["tempo-devtools"],
  },
  // Enable esbuild optimizations
  esbuild: {
    target: "esnext",
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    treeShaking: true,
  },
});
