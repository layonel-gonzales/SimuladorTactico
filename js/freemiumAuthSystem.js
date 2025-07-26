/**
 * 🔐 SISTEMA DE AUTENTICACIÓN FREEMIUM
 * 
 * Sistema completo de autenticación que se conecta al backend
 * para gestionar usuarios, suscripciones y límites de dispositivos.
 * 
 * Características:
 * - Registro e inicio de sesión
 * - Gestión de suscripciones premium
 * - Control de límites de dispositivos
 * - Integración con Stripe
 * 
 * @author GitHub Copilot
 * @version 2.0.0
 */

class FreemiumAuthSystem {
    constructor() {
        this.apiBaseUrl = this.getApiBaseUrl();
        this.token = localStorage.getItem('auth_token');
        this.user = null;
        this.deviceManager = null;
        this.isAuthenticated = false;
        
        this.init();
    }

    getApiBaseUrl() {
        // Determinar URL base según el entorno
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        } else {
            // En producción, usar tu dominio
            return 'https://tu-servidor.com/api';
        }
    }

    async init() {
        console.log('[FreemiumAuth] Inicializando sistema de autenticación...');
        
        // Importar deviceManager dinámicamente
        try {
            const { DeviceManager } = await import('./deviceManagerPremium.js');
            this.deviceManager = new DeviceManager();
        } catch (error) {
            console.error('[FreemiumAuth] Error cargando DeviceManager:', error);
            // Fallback al deviceManager básico
            this.deviceManager = window.deviceManager || { getDeviceId: () => 'fallback-device' };
        }

        // Verificar token existente
        if (this.token) {
            await this.verifyToken();
        }

        this.setupUI();
    }

    /**
     * Realiza una petición autenticada al API
     */
    async apiRequest(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        if (options.body && typeof options.body !== 'string') {
            config.body = JSON.stringify(options.body);
        }

        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, config);
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Error de conexión' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    /**
     * Verifica si el token actual es válido
     */
    async verifyToken() {
        try {
            const result = await this.apiRequest('/user/status');
            this.user = result.user;
            this.isAuthenticated = true;
            
            console.log('[FreemiumAuth] Token válido, usuario autenticado:', this.user);
            return true;
        } catch (error) {
            console.log('[FreemiumAuth] Token inválido, limpiando sesión');
            this.clearAuth();
            return false;
        }
    }

    /**
     * Registra un nuevo usuario
     */
    async register(email, password) {
        try {
            const deviceId = this.deviceManager.getDeviceId();
            const deviceInfo = this.deviceManager.getDeviceInfo();

            const result = await this.apiRequest('/auth/register', {
                method: 'POST',
                body: {
                    email,
                    password,
                    deviceId,
                    deviceInfo
                }
            });

            this.token = result.token;
            this.user = result.user;
            this.isAuthenticated = true;

            localStorage.setItem('auth_token', this.token);
            
            console.log('[FreemiumAuth] Usuario registrado exitosamente:', this.user);
            return { success: true, user: this.user };

        } catch (error) {
            console.error('[FreemiumAuth] Error en registro:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Inicia sesión de usuario
     */
    async login(email, password) {
        try {
            const deviceId = this.deviceManager.getDeviceId();
            const deviceInfo = this.deviceManager.getDeviceInfo();

            const result = await this.apiRequest('/auth/login', {
                method: 'POST',
                body: {
                    email,
                    password,
                    deviceId,
                    deviceInfo
                }
            });

            this.token = result.token;
            this.user = result.user;
            this.isAuthenticated = true;

            localStorage.setItem('auth_token', this.token);
            
            console.log('[FreemiumAuth] Login exitoso:', this.user);
            return { success: true, user: this.user };

        } catch (error) {
            console.error('[FreemiumAuth] Error en login:', error);
            
            // Manejar caso especial de límite de dispositivos
            if (error.message.includes('DEVICE_LIMIT_REACHED')) {
                return { 
                    success: false, 
                    error: error.message,
                    code: 'DEVICE_LIMIT_REACHED'
                };
            }
            
            return { success: false, error: error.message };
        }
    }

    /**
     * Cierra sesión del usuario
     */
    logout() {
        this.clearAuth();
        console.log('[FreemiumAuth] Sesión cerrada');
        
        // Recargar página para limpiar estado
        window.location.reload();
    }

    /**
     * Limpia datos de autenticación
     */
    clearAuth() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('auth_token');
    }

    /**
     * Obtiene dispositivos registrados del usuario
     */
    async getDevices() {
        try {
            const result = await this.apiRequest('/devices');
            return { success: true, devices: result.devices };
        } catch (error) {
            console.error('[FreemiumAuth] Error obteniendo dispositivos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Desvincula un dispositivo
     */
    async unlinkDevice(deviceId) {
        try {
            await this.apiRequest(`/devices/${deviceId}`, {
                method: 'DELETE'
            });
            
            console.log('[FreemiumAuth] Dispositivo desvinculado:', deviceId);
            return { success: true };
        } catch (error) {
            console.error('[FreemiumAuth] Error desvinculando dispositivo:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Crea sesión de checkout para suscripción premium
     */
    async createCheckoutSession() {
        try {
            const result = await this.apiRequest('/stripe/create-checkout-session', {
                method: 'POST'
            });

            return { success: true, sessionId: result.sessionId };
        } catch (error) {
            console.error('[FreemiumAuth] Error creando sesión de pago:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Redirige a Stripe Checkout
     */
    async redirectToCheckout() {
        const result = await this.createCheckoutSession();
        
        if (result.success) {
            // Cargar Stripe.js si no está cargado
            if (!window.Stripe) {
                const script = document.createElement('script');
                script.src = 'https://js.stripe.com/v3/';
                document.head.appendChild(script);
                
                await new Promise(resolve => {
                    script.onload = resolve;
                });
            }

            const stripe = Stripe('tu_stripe_publishable_key'); // Reemplazar con tu clave pública
            
            const { error } = await stripe.redirectToCheckout({
                sessionId: result.sessionId
            });

            if (error) {
                console.error('[FreemiumAuth] Error redirigiendo a checkout:', error);
                alert('Error al procesar el pago. Inténtalo de nuevo.');
            }
        } else {
            alert(`Error: ${result.error}`);
        }
    }

    /**
     * Verifica si el usuario puede acceder a funciones premium
     */
    canAccessPremium() {
        return this.user && this.user.canAccessPremium;
    }

    /**
     * Obtiene el estado actual del usuario
     */
    getUserStatus() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.user,
            canAccessPremium: this.canAccessPremium()
        };
    }

    /**
     * Configura la interfaz de usuario según el estado de autenticación
     */
    setupUI() {
        if (this.isAuthenticated) {
            this.hideAuthUI();
            this.showPremiumControls();
        } else {
            this.showAuthUI();
            this.hidePremiumControls();
        }
    }

    /**
     * Muestra interfaz de autenticación
     */
    showAuthUI() {
        // Implementar según tu UI actual
        console.log('[FreemiumAuth] Mostrando UI de autenticación');
    }

    /**
     * Oculta interfaz de autenticación
     */
    hideAuthUI() {
        // Implementar según tu UI actual
        console.log('[FreemiumAuth] Ocultando UI de autenticación');
    }

    /**
     * Muestra controles premium según el estado del usuario
     */
    showPremiumControls() {
        if (this.canAccessPremium()) {
            console.log('[FreemiumAuth] Usuario premium - mostrando todas las funciones');
            // Habilitar todas las funciones
        } else {
            console.log('[FreemiumAuth] Usuario gratuito - limitando funciones');
            // Mostrar solo funciones básicas
            this.showUpgradePrompts();
        }
    }

    /**
     * Oculta controles premium
     */
    hidePremiumControls() {
        console.log('[FreemiumAuth] Ocultando controles premium');
    }

    /**
     * Muestra prompts para actualizar a premium
     */
    showUpgradePrompts() {
        console.log('[FreemiumAuth] Mostrando prompts de actualización');
        // Implementar prompts de upgrade
    }

    /**
     * Maneja el éxito del pago
     */
    async handlePaymentSuccess(sessionId) {
        console.log('[FreemiumAuth] Pago exitoso, actualizando estado del usuario');
        
        // Verificar el nuevo estado del usuario
        await this.verifyToken();
        
        // Actualizar UI
        this.setupUI();
        
        // Mostrar mensaje de éxito
        alert('¡Bienvenido a Premium! Ya tienes acceso a todas las funciones.');
    }
}

// Crear instancia global
window.freemiumAuth = new FreemiumAuthSystem();

// Exportar para módulos
export { FreemiumAuthSystem };
