/**
 * 🔍 SCRIPT DE VERIFICACIÓN PWA AVANZADO
 * 
 * Este script verifica que todas las funcionalidades PWA
 * estén funcionando correctamente
 */

class PWAVerification {
    constructor() {
        this.results = {
            manifest: false,
            serviceWorker: false,
            pwaManager: false,
            pwaIntegration: false,
            cacheStrategy: false,
            notifications: false,
            shareAPI: false,
            fileHandling: false,
            offlineCapability: false,
            installability: false
        };
        
        this.init();
    }

    async init() {
        console.log('🔍 PWA Verification: Verificando funcionalidades...');
        console.log('================================================');
        
        await this.checkManifest();
        await this.checkServiceWorker();
        await this.checkPWAManager();
        await this.checkPWAIntegration();
        await this.checkCacheStrategy();
        await this.checkNotifications();
        await this.checkShareAPI();
        await this.checkFileHandling();
        await this.checkOfflineCapability();
        await this.checkInstallability();
        
        this.generateReport();
    }

    /**
     * 📋 Verificar Manifest
     */
    async checkManifest() {
        try {
            const response = await fetch('/manifest.json');
            if (response.ok) {
                const manifest = await response.json();
                
                // Verificar propiedades críticas
                const hasRequired = manifest.name && manifest.short_name && 
                                  manifest.start_url && manifest.display && 
                                  manifest.icons && manifest.icons.length > 0;
                
                // Verificar funcionalidades avanzadas
                const hasAdvanced = manifest.shortcuts && manifest.file_handlers && 
                                   manifest.share_target && manifest.protocol_handlers;
                
                if (hasRequired && hasAdvanced) {
                    this.results.manifest = true;
                    console.log('✅ Manifest: Completo con funcionalidades avanzadas');
                    console.log(`   - Nombre: ${manifest.name}`);
                    console.log(`   - Shortcuts: ${manifest.shortcuts.length}`);
                    console.log(`   - File handlers: ${manifest.file_handlers.length}`);
                    console.log(`   - Share target: ${manifest.share_target ? 'Sí' : 'No'}`);
                } else {
                    console.log('⚠️ Manifest: Básico, faltan funcionalidades avanzadas');
                }
            } else {
                console.log('❌ Manifest: No encontrado');
            }
        } catch (error) {
            console.log('❌ Manifest: Error al cargar -', error.message);
        }
    }

    /**
     * 🔧 Verificar Service Worker
     */
    async checkServiceWorker() {
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                
                if (registration) {
                    this.results.serviceWorker = true;
                    console.log('✅ Service Worker: Registrado y activo');
                    console.log(`   - Estado: ${registration.active ? 'Activo' : 'Inactivo'}`);
                    console.log(`   - Scope: ${registration.scope}`);
                    
                    // Verificar funcionalidades avanzadas
                    if (registration.sync) {
                        console.log('   - Background Sync: Soportado');
                    }
                    if (registration.pushManager) {
                        console.log('   - Push Notifications: Soportado');
                    }
                } else {
                    console.log('❌ Service Worker: No registrado');
                }
            } else {
                console.log('❌ Service Worker: No soportado');
            }
        } catch (error) {
            console.log('❌ Service Worker: Error -', error.message);
        }
    }

    /**
     * 🎮 Verificar PWA Manager
     */
    checkPWAManager() {
        try {
            if (typeof PWAManager !== 'undefined') {
                this.results.pwaManager = true;
                console.log('✅ PWA Manager: Disponible');
                
                // Verificar métodos principales
                const pwaManager = new PWAManager();
                const methods = [
                    'init', 'requestNotificationPermission', 'shareContent', 
                    'syncData', 'checkForUpdates', 'promptInstall'
                ];
                
                methods.forEach(method => {
                    if (typeof pwaManager[method] === 'function') {
                        console.log(`   - ${method}: ✅`);
                    } else {
                        console.log(`   - ${method}: ❌`);
                    }
                });
            } else {
                console.log('❌ PWA Manager: No disponible');
            }
        } catch (error) {
            console.log('❌ PWA Manager: Error -', error.message);
        }
    }

    /**
     * 🔗 Verificar PWA Integration
     */
    checkPWAIntegration() {
        try {
            if (typeof window.pwaIntegration !== 'undefined') {
                this.results.pwaIntegration = true;
                console.log('✅ PWA Integration: Disponible');
                
                const stats = window.pwaIntegration.getStats();
                console.log('   - Estadísticas:', stats);
                
                // Verificar elementos de UI
                const elements = [
                    '.connection-indicator',
                    '.pwa-install-button',
                    '.pwa-update-banner',
                    '.share-modal-overlay'
                ];
                
                elements.forEach(selector => {
                    const element = document.querySelector(selector);
                    console.log(`   - ${selector}: ${element ? '✅' : '❌'}`);
                });
            } else {
                console.log('❌ PWA Integration: No disponible');
            }
        } catch (error) {
            console.log('❌ PWA Integration: Error -', error.message);
        }
    }

    /**
     * 📦 Verificar Cache Strategy
     */
    async checkCacheStrategy() {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                
                if (cacheNames.length > 0) {
                    this.results.cacheStrategy = true;
                    console.log('✅ Cache Strategy: Implementado');
                    console.log(`   - Caches activos: ${cacheNames.length}`);
                    
                    for (const cacheName of cacheNames) {
                        const cache = await caches.open(cacheName);
                        const keys = await cache.keys();
                        console.log(`   - ${cacheName}: ${keys.length} recursos`);
                    }
                } else {
                    console.log('⚠️ Cache Strategy: Sin caches activos');
                }
            } else {
                console.log('❌ Cache Strategy: No soportado');
            }
        } catch (error) {
            console.log('❌ Cache Strategy: Error -', error.message);
        }
    }

    /**
     * 🔔 Verificar Notifications
     */
    checkNotifications() {
        try {
            if ('Notification' in window) {
                this.results.notifications = true;
                console.log('✅ Notifications: Soportado');
                console.log(`   - Permiso: ${Notification.permission}`);
                
                if ('serviceWorker' in navigator && 'PushManager' in window) {
                    console.log('   - Push Notifications: Soportado');
                } else {
                    console.log('   - Push Notifications: No soportado');
                }
            } else {
                console.log('❌ Notifications: No soportado');
            }
        } catch (error) {
            console.log('❌ Notifications: Error -', error.message);
        }
    }

    /**
     * 📤 Verificar Share API
     */
    checkShareAPI() {
        try {
            if (navigator.share) {
                this.results.shareAPI = true;
                console.log('✅ Share API: Soportado');
                
                // Verificar capacidades
                if (navigator.canShare) {
                    console.log('   - canShare: Disponible');
                } else {
                    console.log('   - canShare: No disponible');
                }
            } else {
                console.log('⚠️ Share API: No soportado (fallback disponible)');
            }
        } catch (error) {
            console.log('❌ Share API: Error -', error.message);
        }
    }

    /**
     * 📁 Verificar File Handling
     */
    checkFileHandling() {
        try {
            // Verificar File System Access API
            if ('showOpenFilePicker' in window) {
                console.log('✅ File System Access API: Soportado');
            } else {
                console.log('⚠️ File System Access API: No soportado');
            }
            
            // Verificar File handling en manifest
            fetch('/manifest.json')
                .then(response => response.json())
                .then(manifest => {
                    if (manifest.file_handlers && manifest.file_handlers.length > 0) {
                        this.results.fileHandling = true;
                        console.log('✅ File Handling: Configurado en manifest');
                        console.log(`   - Tipos soportados: ${manifest.file_handlers.map(h => h.accept).join(', ')}`);
                    } else {
                        console.log('❌ File Handling: No configurado');
                    }
                })
                .catch(() => {
                    console.log('❌ File Handling: Error al verificar manifest');
                });
                
        } catch (error) {
            console.log('❌ File Handling: Error -', error.message);
        }
    }

    /**
     * 🌐 Verificar Offline Capability
     */
    async checkOfflineCapability() {
        try {
            // Simular verificación offline
            const offlineStatus = !navigator.onLine;
            
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration && registration.active) {
                    this.results.offlineCapability = true;
                    console.log('✅ Offline Capability: Configurado');
                    console.log(`   - Estado actual: ${navigator.onLine ? 'Online' : 'Offline'}`);
                    console.log('   - Service Worker activo para cache offline');
                } else {
                    console.log('❌ Offline Capability: Service Worker inactivo');
                }
            } else {
                console.log('❌ Offline Capability: Service Worker no soportado');
            }
        } catch (error) {
            console.log('❌ Offline Capability: Error -', error.message);
        }
    }

    /**
     * 📱 Verificar Installability
     */
    checkInstallability() {
        try {
            // Verificar si es una PWA instalable
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            
            if (isStandalone) {
                console.log('✅ Installability: App ya instalada');
                this.results.installability = true;
            } else {
                // Verificar evento beforeinstallprompt
                window.addEventListener('beforeinstallprompt', (e) => {
                    this.results.installability = true;
                    console.log('✅ Installability: App instalable');
                });
                
                // Verificar criterios básicos
                const hasManifest = document.querySelector('link[rel="manifest"]');
                const hasServiceWorker = 'serviceWorker' in navigator;
                const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
                
                if (hasManifest && hasServiceWorker && isHTTPS) {
                    console.log('✅ Installability: Criterios básicos cumplidos');
                    this.results.installability = true;
                } else {
                    console.log('❌ Installability: Faltan criterios básicos');
                    console.log(`   - Manifest: ${hasManifest ? '✅' : '❌'}`);
                    console.log(`   - Service Worker: ${hasServiceWorker ? '✅' : '❌'}`);
                    console.log(`   - HTTPS: ${isHTTPS ? '✅' : '❌'}`);
                }
            }
        } catch (error) {
            console.log('❌ Installability: Error -', error.message);
        }
    }

    /**
     * 📊 Generar Reporte Final
     */
    generateReport() {
        console.log('================================================');
        console.log('📊 REPORTE FINAL PWA AVANZADO');
        console.log('================================================');
        
        const total = Object.keys(this.results).length;
        const passed = Object.values(this.results).filter(r => r).length;
        const percentage = Math.round((passed / total) * 100);
        
        console.log(`✅ Verificaciones pasadas: ${passed}/${total} (${percentage}%)`);
        console.log('');
        
        // Detalles por categoría
        Object.entries(this.results).forEach(([key, value]) => {
            const status = value ? '✅' : '❌';
            const name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            console.log(`${status} ${name}`);
        });
        
        console.log('');
        
        // Recomendaciones
        if (percentage === 100) {
            console.log('🎉 ¡EXCELENTE! PWA completamente funcional');
            console.log('💡 Recomendación: Realizar pruebas en diferentes dispositivos');
        } else if (percentage >= 80) {
            console.log('🟢 PWA funcional con mejoras menores necesarias');
            console.log('💡 Recomendación: Revisar elementos faltantes');
        } else if (percentage >= 60) {
            console.log('🟡 PWA básico, requiere mejoras importantes');
            console.log('💡 Recomendación: Implementar funcionalidades críticas');
        } else {
            console.log('🔴 PWA no funcional, requiere trabajo significativo');
            console.log('💡 Recomendación: Revisar implementación completa');
        }
        
        // Próximos pasos
        console.log('');
        console.log('📋 PRÓXIMOS PASOS:');
        
        if (!this.results.serviceWorker) {
            console.log('1. Registrar Service Worker correctamente');
        }
        if (!this.results.manifest) {
            console.log('2. Completar manifest.json con funcionalidades avanzadas');
        }
        if (!this.results.notifications) {
            console.log('3. Implementar sistema de notificaciones');
        }
        if (!this.results.offlineCapability) {
            console.log('4. Configurar funcionalidad offline');
        }
        
        console.log('================================================');
        
        // Retornar resultados para uso programático
        return {
            score: percentage,
            total,
            passed,
            results: this.results
        };
    }

    /**
     * 🧪 Test Específico de Funcionalidad
     */
    async testSpecificFeature(feature) {
        console.log(`🧪 Testeando funcionalidad específica: ${feature}`);
        
        switch (feature) {
            case 'offline':
                return this.testOfflineMode();
            case 'notifications':
                return this.testNotifications();
            case 'install':
                return this.testInstallation();
            case 'share':
                return this.testSharing();
            case 'cache':
                return this.testCaching();
            default:
                console.log('❌ Funcionalidad no reconocida');
                return false;
        }
    }

    async testOfflineMode() {
        console.log('🌐 Testeando modo offline...');
        
        try {
            // Simular estado offline
            console.log('📱 Para testear completamente, desconecta la red');
            
            const cacheNames = await caches.keys();
            if (cacheNames.length > 0) {
                console.log('✅ Cache disponible para modo offline');
                return true;
            } else {
                console.log('❌ No hay cache para modo offline');
                return false;
            }
        } catch (error) {
            console.log('❌ Error en test offline:', error);
            return false;
        }
    }

    async testNotifications() {
        console.log('🔔 Testeando notificaciones...');
        
        try {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification('Test PWA', {
                        body: 'Notificación de prueba funcionando',
                        icon: '/img/icon-192.png'
                    });
                    console.log('✅ Notificación de prueba enviada');
                    return true;
                } else {
                    console.log('❌ Permisos de notificación denegados');
                    return false;
                }
            } else {
                console.log('❌ Notificaciones no soportadas');
                return false;
            }
        } catch (error) {
            console.log('❌ Error en test notifications:', error);
            return false;
        }
    }

    testInstallation() {
        console.log('📱 Testeando instalación...');
        
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) {
            console.log('✅ App ya está instalada');
            return true;
        } else {
            console.log('ℹ️ Para testear instalación, usa el botón "Instalar App"');
            return false;
        }
    }

    async testSharing() {
        console.log('📤 Testeando compartir...');
        
        try {
            if (navigator.share) {
                console.log('✅ Web Share API disponible');
                console.log('ℹ️ Para testear, usa el botón de compartir en la app');
                return true;
            } else {
                console.log('⚠️ Web Share API no disponible, usando fallback');
                return false;
            }
        } catch (error) {
            console.log('❌ Error en test sharing:', error);
            return false;
        }
    }

    async testCaching() {
        console.log('📦 Testeando sistema de cache...');
        
        try {
            const cacheNames = await caches.keys();
            console.log(`📊 Caches activos: ${cacheNames.length}`);
            
            let totalResources = 0;
            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                totalResources += keys.length;
                console.log(`   - ${cacheName}: ${keys.length} recursos`);
            }
            
            console.log(`✅ Total recursos cacheados: ${totalResources}`);
            return totalResources > 0;
        } catch (error) {
            console.log('❌ Error en test caching:', error);
            return false;
        }
    }
}

// 🚀 Auto-ejecutar verificación cuando se carga
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaVerification = new PWAVerification();
    });
} else {
    window.pwaVerification = new PWAVerification();
}

// 📤 Exportar para uso manual
window.PWAVerification = PWAVerification;

// 🎯 Funciones de conveniencia para testing manual
window.testPWA = {
    full: () => new PWAVerification(),
    offline: () => window.pwaVerification?.testSpecificFeature('offline'),
    notifications: () => window.pwaVerification?.testSpecificFeature('notifications'),
    install: () => window.pwaVerification?.testSpecificFeature('install'),
    share: () => window.pwaVerification?.testSpecificFeature('share'),
    cache: () => window.pwaVerification?.testSpecificFeature('cache')
};

console.log('🔧 PWA Verification disponible:');
console.log('  - testPWA.full() - Verificación completa');
console.log('  - testPWA.offline() - Test modo offline');
console.log('  - testPWA.notifications() - Test notificaciones');
console.log('  - testPWA.install() - Test instalación');
console.log('  - testPWA.share() - Test compartir');
console.log('  - testPWA.cache() - Test sistema cache');
