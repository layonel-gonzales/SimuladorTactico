/**
 * 🎛️ INTERFAZ DE GESTIÓN PREMIUM
 * 
 * Componente de UI para gestionar suscripciones, dispositivos
 * y configuraciones de la cuenta premium.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

class PremiumUI {
    constructor(authSystem) {
        this.auth = authSystem;
        this.modalId = 'premiumModal';
        this.devicesModalId = 'devicesModal';
        
        this.init();
    }

    init() {
        this.createPremiumModal();
        this.createDevicesModal();
        this.attachEventListeners();
    }

    /**
     * Crea el modal principal de gestión premium
     */
    createPremiumModal() {
        const modalHTML = `
        <div class="modal fade" id="${this.modalId}" tabindex="-1" aria-labelledby="premiumModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-gradient-primary text-white">
                        <h5 class="modal-title" id="premiumModalLabel">
                            <i class="fas fa-crown me-2"></i>
                            Gestión de Cuenta Premium
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="premiumContent">
                            <!-- Contenido dinámico según estado del usuario -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Insertar modal en el DOM si no existe
        if (!document.getElementById(this.modalId)) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    /**
     * Crea el modal de gestión de dispositivos
     */
    createDevicesModal() {
        const modalHTML = `
        <div class="modal fade" id="${this.devicesModalId}" tabindex="-1" aria-labelledby="devicesModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title" id="devicesModalLabel">
                            <i class="fas fa-devices me-2"></i>
                            Dispositivos Registrados
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="devicesContent">
                            <div class="text-center">
                                <i class="fas fa-spinner fa-spin fa-2x"></i>
                                <p class="mt-2">Cargando dispositivos...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Insertar modal en el DOM si no existe
        if (!document.getElementById(this.devicesModalId)) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    /**
     * Adjunta event listeners
     */
    attachEventListeners() {
        // Listener para abrir modal de premium
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-premium-modal]')) {
                this.showPremiumModal();
            }
            
            if (e.target.matches('[data-devices-modal]')) {
                this.showDevicesModal();
            }
        });
    }

    /**
     * Muestra el modal premium con contenido dinámico
     */
    async showPremiumModal() {
        const status = this.auth.getUserStatus();
        const contentEl = document.getElementById('premiumContent');
        
        if (status.isAuthenticated) {
            if (status.canAccessPremium) {
                contentEl.innerHTML = this.getPremiumUserContent(status.user);
            } else {
                contentEl.innerHTML = this.getFreeUserContent(status.user);
            }
        } else {
            contentEl.innerHTML = this.getNotAuthenticatedContent();
        }

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById(this.modalId));
        modal.show();
    }

    /**
     * Contenido para usuarios premium
     */
    getPremiumUserContent(user) {
        const expiryDate = user.premiumExpires ? new Date(user.premiumExpires).toLocaleDateString() : 'Indefinido';
        
        return `
        <div class="alert alert-success">
            <i class="fas fa-check-circle me-2"></i>
            <strong>¡Cuenta Premium Activa!</strong>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">
                            <i class="fas fa-user me-2"></i>
                            Información de la Cuenta
                        </h6>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Estado:</strong> <span class="badge bg-success">Premium</span></p>
                        <p><strong>Vence:</strong> ${expiryDate}</p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">
                            <i class="fas fa-devices me-2"></i>
                            Dispositivos
                        </h6>
                        <p><strong>Registrados:</strong> ${user.deviceCount}/${user.maxDevices}</p>
                        <button class="btn btn-outline-info btn-sm" data-devices-modal>
                            <i class="fas fa-cog me-1"></i>
                            Gestionar Dispositivos
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-3">
            <h6>Funciones Premium Disponibles:</h6>
            <ul class="list-unstyled">
                <li><i class="fas fa-check text-success me-2"></i> Acceso completo a todas las herramientas</li>
                <li><i class="fas fa-check text-success me-2"></i> Hasta 3 dispositivos registrados</li>
                <li><i class="fas fa-check text-success me-2"></i> Guardado ilimitado de configuraciones</li>
                <li><i class="fas fa-check text-success me-2"></i> Soporte prioritario</li>
                <li><i class="fas fa-check text-success me-2"></i> Funciones exclusivas</li>
            </ul>
        </div>
        
        <div class="mt-3 d-flex gap-2">
            <button class="btn btn-outline-danger" onclick="premiumUI.cancelSubscription()">
                <i class="fas fa-times me-1"></i>
                Cancelar Suscripción
            </button>
            <button class="btn btn-outline-secondary" onclick="premiumUI.auth.logout()">
                <i class="fas fa-sign-out-alt me-1"></i>
                Cerrar Sesión
            </button>
        </div>
        `;
    }

    /**
     * Contenido para usuarios gratuitos
     */
    getFreeUserContent(user) {
        return `
        <div class="alert alert-warning">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Cuenta Gratuita</strong> - Funciones limitadas
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">
                            <i class="fas fa-user me-2"></i>
                            Tu Cuenta
                        </h6>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Estado:</strong> <span class="badge bg-warning">Gratuito</span></p>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card border-warning">
                    <div class="card-body text-center">
                        <h5 class="text-warning">
                            <i class="fas fa-crown"></i>
                            ¡Actualiza a Premium!
                        </h5>
                        <p class="small">Solo $9.99/mes</p>
                        <button class="btn btn-warning" onclick="premiumUI.upgradeToPremium()">
                            <i class="fas fa-credit-card me-1"></i>
                            Actualizar Ahora
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-6">
                <h6>Funciones Gratuitas:</h6>
                <ul class="list-unstyled">
                    <li><i class="fas fa-check text-success me-2"></i> Modo dibujo básico</li>
                    <li><i class="fas fa-check text-success me-2"></i> Plantillas básicas</li>
                    <li><i class="fas fa-times text-muted me-2"></i> <span class="text-muted">Guardado limitado</span></li>
                </ul>
            </div>
            
            <div class="col-md-6">
                <h6>Con Premium obtienes:</h6>
                <ul class="list-unstyled">
                    <li><i class="fas fa-star text-warning me-2"></i> Todas las herramientas</li>
                    <li><i class="fas fa-star text-warning me-2"></i> Hasta 3 dispositivos</li>
                    <li><i class="fas fa-star text-warning me-2"></i> Guardado ilimitado</li>
                    <li><i class="fas fa-star text-warning me-2"></i> Funciones exclusivas</li>
                </ul>
            </div>
        </div>
        `;
    }

    /**
     * Contenido para usuarios no autenticados
     */
    getNotAuthenticatedContent() {
        return `
        <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Inicia sesión</strong> para acceder a tu cuenta premium
        </div>
        
        <div class="text-center">
            <p>¿No tienes cuenta? Regístrate y obtén acceso premium</p>
            <div class="d-flex gap-2 justify-content-center">
                <button class="btn btn-primary" onclick="window.location.href='login.html'">
                    <i class="fas fa-sign-in-alt me-1"></i>
                    Iniciar Sesión
                </button>
                <button class="btn btn-outline-primary" onclick="premiumUI.showRegistrationForm()">
                    <i class="fas fa-user-plus me-1"></i>
                    Registrarse
                </button>
            </div>
        </div>
        `;
    }

    /**
     * Muestra el modal de gestión de dispositivos
     */
    async showDevicesModal() {
        const modal = new bootstrap.Modal(document.getElementById(this.devicesModalId));
        modal.show();
        
        // Cargar dispositivos
        await this.loadDevices();
    }

    /**
     * Carga y muestra la lista de dispositivos
     */
    async loadDevices() {
        const contentEl = document.getElementById('devicesContent');
        
        try {
            const result = await this.auth.getDevices();
            
            if (result.success) {
                contentEl.innerHTML = this.renderDevicesList(result.devices);
            } else {
                contentEl.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error cargando dispositivos: ${result.error}
                </div>
                `;
            }
        } catch (error) {
            console.error('Error cargando dispositivos:', error);
            contentEl.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error de conexión. Inténtalo de nuevo.
            </div>
            `;
        }
    }

    /**
     * Renderiza la lista de dispositivos
     */
    renderDevicesList(devices) {
        if (devices.length === 0) {
            return `
            <div class="text-center">
                <i class="fas fa-mobile-alt fa-3x text-muted mb-3"></i>
                <p>No hay dispositivos registrados</p>
            </div>
            `;
        }

        let html = `
        <p class="text-muted mb-3">
            <i class="fas fa-info-circle me-1"></i>
            Puedes tener hasta 3 dispositivos registrados en tu cuenta premium.
        </p>
        `;

        devices.forEach((device, index) => {
            const isCurrentDevice = device.deviceInfo && 
                device.deviceInfo.friendlyName && 
                device.deviceInfo.friendlyName.includes(navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser');
            
            html += `
            <div class="card mb-3 ${isCurrentDevice ? 'border-primary' : ''}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title">
                                <i class="fas fa-${this.getDeviceIcon(device.deviceInfo)} me-2"></i>
                                ${device.deviceInfo.friendlyName || `Dispositivo ${index + 1}`}
                                ${isCurrentDevice ? '<span class="badge bg-primary ms-2">Actual</span>' : ''}
                            </h6>
                            <p class="card-text small text-muted">
                                <strong>Registrado:</strong> ${new Date(device.registeredAt).toLocaleDateString()}<br>
                                <strong>Último acceso:</strong> ${new Date(device.lastAccess).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            ${!isCurrentDevice ? `
                            <button class="btn btn-outline-danger btn-sm" onclick="premiumUI.unlinkDevice('${device.id}')">
                                <i class="fas fa-unlink me-1"></i>
                                Desvincular
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            `;
        });

        return html;
    }

    /**
     * Obtiene el icono apropiado para el tipo de dispositivo
     */
    getDeviceIcon(deviceInfo) {
        if (!deviceInfo) return 'desktop';
        
        switch (deviceInfo.deviceType) {
            case 'mobile': return 'mobile-alt';
            case 'tablet': return 'tablet-alt';
            default: return 'desktop';
        }
    }

    /**
     * Desvincula un dispositivo
     */
    async unlinkDevice(deviceId) {
        if (!confirm('¿Estás seguro de que quieres desvincular este dispositivo?')) {
            return;
        }

        try {
            const result = await this.auth.unlinkDevice(deviceId);
            
            if (result.success) {
                alert('Dispositivo desvinculado exitosamente');
                await this.loadDevices(); // Recargar lista
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error desvinculando dispositivo:', error);
            alert('Error de conexión. Inténtalo de nuevo.');
        }
    }

    /**
     * Inicia el proceso de actualización a premium
     */
    async upgradeToPremium() {
        try {
            await this.auth.redirectToCheckout();
        } catch (error) {
            console.error('Error iniciando proceso de pago:', error);
            alert('Error al procesar el pago. Inténtalo de nuevo.');
        }
    }

    /**
     * Cancela la suscripción premium
     */
    async cancelSubscription() {
        if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción premium? Perderás el acceso a todas las funciones premium.')) {
            return;
        }

        alert('La cancelación de suscripciones debe realizarse a través del portal de cliente de Stripe. Te redirigiremos...');
        // Implementar redirección al portal de cliente de Stripe
    }

    /**
     * Muestra formulario de registro
     */
    showRegistrationForm() {
        // Implementar formulario de registro inline o redirigir
        alert('Función de registro en desarrollo. Por ahora usa la página de login.');
    }
}

// Crear instancia global cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (window.freemiumAuth) {
        window.premiumUI = new PremiumUI(window.freemiumAuth);
    }
});

// Añadir estilos CSS
const premiumStyles = `
<style>
.bg-gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.premium-feature-locked {
    opacity: 0.6;
    pointer-events: none;
    position: relative;
}

.premium-feature-locked::after {
    content: '🔒 Premium';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 193, 7, 0.9);
    color: #000;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: bold;
    z-index: 1000;
}

.premium-badge {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    color: #000;
    font-weight: bold;
    animation: premium-pulse 2s infinite;
}

@keyframes premium-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}
</style>
`;

// Insertar estilos en el head
document.head.insertAdjacentHTML('beforeend', premiumStyles);

export { PremiumUI };
