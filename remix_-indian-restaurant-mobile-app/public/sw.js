// Royal Saffron Legacies - Service Worker for Offline Menu Browsing & Asset Caching
const CACHE_NAME = "saffron-legacy-cache-v1";

// Cache essential static paths and Unsplash food images
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching static assets and menus");
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache registry:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Caching Strategy: Network falling back to Cache with Cache-Update)
self.addEventListener("fetch", (event) => {
  // Only handle local GET, HTTP or Unsplash image resources
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Exclude AI API routes to prevent caching or failing raw completions
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If valid response, clone and cache it
        if (response && response.status === 200) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed (offline). Search Cache registry
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Default fallbacks for main navigations
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
          return new Response("Network offline and asset not cached.", {
            status: 503,
            statusText: "Service Unavailable"
          });
        });
      })
  );
});
