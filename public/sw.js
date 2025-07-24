// Hero's Ledger Service Worker
// Enables PWA functionality, caching, and auto-updates

const CACHE_NAME = 'heros-ledger-v1.0.0';
const API_CACHE_NAME = 'heros-ledger-api-v1.0.0';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// API endpoints to cache (for offline functionality)
const API_CACHE_URLS = [
  // Add important API endpoints here if needed
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      // Cache API resources
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching API resources');
        return cache.addAll(API_CACHE_URLS);
      })
    ]).then(() => {
      console.log('[SW] Service worker installed successfully');
      // Force activation of new service worker
      self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Failed to install service worker:', error);
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service worker activated successfully');
      
      // Notify all clients about the update
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            message: 'App has been updated! Refresh to see the latest version.'
          });
        });
      });
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }
        
        // Fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Determine which cache to use
            const cacheName = url.pathname.startsWith('/api/') ? API_CACHE_NAME : CACHE_NAME;
            
            // Cache the response
            caches.open(cacheName)
              .then((cache) => cache.put(request, responseToCache));
            
            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
            
            throw error;
          });
      })
  );
});

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('[SW] Skipping waiting...');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        type: 'VERSION',
        version: CACHE_NAME
      });
      break;
      
    case 'CLEAR_CACHE':
      console.log('[SW] Clearing cache...');
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED',
          success: true
        });
      });
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Push event - handle push notifications (future feature)
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'heros-ledger-notification',
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification("Hero's Ledger", options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      // Check if app is already open
      const existingClient = clients.find((client) => 
        client.url.includes(event.notification.data.url) && 'focus' in client
      );
      
      if (existingClient) {
        return existingClient.focus();
      }
      
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Sync event - handle background sync (future feature)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      console.log('[SW] Performing background sync...')
    );
  }
});

// Periodic background sync (future feature)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic background sync triggered:', event.tag);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(
      // Perform periodic sync operations
      console.log('[SW] Performing periodic sync...')
    );
  }
});

console.log('[SW] Service worker script loaded');