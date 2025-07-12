// Service Worker for PWA
const CACHE_NAME = 'task-wallpaper-v1.0.0';
const urlsToCache = [
    './simple_wallpaper.html',
    './manifest.json',
    'https://html2canvas.hertzen.com/dist/html2canvas.min.js'
];

// インストール時のキャッシュ処理
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('キャッシュを開きました');
                return cache.addAll(urlsToCache);
            })
    );
});

// フェッチ時のキャッシュ戦略
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // キャッシュにあれば返す
                if (response) {
                    return response;
                }

                // なければネットワークから取得
                return fetch(event.request).then(
                    function(response) {
                        // 有効なレスポンスかチェック
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // レスポンスをクローンしてキャッシュに保存
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// アップデート時の古いキャッシュ削除
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('古いキャッシュを削除:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});