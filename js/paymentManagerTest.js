/**
 * ==========================================
 * 💳 PAYMENT MANAGER - SISTEMA DE PAGOS
 * ==========================================
 * Sistema completo de pagos con Stripe
 * Incluye modo sandbox para testing y desarrollo
 */

class PaymentManager {
    constructor() {
        this.isTestMode = this.detectTestMode();
        this.stripe = null;
        this.config = {
            // Claves públicas (seguro exponerlas)
            publicKeys: {
                test: 'pk_test_51...',  // Tu clave pública de test
                live: 'pk_live_51...'   // Tu clave pública de producción
            },
            // URLs del backend
            endpoints: {
                test: 'http://localhost:3000/api',
                live: 'https://api.simuladortactico.com/api'
            }
        };
        
        this.currentPlan = null;
        this.debugMode = false;
        this.webhookLog = [];
        
        this.init();
    }

    detectTestMode() {
        // Detectar automáticamente si estamos en modo de prueba
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isTestDomain = hostname.includes('.test') || hostname.includes('staging');
        const hasTestParam = new URLSearchParams(window.location.search).has('test_mode');
        
        return isLocalhost || isTestDomain || hasTestParam;
    }

    async init() {
        try {
            console.log(`[PaymentManager] 🚀 Inicializando en modo: ${this.isTestMode ? '🧪 TEST' : '🔴 PRODUCCIÓN'}`);
            
            // Cargar Stripe.js dinámicamente
            await this.loadStripe();
            
            // Configurar Stripe con la clave correcta
            const publicKey = this.isTestMode ? this.config.publicKeys.test : this.config.publicKeys.live;
            this.stripe = Stripe(publicKey);
            
            // Configurar elementos de UI
            this.setupPaymentElements();
            
            // Mostrar indicador de modo test si corresponde
            if (this.isTestMode) {
                this.showTestModeIndicator();
            }
            
            console.log('[PaymentManager] ✅ Inicializado correctamente');
            
        } catch (error) {
            console.error('[PaymentManager] ❌ Error en inicialización:', error);
        }
    }

    async loadStripe() {
        // Cargar Stripe.js si no está disponible
        if (typeof Stripe === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.async = true;
            
            return new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }

    // ==========================================
    // MÉTODOS DE SUSCRIPCIÓN
    // ==========================================

    async createSubscription(planType, options = {}) {
        console.log(`[PaymentManager] Creando suscripción: ${planType}`);
        
        try {
            const endpoint = this.getEndpoint('/subscriptions/create');
            
            const payload = {
                plan: planType,
                billing_cycle: options.billingCycle || 'monthly',
                coupon: options.coupon || null,
                trial_days: options.trialDays || 0,
                test_mode: this.isTestMode
            };

            if (this.debugMode) {
                console.log('[PaymentManager] 🐛 Payload:', payload);
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getUserToken()}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error creando suscripción');
            }

            // Redirigir a Stripe Checkout
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else if (data.client_secret) {
                // Usar Payment Intent para pagos más personalizados
                return await this.confirmPayment(data.client_secret);
            }

            return data;

        } catch (error) {
            console.error('[PaymentManager] Error creando suscripción:', error);
            this.showPaymentError(error.message);
            throw error;
        }
    }

    async cancelSubscription(reason = null) {
        console.log('[PaymentManager] Cancelando suscripción...');
        
        try {
            const endpoint = this.getEndpoint('/subscriptions/cancel');
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getUserToken()}`
                },
                body: JSON.stringify({
                    reason: reason,
                    test_mode: this.isTestMode
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error cancelando suscripción');
            }

            this.showSuccess('Suscripción cancelada correctamente');
            
            // Actualizar el estado local
            if (window.freemiumController) {
                await freemiumController.loadUserPlan();
            }

            return data;

        } catch (error) {
            console.error('[PaymentManager] Error cancelando suscripción:', error);
            this.showPaymentError(error.message);
            throw error;
        }
    }

    // ==========================================
    // MÉTODOS DE TESTING PARA DESARROLLADORES
    // ==========================================

    enableDebugMode() {
        this.debugMode = true;
        console.log('[PaymentManager] 🐛 Modo debug activado');
        this.showDebugPanel();
    }

    showDebugPanel() {
        if (document.getElementById('payment-debug-panel')) return;

        const debugPanel = document.createElement('div');
        debugPanel.id = 'payment-debug-panel';
        debugPanel.innerHTML = `
            <div class="payment-debug-panel">
                <h4>🔧 Payment Debug Panel</h4>
                <div class="debug-info">
                    <p><strong>Modo:</strong> ${this.isTestMode ? '🧪 TEST' : '🚀 PRODUCCIÓN'}</p>
                    <p><strong>Endpoint:</strong> ${this.getEndpoint('')}</p>
                    <p><strong>Stripe Key:</strong> ${this.isTestMode ? 'pk_test_...' : 'pk_live_...'}</p>
                </div>
                
                <div class="debug-actions">
                    <button onclick="paymentManager.testSubscription('premium')">Test Premium</button>
                    <button onclick="paymentManager.testSubscription('pro')">Test Pro</button>
                    <button onclick="paymentManager.simulateWebhook('payment_succeeded')">✅ Pago Exitoso</button>
                    <button onclick="paymentManager.simulateWebhook('payment_failed')">❌ Pago Fallido</button>
                    <button onclick="paymentManager.testCards()">Ver Tarjetas Test</button>
                    <button onclick="paymentManager.testRefund()">Test Reembolso</button>
                </div>
                
                <div class="debug-log" id="payment-debug-log">
                    <strong>Log de eventos:</strong>
                </div>
                
                <button onclick="this.parentElement.remove()" class="close-debug">✕</button>
            </div>
            
            <style>
                .payment-debug-panel {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #1a1a1a;
                    color: #fff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    z-index: 10000;
                    max-width: 400px;
                    font-family: monospace;
                    font-size: 12px;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                
                .payment-debug-panel h4 {
                    margin: 0 0 15px 0;
                    color: #4CAF50;
                }
                
                .debug-info p {
                    margin: 5px 0;
                }
                
                .debug-actions {
                    margin: 15px 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }
                
                .debug-actions button {
                    background: #333;
                    border: 1px solid #555;
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 10px;
                }
                
                .debug-actions button:hover {
                    background: #555;
                }
                
                .debug-log {
                    max-height: 200px;
                    overflow-y: auto;
                    background: #000;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 10px 0;
                }
                
                .close-debug {
                    position: absolute;
                    top: 5px;
                    right: 10px;
                    background: none;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    font-size: 16px;
                }
            </style>
        `;
        
        document.body.appendChild(debugPanel);
    }

    debugLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[PaymentManager] ${message}`);
        
        // Guardar en log interno
        this.webhookLog.push({
            timestamp,
            message,
            type
        });
        
        const logElement = document.getElementById('payment-debug-log');
        if (logElement) {
            const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
            logElement.innerHTML += `<div>${timestamp} ${emoji} ${message}</div>`;
            logElement.scrollTop = logElement.scrollHeight;
        }
    }

    // Tarjetas de prueba para Stripe
    testCards() {
        const cards = {
            '✅ Visa exitosa': '4242424242424242',
            '❌ Visa rechazada': '4000000000000002',
            '🔄 Requiere 3D Secure': '4000002500003155',
            '💳 Mastercard': '5555555555554444',
            '🇺🇸 American Express': '378282246310005',
            '⏰ Tarjeta expirada': '4000000000000069',
            '❌ CVC incorrecto': '4000000000000127',
            '❌ Sin fondos': '4000000000009995'
        };

        let cardList = '🧪 TARJETAS DE PRUEBA STRIPE:\n\n';
        for (const [name, number] of Object.entries(cards)) {
            cardList += `${name}: ${number}\n`;
        }
        cardList += '\n✨ CVV: 123, Fecha: 12/34, ZIP: 12345';
        cardList += '\n\n🔗 Más info: https://stripe.com/docs/testing';

        alert(cardList);
        this.debugLog('Mostradas tarjetas de prueba', 'info');
    }

    async testSubscription(planType) {
        this.debugLog(`Iniciando test de suscripción ${planType}`, 'info');
        
        try {
            // En modo test, simular flujo completo
            if (this.isTestMode) {
                this.debugLog('Simulando Stripe Checkout...', 'info');
                
                // Simular delay de procesamiento
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Simular resultado exitoso
                this.debugLog(`✅ Suscripción ${planType} creada exitosamente`, 'success');
                this.simulateWebhook('payment_succeeded');
                
                return {
                    success: true,
                    subscription_id: `sub_test_${Math.random().toString(36).substr(2, 9)}`,
                    plan: planType
                };
            } else {
                // Producción: usar flujo real
                return await this.createSubscription(planType, {
                    trial_days: 7 // Siempre con trial en test
                });
            }
            
        } catch (error) {
            this.debugLog(`❌ Error en test: ${error.message}`, 'error');
        }
    }

    async testRefund() {
        this.debugLog('Simulando reembolso...', 'info');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.debugLog('✅ Reembolso procesado exitosamente', 'success');
            this.simulateWebhook('refund_succeeded');
            
        } catch (error) {
            this.debugLog(`❌ Error en reembolso: ${error.message}`, 'error');
        }
    }

    async simulateWebhook(eventType) {
        this.debugLog(`Simulando webhook: ${eventType}`, 'info');
        
        const webhookEvents = {
            'payment_succeeded': {
                type: 'invoice.payment_succeeded',
                data: {
                    customer: 'cus_test_123',
                    subscription: 'sub_test_456',
                    amount: 999,
                    currency: 'usd'
                }
            },
            'payment_failed': {
                type: 'invoice.payment_failed',
                data: {
                    customer: 'cus_test_123',
                    subscription: 'sub_test_456',
                    error: 'Your card was declined.'
                }
            },
            'subscription_cancelled': {
                type: 'customer.subscription.deleted',
                data: {
                    customer: 'cus_test_123',
                    subscription: 'sub_test_456'
                }
            },
            'refund_succeeded': {
                type: 'charge.dispute.created',
                data: {
                    amount: 999,
                    reason: 'Test refund'
                }
            }
        };

        const event = webhookEvents[eventType];
        if (event) {
            this.debugLog(`Webhook ${event.type} procesado`, 'success');
            
            // Simular actualización de estado del usuario
            if (eventType === 'payment_succeeded') {
                this.debugLog('Usuario actualizado a plan Premium', 'success');
            } else if (eventType === 'subscription_cancelled') {
                this.debugLog('Usuario downgradeado a plan gratuito', 'info');
            }
        }
    }

    // ==========================================
    // UTILIDADES
    // ==========================================

    getEndpoint(path) {
        const baseUrl = this.isTestMode ? 
            this.config.endpoints.test : 
            this.config.endpoints.live;
        return `${baseUrl}${path}`;
    }

    getUserToken() {
        // En desarrollo, usar token de prueba
        if (this.isTestMode) {
            return 'test_token_' + Math.random().toString(36).substr(2, 9);
        }
        
        // En producción, obtener token real del usuario
        return localStorage.getItem('auth_token') || 'guest_token';
    }

    showTestModeIndicator() {
        if (document.getElementById('test-mode-indicator')) return;

        const indicator = document.createElement('div');
        indicator.id = 'test-mode-indicator';
        indicator.innerHTML = `
            <div class="test-mode-banner">
                🧪 MODO PRUEBA - Los pagos no son reales
                <button onclick="paymentManager.enableDebugMode()">Debug Panel</button>
                <button onclick="paymentManager.testCards()">Tarjetas Test</button>
            </div>
            
            <style>
                .test-mode-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(45deg, #ff6b6b, #feca57);
                    color: #000;
                    padding: 10px;
                    text-align: center;
                    font-weight: bold;
                    z-index: 9999;
                    animation: pulse 2s infinite;
                }
                
                .test-mode-banner button {
                    margin-left: 15px;
                    background: rgba(0,0,0,0.2);
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .test-mode-banner button:hover {
                    background: rgba(0,0,0,0.4);
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            </style>
        `;
        
        document.body.appendChild(indicator);
    }

    showPaymentError(message) {
        // Mostrar error de pago de forma user-friendly
        this.debugLog(`Error: ${message}`, 'error');
        
        if (window.uiManager && uiManager.showModal) {
            uiManager.showModal('error', {
                title: '❌ Error de Pago',
                message: message,
                actions: [
                    {
                        text: 'Reintentar',
                        action: () => this.retryLastPayment()
                    },
                    {
                        text: 'Soporte',
                        action: () => window.open('mailto:soporte@simuladortactico.com')
                    }
                ]
            });
        } else {
            alert(`Error de pago: ${message}`);
        }
    }

    showSuccess(message) {
        console.log(`[PaymentManager] ✅ ${message}`);
        this.debugLog(message, 'success');
    }

    setupPaymentElements() {
        // Configurar elementos de UI relacionados con pagos
        this.addPaymentStyles();
        this.setupUpgradeButtons();
    }

    addPaymentStyles() {
        if (document.getElementById('payment-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'payment-styles';
        styles.textContent = `
            .upgrade-btn {
                background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .upgrade-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            }
            
            .upgrade-btn:active {
                transform: translateY(0);
            }
            
            .upgrade-btn.loading {
                pointer-events: none;
            }
            
            .upgrade-btn.loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
        `;
        
        document.head.appendChild(styles);
    }

    setupUpgradeButtons() {
        // Configurar botones de upgrade dinámicamente
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('upgrade-btn')) {
                e.preventDefault();
                
                const planType = e.target.dataset.plan || 'premium';
                this.handleUpgradeClick(planType, e.target);
            }
        });
    }

    async handleUpgradeClick(planType, button) {
        console.log(`[PaymentManager] Click upgrade a ${planType}`);
        
        // Mostrar loading
        button.classList.add('loading');
        const originalText = button.textContent;
        button.textContent = '';
        
        try {
            if (this.isTestMode) {
                await this.testSubscription(planType);
            } else {
                await this.createSubscription(planType);
            }
            
        } catch (error) {
            console.error('Error en upgrade:', error);
            
        } finally {
            // Restaurar botón
            button.classList.remove('loading');
            button.textContent = originalText;
        }
    }

    // ==========================================
    // API PÚBLICA PARA DESARROLLADORES
    // ==========================================

    getDebugInfo() {
        return {
            testMode: this.isTestMode,
            endpoint: this.getEndpoint(''),
            stripeLoaded: !!this.stripe,
            debugMode: this.debugMode,
            userToken: this.getUserToken(),
            webhookLog: this.webhookLog.slice(-10), // Últimos 10 eventos
            lastActivity: new Date().toISOString()
        };
    }

    // Método para switching entre test/prod desde consola
    switchMode(testMode = null) {
        if (testMode !== null) {
            this.isTestMode = testMode;
        } else {
            this.isTestMode = !this.isTestMode;
        }
        
        console.log(`[PaymentManager] Cambiando a modo: ${this.isTestMode ? 'TEST' : 'PRODUCCIÓN'}`);
        this.init(); // Reinicializar con nuevo modo
    }
}

// Instancia global
window.paymentManager = new PaymentManager();

// Exponer métodos de testing en consola para desarrolladores
window.testPayments = {
    premium: () => paymentManager.testSubscription('premium'),
    pro: () => paymentManager.testSubscription('pro'),
    debug: () => paymentManager.enableDebugMode(),
    cards: () => paymentManager.testCards(),
    webhook: (type) => paymentManager.simulateWebhook(type),
    refund: () => paymentManager.testRefund(),
    info: () => paymentManager.getDebugInfo(),
    switchMode: (testMode) => paymentManager.switchMode(testMode)
};

// Mostrar ayuda en consola solo en modo test
if (paymentManager.isTestMode) {
    console.log(`
🧪 PAYMENT TESTING DISPONIBLE:

testPayments.premium()    - Probar suscripción Premium
testPayments.pro()        - Probar suscripción Pro  
testPayments.debug()      - Abrir panel de debug
testPayments.cards()      - Ver tarjetas de prueba
testPayments.webhook()    - Simular webhooks
testPayments.refund()     - Probar reembolso
testPayments.info()       - Info del sistema
testPayments.switchMode() - Cambiar test/prod

Ejemplo: testPayments.premium()
    `);
}

console.log('[PaymentManager] 💳 Módulo cargado correctamente');
