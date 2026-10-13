// Workout Rumahan — service worker: aplikasi dibuka dari cache (cepat walau jaringan lelet), diperbarui di latar belakang
const V = 'wr-d390ca28d7';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable.png'];
const FONTS = 'fonts-wr';
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (req.mode === 'navigate') {
      e.respondWith(caches.open(V).then(c => c.match('index.html').then(hit => {
        const net = fetch(req).then(r => { if (r.ok && r.type === 'basic') c.put('index.html', r.clone()); return r; }).catch(() => hit);
        return hit || net;
      })));
      return;
    }
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => { if (r.ok && r.type === 'basic') { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit))));
  }
});
