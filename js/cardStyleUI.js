// cardStyleUI.js - Interfaz de usuario para seleccionar estilos de cards

class CardStyleUI {
    constructor() {
        this.isVisible = false;
        this.currentSelectedStyle = null;
        this.previewCards = new Map();
        this.init();
    }

    /**
     * Inicializar la UI de estilos de cards
     */
    init() {
        this.createStylePanel();
        this.setupEventListeners();
        console.log('🎨 CardStyleUI inicializada');
    }

    /**
     * Crear el panel de selección de estilos
     */
    createStylePanel() {
        // Crear el botón para abrir el panel
        this.createStyleButton();
        
        // Crear el panel modal
        this.createStyleModal();
    }

    /**
     * Crear botón de estilos de cards
     */
    createStyleButton() {
        // Buscar el botón que ya existe en el HTML
        const styleButton = document.getElementById('card-style-button');
        
        if (!styleButton) {
            console.warn('⚠️ No se encontró el botón card-style-button en el HTML');
            return;
        }

        // Configurar el botón existente
        this.styleButton = styleButton;
        console.log('✅ Botón de estilos de cards conectado desde barra inferior');
    }

    /**
     * Crear modal de selección de estilos
     */
    createStyleModal() {
        // Crear modal HTML estándar como los otros
        const modalHtml = `
            <div class="modal fade custom-z-index-modal" style="z-index: 10000;" id="card-style-modal" tabindex="-1" aria-labelledby="cardStyleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-fullscreen modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="cardStyleModalLabel">
                                <i class="fas fa-credit-card me-2"></i>Estilos de Cards de Jugador
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p class="text-muted mb-4">
                                Selecciona el estilo visual para las cards de jugador en el campo y selección.
                            </p>
                            <div class="row g-4" id="card-style-grid">
                                <!-- Se llenará dinámicamente -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="apply-style" disabled>Aplicar Estilo</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        this.modal = document.getElementById('card-style-modal');
        this.modalContent = document.querySelector('#card-style-modal .modal-content');
        
        // Poblar el grid con estilos disponibles
        this.populateStyleGrid();
    }

    /**
     * Poblar el grid con estilos disponibles
     */
    populateStyleGrid() {
        const grid = document.getElementById('card-style-grid');
        if (!grid) return;

        try {
            const availableStyles = window.cardStyleManager.getAvailableStyles();
            const currentStyle = window.cardStyleManager.getCurrentStyle();

            grid.innerHTML = '';

            availableStyles.forEach(style => {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-3';
                
                const styleCard = document.createElement('div');
                styleCard.className = 'card h-100 style-option';
                styleCard.dataset.styleId = style.id;
                
                if (style.id === currentStyle.id) {
                    styleCard.classList.add('border-primary', 'selected');
                    this.currentSelectedStyle = style.id;
                    // Habilitar botón aplicar
                    const applyBtn = document.getElementById('apply-style');
                    if (applyBtn) applyBtn.disabled = false;
                }

                styleCard.innerHTML = `
                    <div class="card-body text-center">
                        <div class="style-icon mb-3 fs-1">${style.icon}</div>
                        <h6 class="card-title">${style.name}</h6>
                        <p class="card-text text-muted small">${style.description}</p>
                        <div class="style-preview mt-3 p-2 bg-light rounded">
                            <small class="text-muted">Vista previa disponible al seleccionar</small>
                        </div>
                    </div>
                `;

                styleCard.addEventListener('click', () => {
                    this.selectStyle(style.id);
                });

                col.appendChild(styleCard);
                grid.appendChild(col);
            });

        } catch (error) {
            console.error('Error poblando grid de estilos:', error);
            grid.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error cargando estilos de cards</p></div>';
        }
    }

    /**
     * Seleccionar un estilo
     */
    selectStyle(styleId) {
        // Remover selección anterior
        document.querySelectorAll('.style-option.selected').forEach(el => {
            el.classList.remove('selected', 'border-primary');
            el.classList.add('border-light');
        });

        // Agregar selección nueva
        const selectedOption = document.querySelector(`[data-style-id="${styleId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected', 'border-primary');
            selectedOption.classList.remove('border-light');
            this.currentSelectedStyle = styleId;
            
            // Habilitar botón aplicar
            const applyButton = document.getElementById('apply-style');
            if (applyButton) {
                applyButton.disabled = false;
            }
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Botón para abrir modal
        if (this.styleButton) {
            this.styleButton.addEventListener('click', () => {
                this.showModal();
            });
        }

        // Event listeners del modal usando Bootstrap
        document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById('card-style-modal');
            if (modal) {
                modal.addEventListener('hidden.bs.modal', () => {
                    this.isVisible = false;
                });
                
                modal.addEventListener('shown.bs.modal', () => {
                    this.isVisible = true;
                });
            }
        });

        // Event delegation para los botones del modal
        document.addEventListener('click', (e) => {
            if (e.target.id === 'apply-style') {
                this.applySelectedStyle();
            }
        });
    }

    /**
     * Mostrar modal
     */
    showModal() {
        if (this.modal) {
            const bootstrapModal = new bootstrap.Modal(this.modal);
            bootstrapModal.show();
            this.isVisible = true;
            
            // Actualizar grid por si hay cambios
            this.populateStyleGrid();
        }
    }

    /**
     * Ocultar modal
     */
    hideModal() {
        if (this.modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(this.modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
            this.isVisible = false;
        }
    }

    /**
     * Aplicar estilo seleccionado
     */
    applySelectedStyle() {
        if (!this.currentSelectedStyle) {
            alert('Por favor selecciona un estilo');
            return;
        }

        try {
            const success = window.cardStyleManager.setCurrentStyle(this.currentSelectedStyle);
            
            if (success) {
                console.log(`✅ Estilo aplicado: ${this.currentSelectedStyle}`);
                this.hideModal();
                
                // Mostrar notificación
                this.showNotification(`Estilo "${window.cardStyleManager.getCurrentStyle().name}" aplicado correctamente`);
            } else {
                alert('Error aplicando el estilo seleccionado');
            }
        } catch (error) {
            console.error('Error aplicando estilo:', error);
            alert('Error aplicando el estilo');
        }
    }

    /**
     * Mostrar notificación temporal
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10001;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Agregar animaciones para notificaciones
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

const notificationStyleSheet = document.createElement('style');
notificationStyleSheet.textContent = notificationStyles;
document.head.appendChild(notificationStyleSheet);

// Exportar para uso global
window.cardStyleUI = new CardStyleUI();

// Exportar para compatibilidad
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardStyleUI;
}
