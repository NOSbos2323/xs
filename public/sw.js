// Enhanced Service Worker for Amino Gym PWA with complete offline support
const CACHE_NAME = "amino-gym-v5";
const STATIC_CACHE = "amino-gym-static-v5";
const DYNAMIC_CACHE = "amino-gym-dynamic-v5";
const IMAGE_CACHE = "amino-gym-images-v5";
const API_CACHE = "amino-gym-api-v5";
const FONT_CACHE = "amino-gym-fonts-v5";

// Critical resources to cache immediately for offline functionality
const CRITICAL_RESOURCES = [
  "/",
  "/index.html",
  "/home",
  "/login",
  "/payments",
  "/yacin-gym-logo.png",
  "/success-sound.mp3",
  "/manifest.json",
  "/vite.svg",
];

// All app routes that should work offline
const APP_ROUTES = [
  "/",
  "/home",
  "/login",
  "/reports",
  "/settings",
  "/payments",
  "/attendance",
  "/members",
  "/dashboard",
];

// Static assets that rarely change - cache aggressively
const STATIC_ASSETS = [
  "/manifest.json",
  "/yacin-gym-logo.png",
  "/success-sound.mp3",
  "/vite.svg",
];

// Install event - cache all resources for complete offline functionality
self.addEventListener("install", (event) => {
  console.log("Service Worker installing for offline support...");

  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(CACHE_NAME).then(async (cache) => {
        console.log("Caching critical resources for offline use");
        try {
          await cache.addAll(CRITICAL_RESOURCES);
        } catch (error) {
          console.warn("Some critical resources failed to cache:", error);
          // Cache resources individually to avoid complete failure
          for (const resource of CRITICAL_RESOURCES) {
            try {
              await cache.add(resource);
            } catch (err) {
              console.warn(`Failed to cache ${resource}:`, err);
            }
          }
        }
      }),
      // Cache static assets
      caches.open(STATIC_CACHE).then(async (cache) => {
        console.log("Caching static assets");
        try {
          await cache.addAll(STATIC_ASSETS);
        } catch (error) {
          console.warn("Some static assets failed to cache:", error);
        }
      }),
    ]).then(() => {
      console.log(
        "Service Worker installed successfully - App ready for offline use",
      );
      return self.skipWaiting();
    }),
  );
});

// Activate event - clean up old caches and claim clients for offline support
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating for offline support...");

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              ![
                CACHE_NAME,
                STATIC_CACHE,
                DYNAMIC_CACHE,
                IMAGE_CACHE,
                API_CACHE,
                FONT_CACHE,
              ].includes(cacheName)
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      }),
      // Claim all clients immediately for offline functionality
      self.clients.claim(),
    ]).then(() => {
      console.log("Service Worker activated - App fully offline capable");
      // Notify all clients that offline mode is ready
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "OFFLINE_READY",
            message: "التطبيق جاهز للعمل بدون انترنت",
          });
        });
      });
    }),
  );
});

// Enhanced fetch event with complete offline support
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== "GET" || url.protocol === "chrome-extension:") {
    return;
  }

  // Handle different types of requests with offline-first strategies
  if (url.pathname.startsWith("/api/")) {
    // API requests - Cache First for offline support, with network update
    event.respondWith(offlineFirstStrategy(request, API_CACHE));
  } else if (
    request.destination === "image" ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)
  ) {
    // Images - Cache First with offline fallback
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (url.pathname.match(/\.(js|css|mjs)$/)) {
    // JS/CSS/MJS - Cache First for offline functionality
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (url.pathname.match(/\.(woff2?|woff|ttf|eot|otf)$/)) {
    // Fonts - Cache First with long-term storage
    event.respondWith(cacheFirstStrategy(request, FONT_CACHE));
  } else if (url.pathname.match(/\.(mp3|wav|ogg|m4a)$/)) {
    // Audio files - Cache First
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (request.mode === "navigate") {
    // Navigation requests - Offline-capable routing
    event.respondWith(handleNavigation(request));
  } else if (
    url.pathname.includes("@") ||
    url.pathname.includes("node_modules")
  ) {
    // Module imports - Cache First
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    // Other requests - Offline First
    event.respondWith(offlineFirstStrategy(request, DYNAMIC_CACHE));
  }
});

// Offline First strategy - prioritize cache for complete offline functionality
async function offlineFirstStrategy(request, cacheName) {
  // Always try cache first for offline support
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Update cache in background if online
    if (navigator.onLine) {
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(cacheName).then((cache) => {
              cache.put(request, response.clone());
            });
          }
        })
        .catch(() => {});
    }
    return cachedResponse;
  }

  // If not in cache, try network
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed and no cache available:", error);

    // Return offline fallback
    if (request.mode === "navigate") {
      return caches.match("/") || createOfflineResponse();
    }

    // For API requests, return empty response to prevent errors
    if (request.url.includes("/api/")) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    throw error;
  }
}

// Handle navigation with complete offline support
async function handleNavigation(request) {
  const url = new URL(request.url);

  // Check if it's an app route
  const isAppRoute = APP_ROUTES.some(
    (route) => url.pathname === route || url.pathname.startsWith(route + "/"),
  );

  if (isAppRoute) {
    // Always serve the main app for SPA routes
    const cachedApp =
      (await caches.match("/")) || (await caches.match("/index.html"));
    if (cachedApp) {
      return cachedApp;
    }
  }

  // Try network first for other navigation
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cached version or main app
    const cachedResponse =
      (await caches.match(request)) ||
      (await caches.match("/")) ||
      (await caches.match("/index.html"));

    if (cachedResponse) {
      return cachedResponse;
    }

    return createOfflineResponse();
  }
}

// Create offline response with logo
function createOfflineResponse() {
  return new Response(
    `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Amino Gym - وضع عدم الاتصال</title>
      <link rel="icon" type="image/png" href="/yacin-gym-logo.png" />
      <meta name="theme-color" content="#1e293b" />
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: center; 
          padding: 20px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          margin: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .offline-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 30px;
          background: rgba(30, 41, 59, 0.8);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: url('/yacin-gym-logo.png') center/contain no-repeat;
          border-radius: 50%;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        .logo-fallback {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        h1 {
          color: #fbbf24;
          margin: 0 0 10px;
          font-size: 28px;
          font-weight: 700;
        }
        h2 {
          color: #e2e8f0;
          margin: 0 0 20px;
          font-size: 20px;
          font-weight: 500;
        }
        p {
          color: #cbd5e1;
          margin: 10px 0;
          font-size: 16px;
          line-height: 1.5;
        }
        .status-indicator {
          display: inline-block;
          width: 12px;
          height: 12px;
          background: #ef4444;
          border-radius: 50%;
          margin-left: 8px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        button {
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 20px;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
        }
        .features {
          margin-top: 20px;
          text-align: right;
        }
        .feature {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin: 8px 0;
          color: #94a3b8;
          font-size: 14px;
        }
        .feature::before {
          content: '✓';
          color: #10b981;
          font-weight: bold;
          margin-left: 8px;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"></div>
        <div class="logo-fallback" style="display: none;">AG</div>
        
        <h1>Amino Gym</h1>
        <h2>وضع عدم الاتصال <span class="status-indicator"></span></h2>
        
        <p><strong>التطبيق يعمل بدون انترنت بالكامل</strong></p>
        <p>جميع بياناتك وإعداداتك محفوظة محلياً</p>
        
        <div class="features">
          <div class="feature">إدارة الأعضاء والحضور</div>
          <div class="feature">تسجيل المدفوعات</div>
          <div class="feature">عرض التقارير</div>
          <div class="feature">البحث والفلترة</div>
        </div>
        
        <button onclick="window.location.reload()" title="إعادة المحاولة للاتصال بالإنترنت">
          🔄 إعادة تحميل
        </button>
      </div>
      
      <script>
        // Check for logo loading
        const logo = document.querySelector('.logo');
        const logoFallback = document.querySelector('.logo-fallback');
        
        // Test if logo image loads
        const testImg = new Image();
        testImg.onload = function() {
          logo.style.display = 'block';
          logoFallback.style.display = 'none';
        };
        testImg.onerror = function() {
          logo.style.display = 'none';
          logoFallback.style.display = 'flex';
        };
        testImg.src = '/yacin-gym-logo.png';
        
        // Auto-refresh when online
        window.addEventListener('online', function() {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        });
        
        // Update connection status
        function updateStatus() {
          const indicator = document.querySelector('.status-indicator');
          if (navigator.onLine) {
            indicator.style.background = '#10b981';
            indicator.title = 'متصل';
          } else {
            indicator.style.background = '#ef4444';
            indicator.title = 'غير متصل';
          }
        }
        
        updateStatus();
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
      </script>
    </body>
    </html>
  `,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  );
}

// Cache First strategy - try cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // For static assets, use longer cache duration (24 hours)
    const isStaticAsset = request.url.match(
      /\.(js|css|woff2?|woff|ttf|eot|png|jpg|jpeg|gif|svg|ico)$/,
    );
    const cacheDate = new Date(cachedResponse.headers.get("date") || 0);
    const now = new Date();
    const cacheExpiry = isStaticAsset ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 24h for static, 1h for others

    if (now - cacheDate > cacheExpiry) {
      // Background update for expired cache
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(cacheName).then((cache) => {
              cache.put(request, response.clone());
            });
          }
        })
        .catch(() => {});
    }

    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // Clone response before caching
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
    }

    return networkResponse;
  } catch (error) {
    console.log("Failed to fetch resource:", request.url);
    throw error;
  }
}

// Background sync for offline data synchronization
self.addEventListener("sync", (event) => {
  console.log("Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log("Starting background sync...");

    // Sync offline data when connection is restored
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "BACKGROUND_SYNC",
        payload: { status: "started" },
      });
    });

    // Simulate sync process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    clients.forEach((client) => {
      client.postMessage({
        type: "BACKGROUND_SYNC",
        payload: { status: "completed" },
      });
    });

    console.log("Background sync completed");
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Enhanced push notifications
self.addEventListener("push", (event) => {
  let notificationData = {
    title: "Amino Gym",
    body: "إشعار من Amino Gym",
    icon: "/yacin-gym-logo.png",
    badge: "/yacin-gym-logo.png",
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: Date.now(),
      url: notificationData.url || "/",
    },
    actions: [
      {
        action: "open",
        title: "فتح التطبيق",
        icon: "/yacin-gym-logo.png",
      },
      {
        action: "close",
        title: "إغلاق",
      },
    ],
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options),
  );
});

// Handle notification clicks with better navigation
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            if (client.navigate) {
              client.navigate(urlToOpen);
            }
            return;
          }
        }

        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Message handling for communication with main app
self.addEventListener("message", (event) => {
  console.log("Service Worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
if ("periodicSync" in self.registration) {
  self.addEventListener("periodicsync", (event) => {
    if (event.tag === "background-sync") {
      event.waitUntil(doBackgroundSync());
    }
  });
}

console.log("Service Worker loaded successfully");
