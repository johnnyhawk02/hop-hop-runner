// Hop Hop Runner service worker: lets the game install as an app and play offline.
// The game's own files (page, styles, scripts, sounds) are fetched fresh when online, so updates arrive,
// with the saved copies as a fallback. three.js and the fonts never change, so they come from the saved copy first.
const CACHE = 'hop-hop-v2';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './css/style.css',
  './js/config.js',
  './js/effects.js',
  './js/game.js',
  './js/input.js',
  './js/loop.js',
  './js/obstacles.js',
  './js/pets.js',
  './js/pickups.js',
  './js/policeman.js',
  './js/runner.js',
  './js/scene.js',
  './js/scenery.js',
  './js/sound.js',
  './js/spawn.js',
  './js/worlds/fair.js',
  './js/worlds/lands.js',
  './js/worlds/sea.js',
  './js/worlds/space.js',
  './js/worlds/spooky.js',
  './audio/elixir_Init_kit_148bpm_4bar_1.mp3',
  './audio/elixir_Init_kit_148bpm_4bar_2.mp3',
  './audio/elixir_Init_kit_148bpm_4bar_3.mp3',
  './audio/elixir_Init_kit_148bpm_4bar_4.mp3',
  './audio/elixir_Init_kit_148bpm_4bar_5.mp3',
  './img/billboard-photo.jpg',
  './models/cottage.glb',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

function save(req, res) {
  if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin === location.origin) {
    // the game's own files: newest when online, saved copy when offline
    const key = req.mode === 'navigate' ? './index.html' : req;
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); }
      return res;
    }).catch(() => caches.match(key, { ignoreSearch: true })));
    return;
  }
  // three.js and fonts: saved copy first, then the network
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => save(req, res))));
});
