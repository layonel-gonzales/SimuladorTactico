/**
 * 🚀 SERVICE WORKER AVANZADO - SIMULADOR TÁCTICO
 * 
 * Funcionalidades:
 * - Offline-first con caché inteligente
 * - Background sync para sincronización
 * - Push notifications
 * - Actualización automática
 * - Análisis de uso
 * 
 * @version 2.0.0
 */

const CACHE_NAME = 'tacticpro-v2.0.0';
const STATIC_CACHE = 'tacticpro-static-v2.0.0';
const DYNAMIC_CACHE = 'tacticpro-dynamic-v2.0.0';
const API_CACHE = 'tacticpro-api-v2.0.0';

// Archivos críticos para caché inmediato
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/css/estilo-unificado.css',
  '/js/main.js',
  '/js/freemiumController.js',
  '/js/playerManager.js',
  '/js/drawingManager.js',
  '/js/animationManager.js',
  '/js/uiManager.js',
  '/img/ball.png',
  '/img/default_player.png',
  '/img/marco.png',
  '/img/logoStoiko.png',
  '/manifest.json'
];

// Archivos para caché progresivo
const CACHEABLE_RESOURCES = [
  '/admin-panel.html',
  '/dev-panel.html',
  '/payment-test.html',
  '/css/mobile-fixes.css',
  '/css/orientation-modal.css',
  '/js/paymentManagerTest.js',
  '/js/configurationManager.js',
  '/js/tutorialManager.js',
  '/js/themeManager.js',
  '/js/fullscreenManager.js'
];

// APIs que se pueden cachear
const API_ENDPOINTS = [
  '/api/config',
  '/api/health',
  '/api/user/plan'
];

// 📦 INSTALACIÓN DEL SERVICE WORKER
self.addEventListener('install', (event) => {
  console.log('🚀 SW: Instalando Service Worker v2.0.0');
  
  event.waitUntil(
    Promise.all([
      // Caché crítico inmediato
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 SW: Cacheando recursos críticos');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      
      // Caché progresivo
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('📂 SW: Preparando caché dinámico');
        return cache.addAll(CACHEABLE_RESOURCES.slice(0, 5)); // Solo algunos inicialmente
      }),
      
      // Configurar background sync
      setupBackgroundSync(),
      
      // Skip waiting para activación inmediata
      self.skipWaiting()
    ])
  );
});

// 🔄 ACTIVACIÓN DEL SERVICE WORKER
self.addEventListener('activate', (event) => {
  console.log('✅ SW: Activando Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      cleanOldCaches(),
      
      // Tomar control inmediato
      self.clients.claim(),
      
      // Notificar a clientes sobre actualización
      notifyClientsOfUpdate()
    ])
  );
});

// 🌐 ESTRATEGIA DE FETCH (OFFLINE-FIRST)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estrategias por tipo de recurso
  if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticResource(url)) {
    event.respondWith(handleStaticResource(request));
  } else if (isHTMLRequest(request)) {
    event.respondWith(handleHTMLRequest(request));
  } else {
    event.respondWith(handleDynamicResource(request));
  }
});

// 🔄 BACKGROUND SYNC PARA TÁCTICAS
self.addEventListener('sync', (event) => {
  console.log('🔄 SW: Background sync disparado:', event.tag);
  
  if (event.tag === 'sync-tactics') {
    event.waitUntil(syncPendingTactics());
  } else if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  } else if (event.tag === 'sync-user-preferences') {
    event.waitUntil(syncUserPreferences());
  }
});

// 📨 PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  console.log('📨 SW: Push notification recibida');
  
  const options = {
    body: 'Tienes nuevas actualizaciones en tus tácticas colaborativas',
    icon: '/img/icon-192.png',
    badge: '/img/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/?notification=collaboration'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir Táctica',
        icon: '/img/icon-open.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar',
        icon: '/img/icon-dismiss.png'
      }
    ],
    tag: 'collaboration-update',
    renotify: true,
    requireInteraction: true
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Simulador Táctico', options)
  );
});

// 🖱️ CLICK EN NOTIFICACIONES
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ SW: Click en notificación');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'dismiss') {
    // Solo cerrar
  } else {
    // Click principal en la notificación
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        } else {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// 📤 SHARE TARGET HANDLER
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleSharedContent(event.request));
  }
});

// 🔧 FUNCIONES AUXILIARES

async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Intentar red primero para APIs
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear respuesta exitosa
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 SW: Red no disponible, usando caché para API');
    
    // Usar caché si la red falla
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Respuesta offline personalizada para APIs
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Funcionalidad disponible cuando recuperes conexión',
        offline: true
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleStaticResource(request) {
  // Cache-first para recursos estáticos
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Actualizar en background si es necesario
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ SW: Recurso estático no disponible offline');
    return new Response('Recurso no disponible offline', { status: 404 });
  }
}

async function handleHTMLRequest(request) {
  // Network-first para HTML, con fallback
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 SW: Sirviendo HTML desde caché');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback a página principal si no hay caché
    return caches.match('/index.html');
  }
}

async function handleDynamicResource(request) {
  // Stale-while-revalidate para recursos dinámicos
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    console.log('🌐 SW: Recurso dinámico no disponible');
  });
  
  return cachedResponse || fetchPromise;
}

async function syncPendingTactics() {
  console.log('🔄 SW: Sincronizando tácticas pendientes');
  
  try {
    // Obtener tácticas pendientes de IndexedDB
    const pendingTactics = await getPendingTacticsFromDB();
    
    for (const tactic of pendingTactics) {
      try {
        const response = await fetch('/api/tactics/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tactic.token}`
          },
          body: JSON.stringify({ tacticData: tactic.data })
        });
        
        if (response.ok) {
          await removePendingTacticFromDB(tactic.id);
          console.log('✅ SW: Táctica sincronizada:', tactic.id);
        }
      } catch (error) {
        console.log('❌ SW: Error sincronizando táctica:', error);
      }
    }
  } catch (error) {
    console.log('❌ SW: Error en sync de tácticas:', error);
  }
}

async function syncAnalytics() {
  console.log('📊 SW: Sincronizando analytics');
  
  try {
    const pendingEvents = await getPendingAnalyticsFromDB();
    
    if (pendingEvents.length > 0) {
      const response = await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: pendingEvents })
      });
      
      if (response.ok) {
        await clearPendingAnalyticsFromDB();
        console.log('✅ SW: Analytics sincronizados');
      }
    }
  } catch (error) {
    console.log('❌ SW: Error sincronizando analytics:', error);
  }
}

async function syncUserPreferences() {
  console.log('⚙️ SW: Sincronizando preferencias de usuario');
  // Implementar sincronización de preferencias
}

async function handleSharedContent(request) {
  console.log('📤 SW: Manejando contenido compartido');
  
  const formData = await request.formData();
  const title = formData.get('title');
  const text = formData.get('text');
  const url = formData.get('url');
  const file = formData.get('tactic_file');
  
  // Procesar contenido compartido
  const shareData = { title, text, url, file };
  
  // Guardar en IndexedDB para procesamiento posterior
  await saveSharedContentToDB(shareData);
  
  // Redirigir a la aplicación con parámetros
  return Response.redirect('/?shared=true', 302);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isStaticResource(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('tacticpro-') && 
    !name.includes('v2.0.0')
  );
  
  return Promise.all(
    oldCaches.map(cacheName => {
      console.log('🗑️ SW: Eliminando caché antiguo:', cacheName);
      return caches.delete(cacheName);
    })
  );
}

async function updateCacheInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response);
    }
  } catch (error) {
    // Fallo silencioso en background
  }
}

async function notifyClientsOfUpdate() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SW_UPDATED',
      message: 'Nueva versión disponible'
    });
  });
}

function setupBackgroundSync() {
  console.log('🔄 SW: Configurando background sync');
  // El background sync se registra cuando sea necesario
  return Promise.resolve();
}

// 💾 FUNCIONES DE INDEXEDDB (placeholder - implementar según necesidad)
async function getPendingTacticsFromDB() {
  // Implementar lectura de IndexedDB
  return [];
}

async function removePendingTacticFromDB(id) {
  // Implementar eliminación de IndexedDB
  return Promise.resolve();
}

async function getPendingAnalyticsFromDB() {
  // Implementar lectura de analytics de IndexedDB
  return [];
}

async function clearPendingAnalyticsFromDB() {
  // Implementar limpieza de analytics de IndexedDB
  return Promise.resolve();
}

async function saveSharedContentToDB(data) {
  // Implementar guardado de contenido compartido
  return Promise.resolve();
}

console.log('🎯 SW: Service Worker Avanzado cargado correctamente');
