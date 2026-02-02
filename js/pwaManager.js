/**
 * 🚀 PWA MANAGER AVANZADO - SIMULADOR TÁCTICO
 * 
 * Funcionalidades:
 * - Gestión de instalación y actualizaciones
 * - Offline detection y sincronización
 * - Push notifications
 * - Background sync
 * - Share API nativo
 * - File handling
 * 
 * @version 2.0.0
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        this.pendingSync = new Set();
        this.notificationPermission = 'default';
        this.features = {};
        
        this.init();
    }

    async init() {
        
        // Registrar Service Worker
        await this.registerServiceWorker();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Verificar soporte de funcionalidades
        this.checkFeatureSupport();
        
        // Configurar sincronización offline
        this.setupOfflineSync();
        
        // Configurar notificaciones
        await this.setupNotifications();
        
        // Configurar Share API
        this.setupShareAPI();
        
        // Configurar File Handling
        this.setupFileHandling();
        
        // Verificar parámetros de URL
        this.handleURLParams();
    }

    // 📦 REGISTRO DE SERVICE WORKER
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                });

                // Escuchar actualizaciones
                registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate(registration);
                });

                // Escuchar mensajes del SW
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event);
                });

                this.registration = registration;
                return registration;
            } catch (error) {
                console.error('❌ Error registrando Service Worker:', error);
            }
        }
    }

    // 🔄 MANEJO DE ACTUALIZACIONES
    handleServiceWorkerUpdate(registration) {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                    this.showUpdateNotification();
                }
            }
        });
    }

    showUpdateNotification() {
        // Crear notificación de actualización
        if (this.features.notifications) {
            this.sendNotification('Actualización disponible', {
                body: 'Nueva versión del simulador táctico lista',
                actions: [
                    { action: 'update', title: 'Actualizar ahora' },
                    { action: 'later', title: 'Más tarde' }
                ]
            });
        }
    }

    // 📱 GESTIÓN DE INSTALACIÓN
    setupEventListeners() {
        // Evento beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Detectar instalación
        window.addEventListener('appinstalled', () => {
            this.hideInstallButton();
            this.deferredPrompt = null;
        });

        // Eventos de conectividad
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    showInstallButton() {
        // Mostrar botón de instalación si no existe
        if (!document.querySelector('.pwa-install-button')) {
            const installBtn = document.createElement('button');
            installBtn.className = 'pwa-install-button';
            installBtn.innerHTML = '<span class="install-icon">📱</span> Instalar App';
            installBtn.onclick = () => this.promptInstall();
            document.body.appendChild(installBtn);
        }
    }

    hideInstallButton() {
        const installBtn = document.querySelector('.pwa-install-button');
        if (installBtn) {
            installBtn.remove();
        }
    }

    async promptInstall() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const result = await this.deferredPrompt.userChoice;     
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }

    // 🔔 NOTIFICACIONES PUSH
    async setupNotifications() {
        if ('Notification' in window) {
            this.notificationPermission = Notification.permission;
            this.features.notifications = true;
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;
            return permission === 'granted';
        }
        return false;
    }

    async sendNotification(title, options = {}) {
        if (this.notificationPermission === 'granted') {
            const defaultOptions = {
                icon: '/img/icon-192.png',
                badge: '/img/icon-96.png',
                vibrate: [200, 100, 200]
            };
            
            new Notification(title, { ...defaultOptions, ...options });
        }
    }

    // 📤 SHARE API
    setupShareAPI() {
        this.features.share = 'share' in navigator;
    }

    async shareContent(data) {
        if (this.features.share) {
            try {
                await navigator.share(data);
                return true;
            } catch (error) {
                console.warn('Error sharing:', error);
                return false;
            }
        }
        return false;
    }

    canUseNativeShare() {
        return this.features.share;
    }

    // 📁 FILE HANDLING
    setupFileHandling() {
        this.features.fileHandling = 'showOpenFilePicker' in window;
    }

    async openFile(acceptedTypes = ['.tactic']) {
        if (this.features.fileHandling) {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'Archivos de táctica',
                        accept: { 'application/json': acceptedTypes }
                    }]
                });
                
                const file = await fileHandle.getFile();
                return file;
            } catch (error) {
                console.warn('Error opening file:', error);
                return null;
            }
        }
        return null;
    }

    async saveFile(data, filename = 'tactica.tactic') {
        if (this.features.fileHandling) {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'Archivos de táctica',
                        accept: { 'application/json': ['.tactic'] }
                    }]
                });
                
                const writable = await fileHandle.createWritable();
                await writable.write(data);
                await writable.close();
                return true;
            } catch (error) {
                console.warn('Error saving file:', error);
                return false;
            }
        }
        return false;
    }

    // 🌐 SINCRONIZACIÓN OFFLINE
    setupOfflineSync() {
        this.features.backgroundSync = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
    }

    async syncData(key, data) {
        if (this.isOnline) {
            // Sincronizar inmediatamente
            return this.sendToServer(key, data);
        } else {
            // Guardar para sincronización posterior
            this.addToPendingSync(key, data);
            return true;
        }
    }

    addToPendingSync(key, data) {
        const syncItem = { key, data, timestamp: Date.now() };
        this.pendingSync.add(syncItem);
        
        // Guardar en localStorage también
        const pendingArray = Array.from(this.pendingSync);
        localStorage.setItem('pwa-pending-sync', JSON.stringify(pendingArray));
    }

    async syncPendingData() {
        for (const item of this.pendingSync) {
            try {
                await this.sendToServer(item.key, item.data);
                this.pendingSync.delete(item);
            } catch (error) {
                console.warn('Error syncing:', error);
            }
        }
        
        // Actualizar localStorage
        const pendingArray = Array.from(this.pendingSync);
        localStorage.setItem('pwa-pending-sync', JSON.stringify(pendingArray));
    }

    async sendToServer(key, data) {
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, data })
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        return response.json();
    }

    // 🔧 UTILIDADES
    checkFeatureSupport() {
        this.features = {
            serviceWorker: 'serviceWorker' in navigator,
            notifications: 'Notification' in window,
            share: 'share' in navigator,
            fileHandling: 'showOpenFilePicker' in window,
            backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
            installPrompt: true // Se detecta en el evento
        };
    }

    handleURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Manejar parámetros específicos de PWA
        if (urlParams.has('pwa-action')) {
            const action = urlParams.get('pwa-action');
            this.handlePWAAction(action);
        }
    }

    handlePWAAction(action) {
        switch (action) {
            case 'new-tactic':
                // Crear nueva táctica
                this.createNewTactic();
                break;
            case 'share':
                // Abrir modal de compartir
                this.openShareModal();
                break;
            default:
                console.warn('PWA action not recognized:', action);
        }
    }

    createNewTactic() {
        // Implementar creación de nueva táctica
        console.log('🎯 Creating new tactic from PWA shortcut');
    }

    openShareModal() {
        // Implementar modal de compartir
        console.log('📤 Opening share modal from PWA shortcut');
    }

    handleServiceWorkerMessage(event) {
        const { type, payload } = event.data;
        
        switch (type) {
            case 'CACHE_UPDATED':
                console.log('Cache updated:', payload);
                break;
            case 'SYNC_COMPLETE':
                console.log('Background sync complete:', payload);
                break;
            default:
                console.log('SW message:', event.data);
        }
    }

    async updateApp() {
        if (this.registration && this.registration.waiting) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    async checkForUpdates() {
        if (this.registration) {
            await this.registration.update();
        }
    }

    async clearCache() {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
    }

    // 📊 ESTADO Y DEBUG
    getStatus() {
        return {
            isOnline: this.isOnline,
            features: this.features,
            notificationPermission: this.notificationPermission,
            pendingSyncCount: this.pendingSync.size,
            hasServiceWorker: !!this.registration,
            canInstall: !!this.deferredPrompt
        };
    }

    addEventListener(eventName, callback) {
        // Sistema simple de eventos
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        
        this.eventListeners[eventName].push(callback);
    }

    dispatchEvent(eventName, detail) {
        if (this.eventListeners && this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => {
                callback({ detail });
            });
        }
    }
}

// 🌐 Inicialización automática global
if (typeof window !== 'undefined') {
    window.PWAManager = PWAManager;
}

// 📤 Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}
