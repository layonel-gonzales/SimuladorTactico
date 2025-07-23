// Sistema de planes y pagos para Soccer Tactics
class PaymentManager {
    constructor() {
        this.plans = {
            free: {
                name: 'Gratuito',
                price: 0,
                features: {
                    maxTactics: 3,
                    maxAnimationFrames: 3,
                    formations: ['4-4-2', '4-3-3'],
                    export: 'watermark',
                    realPlayers: false,
                    cloudSave: false
                }
            },
            monthly: {
                name: 'Premium Mensual',
                price: 4.99,
                stripeId: 'price_premium_monthly',
                features: {
                    maxTactics: -1, // ilimitado
                    maxAnimationFrames: -1,
                    formations: 'all',
                    export: 'hd',
                    realPlayers: true,
                    cloudSave: true
                }
            },
            yearly: {
                name: 'Premium Anual',
                price: 39.99,
                stripeId: 'price_premium_yearly',
                features: {
                    maxTactics: -1,
                    maxAnimationFrames: -1,
                    formations: 'all',
                    export: 'hd',
                    realPlayers: true,
                    cloudSave: true,
                    bonus: '33% descuento'
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
        
        // Mostrar modal con Bootstrap
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Limpiar después de cerrar
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
            maxTactics: 'Has alcanzado el límite de tácticas gratuitas. Actualiza para crear tácticas ilimitadas.',
            export: 'Exporta tus tácticas en alta calidad sin marca de agua.',
            realPlayers: 'Accede a la base de datos de jugadores reales con estadísticas actualizadas.',
            formations: 'Desbloquea todas las formaciones tácticas disponibles.',
            cloudSave: 'Guarda tus tácticas en la nube y accede desde cualquier dispositivo.'
        };
        return descriptions[feature] || 'Actualiza a premium para desbloquear esta característica.';
    }
    
    async startPayment(planType) {
        if (!this.stripe) {
            alert('Error al cargar el sistema de pagos. Por favor, recarga la página.');
            return;
        }
        
        try {
            // Llamar a tu backend para crear la sesión de pago
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planType: planType,
                    priceId: this.plans[planType].stripeId
                })
            });
            
            const session = await response.json();
            
            // Redirigir a Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });
            
            if (result.error) {
                console.error('Error de Stripe:', result.error);
                alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
            }
            
        } catch (error) {
            console.error('Error al iniciar el pago:', error);
            alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
        }
    }
    
    // Métodos para verificar límites antes de ejecutar acciones
    canCreateTactic() {
        const current = this.getCurrentTacticsCount();
        return this.isWithinLimit('maxTactics', current);
    }
    
    canAddAnimationFrame() {
        const current = this.getCurrentFramesCount();
        return this.isWithinLimit('maxAnimationFrames', current);
    }
    
    canExportHD() {
        return this.hasFeature('export') && this.currentPlan.features.export === 'hd';
    }
    
    getCurrentTacticsCount() {
        // Implementar conteo real de tácticas guardadas
        const tactics = JSON.parse(localStorage.getItem('savedTactics') || '[]');
        return tactics.length;
    }
    
    getCurrentFramesCount() {
        // Implementar conteo real de frames de animación
        const frames = JSON.parse(localStorage.getItem('animationFrames') || '[]');
        return frames.length;
    }
}

// Inicializar el sistema de pagos
window.paymentManager = new PaymentManager();

console.log('[Payment] Sistema de pagos inicializado');

export default PaymentManager;
