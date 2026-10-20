// Service worker of the web app: it keeps the page, the libraries, the CAD kernel, the fonts and the icons in
// the browser, so Cachfinity starts and works without internet once it has been opened. build.py fills in
// the file list, a version made from the files' content and the build of the page; a changed file makes a
// new version, which the browser fetches in the background and takes over at once.
const VERSION = 'ae366bb4bf7b';
const BUILD = 'beaa374930bd';
const FILES = ["apple-touch-icon.png", "fonts/-F63fjptAgt5VM-kVkqdyU8n1i8q1w.woff2", "fonts/-F63fjptAgt5VM-kVkqdyU8n1iEq129k.woff2", "fonts/-F6qfjptAgt5VM-kVkqdyU8n3twJwl5FgtIU.woff2", "fonts/-F6qfjptAgt5VM-kVkqdyU8n3twJwlBFgg.woff2", "fonts/7cHpv4kjgoGqM7E_Ass52Hs.woff2", "fonts/7cHpv4kjgoGqM7E_DMs5.woff2", "fonts/7cHqv4kjgoGqM7E30-8s51os.woff2", "fonts/7cHqv4kjgoGqM7E30-8s6VospT4.woff2", "fonts/7cHqv4kjgoGqM7E3_-gs51os.woff2", "fonts/7cHqv4kjgoGqM7E3_-gs6VospT4.woff2", "fonts/7cHqv4kjgoGqM7E3t-4s51os.woff2", "fonts/7cHqv4kjgoGqM7E3t-4s6VospT4.woff2", "fonts/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2z3bWuQ.woff2", "fonts/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2z3jWuZEC.woff2", "fonts/HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3bWuQ.woff2", "fonts/HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3jWuZEC.woff2", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "./", "manifest.webmanifest", "oc.bundle.js", "replicad.bundle.js", "replicad_single.wasm", "three.bundle.js"];
const CACHE = 'cachfinity-' + VERSION;

self.addEventListener('install', (e) => {
  // straight from the server (not from the browser's HTTP cache, which may still hold the old files)
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('cachfinity-') && k !== CACHE).map((k) => caches.delete(k)))));
});

// the page asks which build this worker brings, to tell whether it is older itself
self.addEventListener('message', (e) => { if (e.data === 'build?' && e.source) e.source.postMessage({ build: BUILD }); });

// The page itself comes from the server when there is a connection, so a new version shows with the first
// reload (it used to take two: the kept page first, the new one only after the worker had updated); without
// one, or when the server takes more than 3 s, the kept copy. Everything else of the app's own comes from
// the cache; other addresses, such as a sign-in at Google, go to the network as usual.
async function page() {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await Promise.race([
      fetch(new URL('./', self.location).href, { cache: 'no-cache' }),
      new Promise((_, no) => setTimeout(() => no(new Error('slow')), 3000)),
    ]);
    if (fresh.ok) return fresh;
  } catch { /* offline or slow: the kept copy */ }
  return (await cache.match('./')) || fetch(new URL('./', self.location).href);
}
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(page()); return; }
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(req, { ignoreSearch: true })) || fetch(req);
  })());
});
