const PREFIX = 'paintline-' + encodeURIComponent(new URL(self.registration.scope).pathname) + '-';
const CACHE = PREFIX + '58d56b171aafde1d';
const FILES = [
  './index.html', './paintline.html', './world-rewards.js', './world-rewards.css',
  './pwa.js', './pwa.css', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'
];
const ROOT = new URL('./', self.location.href);
const paths = new Map(FILES.map(file => {
  const url = new URL(file, ROOT); return [url.pathname, url.href];
}));
paths.set(ROOT.pathname, new URL('./index.html', ROOT).href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(FILES.map(async file => {
      const request = new Request(new URL(file, ROOT), { cache: 'reload', credentials: 'same-origin' });
      const response = await fetch(request);
      if (!response.ok || response.redirected) throw new Error('Offline file unavailable: ' + file);
      await cache.put(request, response);
    }));
    // İlk iki yayındaki güncelleme düğmesi gizli kalabiliyordu. Bu sürümlerden
    // tek seferlik geçiş: oyun açıkken yenilenmez; sonraki açılış yeni arayüzü alır.
    const legacy = ['731c5b64d53b5b36', 'e1f8a08fd90b6cb0', 'b05d8a16b3276790'];
    if (self.registration.active && (await caches.keys()).some(name => legacy.some(v => name === PREFIX + v))) {
      await self.skipWaiting();
    }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== ROOT.origin || !paths.has(url.pathname)) return;
  // Tahta ve betikler aynı sürümden gelir; yeni sürüm tam hazır olunca devreye girer.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return await cache.match(paths.get(url.pathname)) || fetch(event.request);
  })());
});
