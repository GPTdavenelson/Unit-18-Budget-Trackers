const FILES_TO_CACHE = ['/', '/index.html', '/index.js', 'styles.css'];
var networkDataReceived = false;

const PRECACHE = 'precache-v1';
const RUNTIME_CACHE = 'runtime';
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(PRECACHE)
            .then((cache) => {
                cache.addAll(FILES_TO_CACHE);
            })
            .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
    const currentCaches = [PRECACHE, RUNTIME_CACHE];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete);
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // non GET requests are not cached and requests to other origins are not cached
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        // event.respondWith(fetch(event.request));

        event.respondWith(
            caches
                .open(RUNTIME_CACHE)
                .then((cache) => {
                    return fetch(event.request)
                        .then((response) => {
                            // If the response was good, clone it and store it in the cache.
                            if (response.status === 200) {
                                console.log('RESPONSE GOOD', response);

                                cache.put(event.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch((err) => {
                            // Network request failed, try to get it from the cache.
                            return cache.match(event.request);
                        });
                })
                .catch((err) => console.log(err))
        );
        return;
    }
    if (event.request.url.includes('/api/')) {
        // make network request and fallback to cache if network request fails (offline)
        event.respondWith(
            caches.open(RUNTIME_CACHE).then((cache) => {
                return fetch(event.request)
                    .then((response) => {
                        cache.put(event.request, response.clone());
                        return response;
                    })
                    .catch(() => caches.match(event.request));
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            console.log('cachedResponse', cachedResponse);

            if (cachedResponse) {
                return cachedResponse;
            }

            // request is not in cache. make network request and cache the response
            return caches.open(RUNTIME_CACHE).then((cache) => {
                return fetch(event.request).then((response) => {
                    console.log('RUNTIME_CACHE', event.request);

                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            });
        })
    );
});
