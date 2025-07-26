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
            },
            pro: {
                name: 'Pro',
                price: 19.99,
                stripeId: 'price_pro_monthly',
                features: {
                    // Todo lo de Premium +
                    maxLines: -1,
                    maxTactics: -1,
                    maxAnimationDuration: -1,       // Sin límites
                    maxAnimationFrames: -1,
                    maxAnimations: -1,
                    formations: 'all',
                    colors: 'all',
                    lineWidths: 'all',
                    export: 'hd',
                    audioRecording: true,
                    jsonExport: true,
                    cloudSync: true,
                    socialShare: true,
                    multipleTeams: true,            // NUEVO: Múltiples equipos
                    analytics: true,                // NUEVO: Dashboard analytics
                    collaboration: 5,               // NUEVO: 5 usuarios simultáneos
                    apiAccess: true,                // NUEVO: API access
                    prioritySupport: true,          // NUEVO: Soporte prioritario
                    whiteLabel: true,               // NUEVO: Marca personalizada
                    maxDevices: -1                  // Ilimitado
                }
            }
        };
        
        this.currentPlan = this.loadUserPlan();
        this.stripe = null;
        this.initStripe();
    }
    
    async initStripe() {
        // Cargar Stripe desde CDN
        if (typeof Stripe === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => {
                this.stripe = Stripe('pk_test_TU_CLAVE_PUBLICA_AQUI');
            };
            document.head.appendChild(script);
        } else {
            this.stripe = Stripe('pk_test_TU_CLAVE_PUBLICA_AQUI');
        }
    }
    
    loadUserPlan() {
        // Cargar desde localStorage o API
        const saved = localStorage.getItem('userPlan');
        return saved ? JSON.parse(saved) : this.plans.free;
    }
    
    hasFeature(featureName) {
        return this.currentPlan.features[featureName] === true || 
               this.currentPlan.features[featureName] === -1;
    }
    
    getLimit(limitName) {
        return this.currentPlan.features[limitName];
    }
    
    isWithinLimit(limitName, currentUsage) {
        const limit = this.getLimit(limitName);
        return limit === -1 || currentUsage < limit;
    }
    
    showUpgradeModal(feature) {
        const modal = this.createUpgradeModal(feature);
        document.body.appendChild(modal);
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    createUpgradeModal(feature) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark text-light">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title">
                            <i class="fas fa-crown text-warning"></i>
                            Actualiza a Premium
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-4">
                            <div class="feature-icon mb-3">
                                <i class="fas fa-lock fa-3x text-warning"></i>
                            </div>
                            <h6 class="text-warning">Característica Premium</h6>
                            <p class="mb-4">${this.getFeatureDescription(feature)}</p>
                        </div>
                        
                        <div class="pricing-cards">
                            ${this.createPricingCards()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }
    
    createPricingCards() {
        return `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <div class="card bg-secondary text-light h-100">
                        <div class="card-body text-center">
                            <h6 class="card-title">Mensual</h6>
                            <div class="price">
                                <span class="h4">$4.99</span>
                                <small class="text-muted">/mes</small>
                            </div>
                            <ul class="list-unstyled mt-3 mb-3">
                                <li><i class="fas fa-check text-success"></i> Tácticas ilimitadas</li>
                                <li><i class="fas fa-check text-success"></i> Sin marca de agua</li>
                                <li><i class="fas fa-check text-success"></i> Todas las formaciones</li>
                            </ul>
                            <button class="btn btn-warning btn-sm" onclick="paymentManager.startPayment('monthly')">
                                Suscribirse
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <div class="card bg-warning text-dark h-100 position-relative">
                        <div class="badge bg-success position-absolute top-0 start-50 translate-middle px-3 py-2">
                            ¡Mejor oferta!
                        </div>
                        <div class="card-body text-center mt-3">
                            <h6 class="card-title">Anual</h6>
                            <div class="price">
                                <span class="h4">$39.99</span>
                                <small class="text-muted">/año</small>
                            </div>
                            <small class="text-success d-block">Ahorras $20</small>
                            <ul class="list-unstyled mt-3 mb-3">
                                <li><i class="fas fa-check text-success"></i> Todo lo del mensual</li>
                                <li><i class="fas fa-check text-success"></i> 33% de descuento</li>
                                <li><i class="fas fa-check text-success"></i> Soporte priority</li>
                            </ul>
                            <button class="btn btn-dark btn-sm" onclick="paymentManager.startPayment('yearly')">
                                Suscribirse
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getFeatureDescription(feature) {
        const descriptions = {
            maxTactics: 'Crear tácticas ilimitadas para todos tus equipos y estrategias.',
            maxAnimationFrames: 'Animaciones más largas y detalladas para mostrar jugadas complejas.',
            formations: 'Acceso a todas las formaciones tácticas disponibles.',
            export: 'Exportar tus tácticas en alta calidad sin marca de agua.',
            realPlayers: 'Acceso a base de datos de jugadores reales con fotos y estadísticas.',
            cloudSave: 'Guardar tus tácticas en la nube y sincronizar entre dispositivos.'
        };
        
        return descriptions[feature] || 'Desbloquea todas las características premium.';
    }
    
    async startPayment(planType) {
        if (!this.stripe) {
            console.error('💳 Stripe no está inicializado');
            return;
        }
        
        const plan = this.plans[planType];
        if (!plan) {
            console.error('💳 Plan no encontrado:', planType);
            return;
        }
        
        try {
            // En un entorno real, esto haría una llamada a tu backend
            console.log('💳 Iniciando pago para plan:', plan.name);
            
            // Simular proceso de pago exitoso para desarrollo
            setTimeout(() => {
                this.handlePaymentSuccess(planType);
            }, 2000);
            
        } catch (error) {
            console.error('💳 Error en el pago:', error);
            this.handlePaymentError(error);
        }
    }
    
    handlePaymentSuccess(planType) {
        this.currentPlan = this.plans[planType];
        localStorage.setItem('userPlan', JSON.stringify(this.currentPlan));
        
        console.log('💳 Pago exitoso! Plan actual:', this.currentPlan.name);
        
        // Mostrar mensaje de éxito
        this.showSuccessMessage();
        
        // Cerrar modal si está abierto
        const activeModal = document.querySelector('.modal.show');
        if (activeModal) {
            const modal = bootstrap.Modal.getInstance(activeModal);
            modal.hide();
        }
    }
    
    handlePaymentError(error) {
        console.error('💳 Error en el pago:', error);
        
        // Mostrar mensaje de error
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-danger border-0';
        toast.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error en el pago. Inténtalo de nuevo.
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
    
    showSuccessMessage() {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0';
        toast.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-crown me-2"></i>
                    ¡Bienvenido a Premium! Disfruta todas las características.
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
    
    // Métodos para verificar límites antes de ejecutar acciones
    canCreateTactic() {
        const currentCount = this.getCurrentTacticsCount();
        return this.isWithinLimit('maxTactics', currentCount);
    }
    
    canAddAnimationFrame() {
        const currentCount = this.getCurrentFramesCount();
        return this.isWithinLimit('maxAnimationFrames', currentCount);
    }
    
    canExportHD() {
        return this.hasFeature('export') && this.currentPlan.features.export === 'hd';
    }
    
    getCurrentTacticsCount() {
        // Obtener del localStorage o API
        const tactics = JSON.parse(localStorage.getItem('savedTactics') || '[]');
        return tactics.length;
    }
    
    getCurrentFramesCount() {
        // Obtener del estado actual de animación
        return window.animationManager ? window.animationManager.getFrameCount() : 0;
    }
}

// Instancia global
window.paymentManager = new PaymentManager();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentManager;
}
