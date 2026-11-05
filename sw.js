/* Offline cache for the Busy Book. Bump VERSION whenever any file changes. */
const VERSION = 'busy-book-v1';
const FILES = [
  './', 'index.html', 'manifest.json', 'home-button.js',
  'icons/icon-180.png', 'icons/icon-512.png', 'icons/panda-tile.svg', 'icons/lion-tile.webp',
  'fonts/poppins-latin-600-normal.woff2', 'fonts/poppins-latin-900-normal.woff2',
  'lion/index.html', 'lion/data.js',
  'lion/assets/lion-dance.mp4', 'lion/assets/party.mp4',
  'lion/assets/lion-hold.webp', 'lion/assets/lion-write.webp',
  'lion/assets/scene1.webp', 'lion/assets/scene2.webp', 'lion/assets/scene3.webp',
  'lion/assets/scene4.webp', 'lion/assets/scene5.webp', 'lion/assets/scene6.webp',
  'lion/assets/scene7.webp',
  'panda/index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
    .then(report));
});

async function report() {
  const c = await caches.open(VERSION);
  let ok = true;
  for (const f of FILES) if (!(await c.match(f))) { ok = false; break; }
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach(cl => cl.postMessage({ type: 'cached', ok }));
}
self.addEventListener('message', e => { if (e.data && e.data.type === 'check') report(); });

/* Safari asks for videos in byte ranges; answer from the cache with a 206. */
async function rangeResponse(req, cached) {
  const buf = await cached.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  const size = buf.byteLength;
  let start = m && m[1] ? parseInt(m[1], 10) : 0;
  let end = m && m[2] ? parseInt(m[2], 10) : size - 1;
  if (m && !m[1] && m[2]) { start = size - parseInt(m[2], 10); end = size - 1; }
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': cached.headers.get('Content-Type') || 'video/mp4',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true }) ||
      (req.mode === 'navigate' ? await caches.match(new URL(req.url).pathname.endsWith('/') ? 'index.html' : req.url, { ignoreSearch: true }) : null);
    if (cached) {
      if (req.headers.has('range')) return rangeResponse(req, cached);
      return cached;
    }
    try { return await fetch(req); }
    catch (err) {
      if (req.mode === 'navigate') return caches.match('index.html');
      throw err;
    }
  })());
});
