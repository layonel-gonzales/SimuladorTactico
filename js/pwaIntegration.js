/**
 * 🔗 INTEGRACIÓN PWA CON SISTEMA EXISTENTE
 * 
 * Este archivo conecta las funcionalidades PWA avanzadas
 * con la interfaz y sistemas existentes del simulador
 */

class PWAIntegration {
    constructor() {
        this.pwaManager = null;
        this.isInitialized = false;
        this.notifications = [];
        this.offlineActions = [];
        
        // Referencias a elementos DOM
        this.elements = {
            installButton: null,
            connectionIndicator: null,
            updateBanner: null,
            shareModal: null,
            permissionPrompt: null,
            toastContainer: null,
            syncIndicator: null
        };
        
        this.init();
    }

    /**
     * 🚀 Inicialización del sistema de integración PWA
     */
    async init() {
        try {
            
            // Crear elementos de interfaz PWA
            await this.createPWAElements();
            
            // Inicializar PWA Manager
            if (typeof PWAManager !== 'undefined') {
                this.pwaManager = new PWAManager();
                await this.pwaManager.init();
                this.setupPWAEventListeners();
            }
            
            // Integrar con sistemas existentes
            this.integrateWithExistingSystems();
            
            // Configurar eventos de conectividad
            this.setupConnectivityHandlers();
            
            // Configurar manejo de archivos
            this.setupFileHandling();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Error en integración PWA:', error);
        }
    }

    /**
     * 🎨 Crear elementos de interfaz PWA
     */
    async createPWAElements() {
        // Botón de instalación
        this.elements.installButton = this.createElement('button', {
            class: 'pwa-install-button',
            innerHTML: '<span class="install-icon">📱</span> Instalar App'
        });

        // Indicador de conexión
        this.elements.connectionIndicator = this.createElement('div', {
            class: 'connection-indicator',
            innerHTML: '<div class="indicator-dot"></div><span>Conectado</span>'
        });

        // Banner de actualización
        this.elements.updateBanner = this.createElement('div', {
            class: 'pwa-update-banner pwa-hidden',
            innerHTML: `
                <div class="update-content">
                    <div class="update-icon">🔄</div>
                    <div class="update-text">
                        <strong>Nueva versión disponible</strong>
                        <p>Actualiza para obtener las últimas mejoras</p>
                    </div>
                    <button class="update-btn">Actualizar</button>
                    <button class="dismiss-btn">✕</button>
                </div>
            `
        });

        // Modal de compartir
        this.elements.shareModal = this.createElement('div', {
            class: 'share-modal-overlay pwa-hidden',
            innerHTML: `
                <div class="share-modal">
                    <div class="share-content">
                        <h3>Compartir Táctica</h3>
                        <div class="share-options">
                            <div class="share-option" data-action="copy">
                                <span class="share-icon">📋</span>
                                Copiar enlace
                            </div>
                            <div class="share-option" data-action="whatsapp">
                                <span class="share-icon">💬</span>
                                WhatsApp
                            </div>
                            <div class="share-option" data-action="email">
                                <span class="share-icon">📧</span>
                                Email
                            </div>
                            <div class="share-option" data-action="twitter">
                                <span class="share-icon">🐦</span>
                                Twitter
                            </div>
                        </div>
                    </div>
                    <button class="close-modal">Cerrar</button>
                </div>
            `
        });

        // Prompt de permisos de notificación
        this.elements.permissionPrompt = this.createElement('div', {
            class: 'notification-permission-prompt pwa-hidden',
            innerHTML: `
                <div class="permission-content">
                    <div class="permission-icon">🔔</div>
                    <h3>Recibir Notificaciones</h3>
                    <p>Mantente al día con actualizaciones importantes del simulador táctico</p>
                    <div class="permission-buttons">
                        <button class="permission-allow">Permitir</button>
                        <button class="permission-deny">No, gracias</button>
                    </div>
                </div>
            `
        });

        // Indicador de sincronización
        this.elements.syncIndicator = this.createElement('div', {
            class: 'sync-indicator pwa-hidden',
            innerHTML: '<div class="sync-spinner"></div><span>Sincronizando...</span>'
        });

        // Contenedor de toast
        this.elements.toastContainer = this.createElement('div', {
            class: 'toast-container'
        });

        // Agregar elementos al DOM
        document.body.appendChild(this.elements.installButton);
        document.body.appendChild(this.elements.connectionIndicator);
        document.body.appendChild(this.elements.updateBanner);
        document.body.appendChild(this.elements.shareModal);
        document.body.appendChild(this.elements.permissionPrompt);
        document.body.appendChild(this.elements.syncIndicator);
        document.body.appendChild(this.elements.toastContainer);
    }

    /**
     * 🔧 Configurar event listeners del PWA Manager
     */
    setupPWAEventListeners() {
        if (!this.pwaManager) return;

        // Evento de instalación disponible
        this.pwaManager.addEventListener('installAvailable', () => {
            this.elements.installButton.style.display = 'flex';
        });

        // Evento de actualización disponible
        this.pwaManager.addEventListener('updateAvailable', () => {
            this.showUpdateBanner();
        });

        // Evento de cambio de conectividad
        this.pwaManager.addEventListener('connectivityChange', (event) => {
            this.updateConnectionIndicator(event.detail.isOnline);
        });

        // Evento de sincronización
        this.pwaManager.addEventListener('syncStart', () => {
            this.showSyncIndicator();
        });

        this.pwaManager.addEventListener('syncComplete', () => {
            this.hideSyncIndicator();
        });

        // Configurar botón de instalación
        this.elements.installButton.addEventListener('click', () => {
            this.pwaManager.promptInstall();
        });

        // Configurar banner de actualización
        this.elements.updateBanner.querySelector('.update-btn').addEventListener('click', () => {
            this.pwaManager.updateApp();
            this.hideUpdateBanner();
        });

        this.elements.updateBanner.querySelector('.dismiss-btn').addEventListener('click', () => {
            this.hideUpdateBanner();
        });

        // Configurar modal de compartir
        this.setupShareModal();

        // Configurar prompt de permisos
        this.setupPermissionPrompt();
    }

    /**
     * 🔗 Integrar con sistemas existentes
     */
    integrateWithExistingSystems() {
        // Integración con el sistema de configuración
        if (typeof configurationManager !== 'undefined') {
            this.integrateWithConfigurationManager();
        }

        // Integración con el sistema de usuarios
        if (typeof authSystem !== 'undefined') {
            this.integrateWithAuthSystem();
        }

        // Integración con el compartir existente
        if (typeof shareManager !== 'undefined') {
            this.integrateWithShareManager();
        }

        // Integración con el sistema de audio
        if (typeof audioManager !== 'undefined') {
            this.integrateWithAudioManager();
        }

        // Agregar PWA al menú de configuración
        this.addPWAToConfigMenu();
    }

    /**
     * ⚙️ Integración con Configuration Manager
     */
    integrateWithConfigurationManager() {
        // Guardar configuraciones PWA en localStorage
        const originalSaveConfiguration = configurationManager.saveConfiguration;
        configurationManager.saveConfiguration = (...args) => {
            const result = originalSaveConfiguration.apply(configurationManager, args);
            
            // Sincronizar configuración PWA
            if (this.pwaManager && navigator.onLine) {
                this.pwaManager.syncData('configuration', configurationManager.getConfiguration());
            } else {
                this.addOfflineAction('saveConfiguration', args);
            }
            
            return result;
        };
    }

    /**
     * 👤 Integración con Auth System
     */
    integrateWithAuthSystem() {
        // Notificar cambios de autenticación
        const originalLogin = authSystem.login;
        authSystem.login = (...args) => {
            const result = originalLogin.apply(authSystem, args);
            
            if (result && this.pwaManager) {
                this.pwaManager.sendNotification('¡Bienvenido!', {
                    body: 'Has iniciado sesión correctamente',
                    icon: '/img/icon-192.png'
                });
            }
            
            return result;
        };
    }

    /**
     * 📤 Integración con Share Manager
     */
    integrateWithShareManager() {
        // Extender shareManager con funcionalidades PWA
        const originalShare = shareManager.share;
        shareManager.share = (data) => {
            if (this.pwaManager && this.pwaManager.canUseNativeShare()) {
                return this.pwaManager.shareContent(data);
            } else {
                this.showShareModal(data);
                return Promise.resolve();
            }
        };
    }

    /**
     * 🔊 Integración con Audio Manager
     */
    integrateWithAudioManager() {
        // Sincronizar configuración de audio
        const originalSetVolume = audioManager.setVolume;
        audioManager.setVolume = (...args) => {
            const result = originalSetVolume.apply(audioManager, args);
            
            if (this.pwaManager) {
                this.pwaManager.syncData('audioSettings', {
                    volume: args[0],
                    timestamp: Date.now()
                });
            }
            
            return result;
        };
    }

    /**
     * 📱 Agregar PWA al menú de configuración
     */
    addPWAToConfigMenu() {
        // Buscar el contenedor de configuración
        const configContainer = document.querySelector('.configuracion-container') || 
                               document.querySelector('#configuracion') ||
                               document.querySelector('.config-menu');

        if (configContainer) {
            const pwaSection = this.createElement('div', {
                class: 'config-section pwa-config',
                innerHTML: `
                    <h3>📱 Progressive Web App</h3>
                    <div class="pwa-options">
                        <label class="config-option">
                            <input type="checkbox" id="pwa-notifications" />
                            <span>Notificaciones push</span>
                        </label>
                        <label class="config-option">
                            <input type="checkbox" id="pwa-background-sync" />
                            <span>Sincronización en segundo plano</span>
                        </label>
                        <label class="config-option">
                            <input type="checkbox" id="pwa-offline-mode" />
                            <span>Modo sin conexión</span>
                        </label>
                        <button class="config-btn" id="pwa-clear-cache">Limpiar caché</button>
                        <button class="config-btn" id="pwa-force-update">Buscar actualización</button>
                    </div>
                `
            });

            configContainer.appendChild(pwaSection);
            this.setupPWAConfigHandlers();
        }
    }

    /**
     * ⚙️ Configurar handlers de opciones PWA
     */
    setupPWAConfigHandlers() {
        const notificationToggle = document.getElementById('pwa-notifications');
        const backgroundSyncToggle = document.getElementById('pwa-background-sync');
        const offlineModeToggle = document.getElementById('pwa-offline-mode');
        const clearCacheBtn = document.getElementById('pwa-clear-cache');
        const forceUpdateBtn = document.getElementById('pwa-force-update');

        if (notificationToggle) {
            notificationToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.requestNotificationPermission();
                } else {
                    this.disableNotifications();
                }
            });
        }

        if (backgroundSyncToggle) {
            backgroundSyncToggle.addEventListener('change', (e) => {
                localStorage.setItem('pwa-background-sync', e.target.checked);
            });
        }

        if (offlineModeToggle) {
            offlineModeToggle.addEventListener('change', (e) => {
                localStorage.setItem('pwa-offline-mode', e.target.checked);
                if (e.target.checked) {
                    document.body.classList.add('offline-mode');
                } else {
                    document.body.classList.remove('offline-mode');
                }
            });
        }

        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }

        if (forceUpdateBtn) {
            forceUpdateBtn.addEventListener('click', () => {
                this.forceUpdate();
            });
        }
    }

    /**
     * 🌐 Configurar handlers de conectividad
     */
    setupConnectivityHandlers() {
        window.addEventListener('online', () => {
            this.updateConnectionIndicator(true);
            this.syncOfflineActions();
            this.showToast('Conexión restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.updateConnectionIndicator(false);
            this.showToast('Sin conexión - Trabajando offline', 'warning');
        });

        // Verificar estado inicial
        this.updateConnectionIndicator(navigator.onLine);
    }

    /**
     * 📁 Configurar manejo de archivos
     */
    setupFileHandling() {
        // Manejar archivos arrastrados
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            
            files.forEach(file => {
                if (file.name.endsWith('.tactic')) {
                    this.handleTacticFile(file);
                }
            });
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
    }

    /**
     * 📋 Configurar modal de compartir
     */
    setupShareModal() {
        const shareOptions = this.elements.shareModal.querySelectorAll('.share-option');
        const closeBtn = this.elements.shareModal.querySelector('.close-modal');

        shareOptions.forEach(option => {
            option.addEventListener('click', () => {
                const action = option.dataset.action;
                this.handleShareAction(action);
                this.hideShareModal();
            });
        });

        closeBtn.addEventListener('click', () => {
            this.hideShareModal();
        });

        this.elements.shareModal.addEventListener('click', (e) => {
            if (e.target === this.elements.shareModal) {
                this.hideShareModal();
            }
        });
    }

    /**
     * 🔔 Configurar prompt de permisos
     */
    setupPermissionPrompt() {
        const allowBtn = this.elements.permissionPrompt.querySelector('.permission-allow');
        const denyBtn = this.elements.permissionPrompt.querySelector('.permission-deny');

        allowBtn.addEventListener('click', () => {
            this.requestNotificationPermission();
            this.hidePermissionPrompt();
        });

        denyBtn.addEventListener('click', () => {
            localStorage.setItem('notification-permission-denied', 'true');
            this.hidePermissionPrompt();
        });
    }

    /**
     * 🔄 Actualizar indicador de conexión
     */
    updateConnectionIndicator(isOnline) {
        const indicator = this.elements.connectionIndicator;
        const text = indicator.querySelector('span');
        
        indicator.className = `connection-indicator ${isOnline ? 'online' : 'offline'}`;
        text.textContent = isOnline ? 'Conectado' : 'Sin conexión';
        
        // Auto-ocultar después de unos segundos si está online
        if (isOnline) {
            setTimeout(() => {
                indicator.style.opacity = '0';
            }, 3000);
        }
    }

    /**
     * 📤 Mostrar modal de compartir
     */
    showShareModal(data) {
        this.currentShareData = data;
        this.elements.shareModal.classList.remove('pwa-hidden');
    }

    /**
     * 📤 Ocultar modal de compartir
     */
    hideShareModal() {
        this.elements.shareModal.classList.add('pwa-hidden');
        this.currentShareData = null;
    }

    /**
     * 🔔 Mostrar banner de actualización
     */
    showUpdateBanner() {
        this.elements.updateBanner.classList.remove('pwa-hidden');
    }

    /**
     * 🔔 Ocultar banner de actualización
     */
    hideUpdateBanner() {
        this.elements.updateBanner.classList.add('pwa-hidden');
    }

    /**
     * 🔔 Mostrar prompt de permisos
     */
    showPermissionPrompt() {
        this.elements.permissionPrompt.classList.remove('pwa-hidden');
    }

    /**
     * 🔔 Ocultar prompt de permisos
     */
    hidePermissionPrompt() {
        this.elements.permissionPrompt.classList.add('pwa-hidden');
    }

    /**
     * 🔄 Mostrar indicador de sincronización
     */
    showSyncIndicator() {
        this.elements.syncIndicator.classList.remove('pwa-hidden');
    }

    /**
     * 🔄 Ocultar indicador de sincronización
     */
    hideSyncIndicator() {
        this.elements.syncIndicator.classList.add('pwa-hidden');
    }

    /**
     * 🍞 Mostrar notificación toast
     */
    showToast(message, type = 'info') {
        const toast = this.createElement('div', {
            class: `pwa-toast ${type}`,
            textContent: message
        });

        this.elements.toastContainer.appendChild(toast);

        // Mostrar toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Ocultar y remover toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 📤 Manejar acciones de compartir
     */
    handleShareAction(action) {
        if (!this.currentShareData) return;

        const data = this.currentShareData;
        const url = window.location.href;
        const text = `Check out this tactic: ${data.title || 'Tactical Formation'}`;

        switch (action) {
            case 'copy':
                navigator.clipboard.writeText(url).then(() => {
                    this.showToast('Enlace copiado al portapapeles');
                });
                break;
            
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
                break;
            
            case 'email':
                window.open(`mailto:?subject=${encodeURIComponent(data.title || 'Táctica')}&body=${encodeURIComponent(text + ' ' + url)}`);
                break;
            
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
                break;
        }
    }

    /**
     * 🔔 Solicitar permisos de notificación
     */
    async requestNotificationPermission() {
        if (this.pwaManager) {
            const granted = await this.pwaManager.requestNotificationPermission();
            if (granted) {
                this.showToast('Notificaciones activadas');
                document.getElementById('pwa-notifications').checked = true;
            } else {
                this.showToast('Permisos de notificación denegados', 'error');
            }
        }
    }

    /**
     * 🔇 Desactivar notificaciones
     */
    disableNotifications() {
        if (this.pwaManager) {
            this.pwaManager.unsubscribeFromNotifications();
            this.showToast('Notificaciones desactivadas');
        }
    }

    /**
     * 🗑️ Limpiar caché
     */
    async clearCache() {
        if (this.pwaManager) {
            await this.pwaManager.clearCache();
            this.showToast('Caché limpiado');
        }
    }

    /**
     * 🔄 Forzar actualización
     */
    async forceUpdate() {
        if (this.pwaManager) {
            await this.pwaManager.checkForUpdates();
            this.showToast('Verificando actualizaciones...');
        }
    }

    /**
     * 📁 Manejar archivo de táctica
     */
    handleTacticFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const tacticData = JSON.parse(e.target.result);
                this.loadTactic(tacticData);
                this.showToast(`Táctica "${file.name}" cargada`);
            } catch (error) {
                this.showToast('Error al cargar el archivo de táctica', 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * 📊 Cargar táctica
     */
    loadTactic(tacticData) {
        // Integrar con el sistema de gestión de tácticas existente
        if (typeof playerManager !== 'undefined') {
            playerManager.loadFormation(tacticData);
        }
    }

    /**
     * 💾 Agregar acción offline
     */
    addOfflineAction(action, data) {
        this.offlineActions.push({
            action,
            data,
            timestamp: Date.now()
        });
        localStorage.setItem('pwa-offline-actions', JSON.stringify(this.offlineActions));
    }

    /**
     * 🔄 Sincronizar acciones offline
     */
    async syncOfflineActions() {
        const storedActions = localStorage.getItem('pwa-offline-actions');
        if (storedActions) {
            this.offlineActions = JSON.parse(storedActions);
            
            if (this.offlineActions.length > 0) {
                this.showSyncIndicator();
                
                for (const action of this.offlineActions) {
                    try {
                        await this.executeOfflineAction(action);
                    } catch (error) {
                        console.error('Error sincronizando acción offline:', error);
                    }
                }
                
                this.offlineActions = [];
                localStorage.removeItem('pwa-offline-actions');
                this.hideSyncIndicator();
                this.showToast('Datos sincronizados');
            }
        }
    }

    /**
     * ⚡ Ejecutar acción offline
     */
    async executeOfflineAction(action) {
        switch (action.action) {
            case 'saveConfiguration':
                if (this.pwaManager) {
                    await this.pwaManager.syncData('configuration', action.data);
                }
                break;
            // Agregar más acciones según sea necesario
        }
    }

    /**
     * 🔧 Utilidad para crear elementos DOM
     */
    createElement(tag, attributes = {}) {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        return element;
    }

    /**
     * 📊 Obtener estadísticas PWA
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            isOnline: navigator.onLine,
            hasServiceWorker: 'serviceWorker' in navigator,
            isInstalled: window.matchMedia('(display-mode: standalone)').matches,
            offlineActionsCount: this.offlineActions.length,
            notificationsEnabled: Notification.permission === 'granted'
        };
    }
}

// 🚀 Auto-inicialización cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaIntegration = new PWAIntegration();
    });
} else {
    window.pwaIntegration = new PWAIntegration();
}

// 📤 Exportar para uso global
window.PWAIntegration = PWAIntegration;
