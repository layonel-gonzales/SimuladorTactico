// Service Worker para FIFA Soccer Tactics PWA
const CACHE_NAME = 'soccer-tactics-v1.0.0';
const STATIC_CACHE = 'soccer-tactics-static-v1.0.0';
const DYNAMIC_CACHE = 'soccer-tactics-dynamic-v1.0.0';

// Archivos esenciales para cachear (funcionamiento offline)
const STATIC_FILES = [
    './',
    './index.html',
    './manifest.json',
    
    // CSS
    './css/estilo.css',
    
    // JavaScript
    './js/main.js',
    './js/fieldDrawer.js',
    './js/playerManager.js',
    './js/players.js',
    './js/drawingManager.js',
    './js/ballDrawingManager.js',
    './js/animationManager.js',
    './js/audioManager.js',
    './js/uiManager.js',
    './js/shareManager.js',
    './js/tutorialManager.js',
    './js/modeManager.js',
    './js/orientationManager.js',
    './js/fullscreenManager.js',
    './js/htmlUpdater.js',
    './js/utils.js',
    
    // Imágenes esenciales
    './img/ball.png',
    './img/default_player.png',
    './img/logoStoiko.png',
    './img/marco.png',
    './img/marco3.png',
    './img/rotate-device.png',
    
    // Librerías externas (fallback offline)
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/intro.js@7.2.0/minified/introjs.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Cacheando archivos estáticos...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Todos los archivos estáticos cacheados');
                return self.skipWaiting(); // Activar inmediatamente
            })
            .catch(error => {
                console.error('[SW] Error al cachear archivos estáticos:', error);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Limpiar cachés antiguos
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Eliminando caché antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activado');
                return self.clients.claim(); // Tomar control de todas las pestañas
            })
    );
});

// Interceptar requests (estrategia Cache First para mejor rendimiento)
self.addEventListener('fetch', event => {
    // Solo interceptar requests HTTP/HTTPS
    if (!event.request.url.startsWith('http')) return;
    
    // Estrategia: Cache First para archivos estáticos, Network First para APIs
    if (isStaticFile(event.request.url)) {
        // Cache First para archivos estáticos
        event.respondWith(cacheFirst(event.request));
    } else {
        // Network First para contenido dinámico
        event.respondWith(networkFirst(event.request));
    }
});

// Cache First Strategy (ideal para archivos estáticos)
function cacheFirst(request) {
    return caches.match(request)
        .then(cachedResponse => {
            if (cachedResponse) {
                console.log('[SW] Sirviendo desde caché:', request.url);
                return cachedResponse;
            }
            
            // Si no está en caché, buscar en red y cachear
            return fetch(request)
                .then(response => {
                    // Solo cachear respuestas exitosas
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(error => {
                    console.error('[SW] Error de red para:', request.url, error);
                    // Mostrar página offline si existe
                    if (request.destination === 'document') {
                        return caches.match('./index.html');
                    }
                });
        });
}

// Network First Strategy (ideal para contenido dinámico)
function networkFirst(request) {
    return fetch(request)
        .then(response => {
            if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE)
                    .then(cache => {
                        cache.put(request, responseClone);
                    });
            }
            return response;
        })
        .catch(error => {
            console.log('[SW] Red no disponible, buscando en caché:', request.url);
            return caches.match(request);
        });
}

// Verificar si es archivo estático
function isStaticFile(url) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
    const staticDomains = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com'];
    
    return staticExtensions.some(ext => url.includes(ext)) || 
           staticDomains.some(domain => url.includes(domain)) ||
           url.includes('manifest.json');
}

// Escuchar mensajes del cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync para funciones futuras
self.addEventListener('sync', event => {
    console.log('[SW] Background Sync:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Aquí podrías sincronizar datos cuando vuelva la conexión
            console.log('[SW] Realizando sincronización en segundo plano')
        );
    }
});

// Push notifications (para funciones futuras)
self.addEventListener('push', event => {
    console.log('[SW] Push notification recibida:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Nueva actualización disponible',
        icon: './img/icon-192.png',
        badge: './img/icon-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Abrir aplicación',
                icon: './img/icon-192.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: './img/icon-192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('FIFA Soccer Tactics', options)
    );
});

console.log('[SW] Service Worker FIFA Soccer Tactics cargado correctamente');
