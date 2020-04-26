var dataCacheName = 'releaseData-v1';
var cacheName = 'releasePWA';
var filesToCache = [
    '/',
    '/favicon.ico',
    '/fonts/glyphicons-halflings-regular.woff2',
    '/fonts/glyphicons-halflings-regular.woff',
    '/fonts/glyphicons-halflings-regular.ttf',
    '/fonts/glyphicons-halflings-regular.eot',
    '/fonts/glyphicons-halflings-regular.svg',
    '/images/icons/user.svg',
    '/stylesheets/style.css',
    '/stylesheets/bootstrap.min.css',
    '/scripts/bootstrap.min.js',
    '/scripts/jquery.min.js',
    '/scripts/index.js',
    '/scripts/head.js',
    '/scripts/release.js',
    '/scripts/show-story.js',
    '/scripts/idb.js',
    '/scripts/init-service-worker.js'
];

/**
 * installation event: it adds all the files to be cached
 */
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

/**
 * activation of service worker: it removes all cashed files if necessary
 */
self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    console.log('[Service Worker] Fetch', e.request.url);
    let isDataUrl=false;
    var dataUrl = ['/head','/release','/show-story','/get-comments','/get_user','/release-moments','/show-story','/add-comment','/get-star','/update-star'];
    //if the request is '/', post to the server - do nit try to cache it
    dataUrl.forEach(item=>{
        let url="https://localhost:3000"+item;
        if(url===e.request.url){
            isDataUrl=true;
        }
    });
    if (isDataUrl) {

        return fetch(e.request).then(function (response) {
            // note: it the network is down, response will contain the error
            // that will be passed to Ajax

            return response;
        })
    } else {
        e.respondWith(
            caches.match(e.request).then(function (response) {
                return response
                    || fetch(e.request)
                        .then(function (response) {
                            // note if network error happens, fetch does not return
                            // an error. it just returns response not ok
                            // https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
                            if (!response.ok) {
                                console.log("error: " + response.error());
                            }
                        })
                        .catch(function (err) {
                            console.log("error: " + err);
                        })
            })
        );
    }
});
