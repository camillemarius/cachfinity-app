// Service worker of the web app: it keeps the page, the libraries, the CAD kernel, the fonts and the icons in
// the browser, so Cachfinity starts and works without internet once it has been opened. build.py fills in
// the file list and a version made from the files' content; a changed file makes a new version, which the
// browser fetches in the background, takes over at once and the page then offers to reload.
const VERSION = '795b9c3032ea';
const FILES = ["apple-touch-icon.png", "fonts/-F63fjptAgt5VM-kVkqdyU8n1i8q1w.woff2", "fonts/-F63fjptAgt5VM-kVkqdyU8n1iEq129k.woff2", "fonts/-F6qfjptAgt5VM-kVkqdyU8n3twJwl5FgtIU.woff2", "fonts/-F6qfjptAgt5VM-kVkqdyU8n3twJwlBFgg.woff2", "fonts/7cHpv4kjgoGqM7E_Ass52Hs.woff2", "fonts/7cHpv4kjgoGqM7E_DMs5.woff2", "fonts/7cHqv4kjgoGqM7E30-8s51os.woff2", "fonts/7cHqv4kjgoGqM7E30-8s6VospT4.woff2", "fonts/7cHqv4kjgoGqM7E3_-gs51os.woff2", "fonts/7cHqv4kjgoGqM7E3_-gs6VospT4.woff2", "fonts/7cHqv4kjgoGqM7E3t-4s51os.woff2", "fonts/7cHqv4kjgoGqM7E3t-4s6VospT4.woff2", "fonts/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2z3bWuQ.woff2", "fonts/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2z3jWuZEC.woff2", "fonts/HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3bWuQ.woff2", "fonts/HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3jWuZEC.woff2", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "./", "manifest.webmanifest", "oc.bundle.js", "replicad.bundle.js", "replicad_single.wasm", "three.bundle.js"];
const CACHE = 'cachfinity-' + VERSION;

self.addEventListener('install', (e) => {
  // straight from the server (not from the browser's HTTP cache, which may still hold the old files)
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('cachfinity-') && k !== CACHE).map((k) => caches.delete(k)))));
});

// own files come from the cache (the page for every address in the app's folder); everything else, such as
// a sign-in at Google, goes to the network as usual
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = req.mode === 'navigate' ? await cache.match('./') : await cache.match(req, { ignoreSearch: true });
    return hit || fetch(req);
  })());
});
