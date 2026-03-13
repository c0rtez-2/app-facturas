const CACHE_NAME = 'app-facturas-v1';
const urlsToCache = [
  './',
  './index.html',
  './menu.html',
  './nueva-factura.html',
  './lista-facturas.html',
  './clientes.html',
  './productos.html',
  './styles.css',
  './factura.css',
  './lista.css',
  './clientes.css',
  './productos.css',
  './localStorage.js',
  './factura.js',
  './lista.js',
  './clientes.js',
  './productos.js',
  './icon-192.png',
  './icon-512.png'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});