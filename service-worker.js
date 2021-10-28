
  
  self.addEventListener('fetch', function(event) {
    //console.log('used to intercept requests so we can check for the file or data in the cache');
    event.respondWith(
        fetch(event.request)
          .catch(() => {
            return caches.open(CACHE_NAME)
              .then((cache) => {
                return cache.match(event.request)
              })
          })
      )
  });
  
  self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
          .then((keyList) => {
            return Promise.all(keyList.map((key) => {
              if (key !== CACHE_NAME) {
                console.log('[ServiceWorker] Removing old cache', key)
                return caches.delete(key)
              }
            }))
          })
          .then(() => self.clients.claim())
      )
  });


const CACHE_NAME = 'sw-cache-example';
const toCache = [
  '/',
  '/static/js/status.js',
  '/static/js/pwa.js',
  '/static/images/favicon.png',
  '/static/js/pwa.webmanifest',
  '/static/images/splash-screen.png',
  '/static/css/all.min.css',
  '/static/css/portal.css',
  '/static/js/jquery-3.6.0.min.js',
  //webfonts
  '/static/webfonts/fa-solid-900.woff',
  '/static/webfonts/fa-solid-900.woff2',
  '/static/webfonts/fa-solid-900.ttf',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(toCache)
      })
      .then(self.skipWaiting())
  )
})
