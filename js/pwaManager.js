/**
 * ==========================================
 * 📱 PWA MANAGER - PROGRESSIVE WEB APP
 * ==========================================
 * Gestiona funcionalidades de PWA: instalación, service worker, notificaciones
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isStandalone = false;
        this.serviceWorkerRegistration = null;
        
        this.init();
    }
    
    async init() {
        console.log('📱 PWAManager iniciado');
        
        this.checkInstallation();
        this.setupInstallPrompt();
        this.registerServiceWorker();
        this.setupUpdateListener();
        this.createInstallButton();
    }
    
    /**
     * Verifica si la app está instalada
     */
    checkInstallation() {
        // Verificar si está en modo standalone
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone ||
                           document.referrer.includes('android-app://');
        
        // Verificar si está instalada
        this.isInstalled = this.isStandalone || 
                          localStorage.getItem('pwa-installed') === 'true';
        
        console.log(`📱 PWA instalada: ${this.isInstalled}, Standalone: ${this.isStandalone}`);
    }
    
    /**
     * Configura el prompt de instalación
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 Prompt de instalación disponible');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('📱 PWA instalada exitosamente');
            this.isInstalled = true;
            localStorage.setItem('pwa-installed', 'true');
            this.hideInstallButton();
            this.showInstallSuccess();
        });
    }
    
    /**
     * Registra el service worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('📱 Service Worker registrado:', this.serviceWorkerRegistration);
                
                // Verificar actualizaciones
                this.serviceWorkerRegistration.addEventListener('updatefound', () => {
                    console.log('📱 Actualización del Service Worker encontrada');
                });
                
            } catch (error) {
                console.error('📱 Error registrando Service Worker:', error);
            }
        }
    }
    
    /**
     * Configura listener para actualizaciones
     */
    setupUpdateListener() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('📱 Service Worker actualizado');
                this.showUpdateNotification();
            });
        }
    }
    
    /**
     * Crea el botón de instalación
     */
    createInstallButton() {
        if (this.isInstalled) return;
        
        const installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.className = 'btn btn-primary btn-sm position-fixed';
        installBtn.style.cssText = `
            top: 70px;
            right: 20px;
            z-index: 1050;
            display: none;
        `;
        installBtn.innerHTML = `
            <i class="fas fa-download me-1"></i>
            Instalar App
        `;
        
        installBtn.addEventListener('click', () => this.promptInstall());
        
        document.body.appendChild(installBtn);
    }
    
    /**
     * Muestra el botón de instalación
     */
    showInstallButton() {
        const btn = document.getElementById('pwa-install-btn');
        if (btn && !this.isInstalled) {
            btn.style.display = 'block';
        }
    }
    
    /**
     * Oculta el botón de instalación
     */
    hideInstallButton() {
        const btn = document.getElementById('pwa-install-btn');
        if (btn) {
            btn.style.display = 'none';
        }
    }
    
    /**
     * Ejecuta el prompt de instalación
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('📱 Prompt de instalación no disponible');
            return;
        }
        
        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`📱 Usuario eligió: ${outcome}`);
            
            if (outcome === 'accepted') {
                this.hideInstallButton();
            }
            
            this.deferredPrompt = null;
        } catch (error) {
            console.error('📱 Error en prompt de instalación:', error);
        }
    }
    
    /**
     * Muestra notificación de instalación exitosa
     */
    showInstallSuccess() {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0';
        toast.setAttribute('role', 'alert');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-check-circle me-2"></i>
                    ¡App instalada correctamente!
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remover después de 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
    
    /**
     * Muestra notificación de actualización
     */
    showUpdateNotification() {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-info border-0';
        toast.setAttribute('role', 'alert');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-sync-alt me-2"></i>
                    App actualizada. Recarga para ver cambios.
                </div>
                <button type="button" class="btn btn-light btn-sm me-2" onclick="window.location.reload()">
                    Recargar
                </button>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
    }
    
    /**
     * Obtiene información del estado de la PWA
     * @returns {Object} Estado actual de la PWA
     */
    getStatus() {
        return {
            isInstalled: this.isInstalled,
            isStandalone: this.isStandalone,
            canInstall: !!this.deferredPrompt,
            serviceWorkerRegistered: !!this.serviceWorkerRegistration,
            hasServiceWorker: 'serviceWorker' in navigator
        };
    }
    
    /**
     * Fuerza la verificación de actualizaciones
     */
    async checkForUpdates() {
        if (this.serviceWorkerRegistration) {
            try {
                await this.serviceWorkerRegistration.update();
                console.log('📱 Verificación de actualizaciones completada');
            } catch (error) {
                console.error('📱 Error verificando actualizaciones:', error);
            }
        }
    }
    
    /**
     * Debug: Muestra información del PWA Manager
     */
    debug() {
        console.group('📱 PWAManager Debug');
        console.log('📊 Estado:', this.getStatus());
        console.log('🔧 Service Worker:', this.serviceWorkerRegistration);
        console.groupEnd();
    }
}

// Instancia global
window.pwaManager = new PWAManager();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}
