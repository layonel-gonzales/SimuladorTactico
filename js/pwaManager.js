// PWA Registration Script
// Este script registra el Service Worker y maneja la instalación de la PWA

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    async init() {
        console.log('[PWA] Inicializando PWA Manager...');
        
        // Registrar Service Worker
        await this.registerServiceWorker();
        
        // Configurar eventos PWA
        this.setupPWAEvents();
        
        // Verificar si ya está instalado
        this.checkInstallStatus();
        
        console.log('[PWA] PWA Manager inicializado correctamente');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                console.log('[PWA] Registrando Service Worker...');
                
                const registration = await navigator.serviceWorker.register('./sw.js', {
                    scope: './'
                });
                
                console.log('[PWA] Service Worker registrado:', registration.scope);
                
                // Manejar actualizaciones del SW
                registration.addEventListener('updatefound', () => {
                    console.log('[PWA] Nueva versión del Service Worker disponible');
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Nueva versión disponible
                            this.showUpdateAvailable();
                        }
                    });
                });
                
                return registration;
            } catch (error) {
                console.error('[PWA] Error registrando Service Worker:', error);
            }
        } else {
            console.warn('[PWA] Service Workers no soportados en este navegador');
        }
    }

    setupPWAEvents() {
        // Capturar evento de instalación
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] Evento beforeinstallprompt capturado');
            
            // Prevenir mostrar automáticamente
            e.preventDefault();
            
            // Guardar el evento para usarlo después
            this.deferredPrompt = e;
            
            // Mostrar botón de instalación personalizado
            this.showInstallButton();
        });

        // Detectar cuando se instala
        window.addEventListener('appinstalled', (e) => {
            console.log('[PWA] App instalada exitosamente');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstalledMessage();
        });

        // Detectar cuando se ejecuta como PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('[PWA] Ejecutándose como PWA instalada');
            this.isInstalled = true;
        }
    }

    checkInstallStatus() {
        // Verificar si está ejecutándose como PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isIOSStandalone = isIOS && (window.navigator.standalone === true);
        
        if (isStandalone || isIOSStandalone) {
            this.isInstalled = true;
            console.log('[PWA] App ya está instalada');
        }
    }

    showInstallButton() {
        // Crear botón de instalación si no existe
        let installBtn = document.getElementById('pwa-install-btn');
        
        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar App';
            installBtn.className = 'btn btn-primary position-fixed';
            installBtn.style.cssText = `
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                border-radius: 25px;
                padding: 10px 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                background: linear-gradient(45deg, #3caa3c, #2d8a2d);
                border: none;
            `;
            
            installBtn.addEventListener('click', () => this.installPWA());
            document.body.appendChild(installBtn);
        }
        
        installBtn.style.display = 'block';
        
        // Auto-hide después de 10 segundos
        setTimeout(() => {
            if (installBtn && !this.isInstalled) {
                installBtn.style.opacity = '0.7';
            }
        }, 10000);
    }

    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('[PWA] No se puede instalar en este momento');
            return;
        }

        console.log('[PWA] Iniciando instalación...');
        
        // Mostrar prompt de instalación
        this.deferredPrompt.prompt();
        
        // Esperar respuesta del usuario
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log('[PWA] Resultado de instalación:', outcome);
        
        if (outcome === 'accepted') {
            console.log('[PWA] Usuario aceptó la instalación');
        } else {
            console.log('[PWA] Usuario rechazó la instalación');
        }
        
        // Limpiar el prompt
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    showUpdateAvailable() {
        // Crear notificación de actualización
        const updateNotification = document.createElement('div');
        updateNotification.id = 'pwa-update-notification';
        updateNotification.innerHTML = `
            <div class="alert alert-info alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 1001; max-width: 300px;">
                <i class="fas fa-sync-alt"></i> <strong>Actualización disponible</strong>
                <br>
                <small>Nueva versión de la app disponible</small>
                <br>
                <button class="btn btn-sm btn-primary mt-2" onclick="pwaManager.reloadApp()">Actualizar</button>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(updateNotification);
        
        // Auto-remove después de 30 segundos
        setTimeout(() => {
            if (updateNotification.parentNode) {
                updateNotification.remove();
            }
        }, 30000);
    }

    showInstalledMessage() {
        // Mostrar mensaje de éxito
        const successMessage = document.createElement('div');
        successMessage.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 1001; max-width: 300px;">
                <i class="fas fa-check-circle"></i> <strong>¡App instalada!</strong>
                <br>
                <small>Ya puedes usar FIFA Soccer Tactics como app nativa</small>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        document.body.appendChild(successMessage);
        
        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.remove();
            }
        }, 5000);
    }

    reloadApp() {
        // Enviar mensaje al service worker para que se active
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // Recargar la página
        window.location.reload();
    }

    // Método público para obtener estado
    getInstallStatus() {
        return {
            isInstalled: this.isInstalled,
            canInstall: !!this.deferredPrompt,
            isStandalone: window.matchMedia('(display-mode: standalone)').matches
        };
    }
}

// Inicializar PWA Manager cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar soporte PWA
    if ('serviceWorker' in navigator && 'manifest' in document.head) {
        window.pwaManager = new PWAManager();
    } else {
        console.warn('[PWA] PWA no soportada en este navegador');
    }
});

// Detectar conexión offline/online
window.addEventListener('online', () => {
    console.log('[PWA] Conexión restaurada');
    // Aquí podrías sincronizar datos pendientes
});

window.addEventListener('offline', () => {
    console.log('[PWA] Sin conexión - funcionando offline');
    // Mostrar indicador offline si deseas
});

console.log('[PWA] PWA Registration Script cargado');
