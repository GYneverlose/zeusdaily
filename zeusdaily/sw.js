var CACHE_NAME = 'zeus-daily-v15';
var STATIC_ASSETS = [
  '/dashboard',
  '/login',
  '/manifest.json',
  '/icon.svg',
  '/offline.html'
];

// Fonts to cache on first use
var FONT_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// ── Push Notification ──
self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data.json(); } catch(e) {
    data = { title: 'Zeus Daily', body: event.data ? event.data.text() : 'A new issue is live.' };
  }
  var title = data.title || 'Zeus Daily';
  var options = {
    body: data.body || 'A new issue is live.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: { url: data.url || '/dashboard' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(url) >= 0 && 'focus' in list[i]) return list[i].focus();
      }
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Supabase API calls — always network
  if (url.hostname.indexOf('supabase') >= 0) return;

  // Daily HTML files: let browser handle natively (no SW interception)
  // Safari rejects SW responses with redirections (Cloudflare 308 strips .html)
  if (url.pathname.match(/zeus-daily-\d{8}/)) {
    return;
  }

  // Google Fonts: cache first (they never change)
  var isFont = FONT_ORIGINS.some(function(origin) {
    return url.href.indexOf(origin) === 0;
  });
  if (isFont) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          }
          return response;
        });
      })
    );
    return;
  }

  // Static assets: cache first
  if (STATIC_ASSETS.indexOf(url.pathname) >= 0) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        return cached || fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else: network first, fallback to cache, then offline page
  event.respondWith(
    fetch(event.request).then(function(response) {
      // Cache successful navigations for offline use
      if (response.ok && event.request.mode === 'navigate') {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        // Navigation requests get the offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});
