const CACHE = 'dbYouth-v1';
const PRECACHE = ['./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(PRECACHE.map(u => c.add(u).catch(()=>{})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('script.google.com') || url.hostname.includes('drive.google.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify({error:'offline'}),{headers:{'Content-Type':'application/json'}})));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
    const clone = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, clone));
    return r;
  }).catch(() => caches.match('./index.html'))));
});
