// fieldStyleUI.js - Interfaz de usuario para seleccionar estilos de cancha

class FieldStyleUI {
    constructor() {
        this.isVisible = false;
        this.currentSelectedStyle = null;
        this.init();
    }

    /**
     * Inicializar la UI de estilos de campos
     */
    init() {
        this.createStylePanel();
        this.setupEventListeners();
        console.log('🏟️ FieldStyleUI inicializada');
    }

    /**
     * Crear el panel de selección de estilos
     */
    createStylePanel() {
        // Crear el botón para abrir el panel
        this.createStyleButton();
        
        // Crear el modal
        this.createStyleModal();
    }

    /**
     * Crear botón de estilos de campos
     */
    createStyleButton() {
        // Buscar el botón que ya existe en el HTML
        const styleButton = document.getElementById('field-styles-btn');
        
        if (!styleButton) {
            console.warn('⚠️ No se encontró el botón field-styles-btn en el HTML');
            return;
        }

        // Configurar el botón existente
        this.styleButton = styleButton;
        console.log('✅ Botón de estilos de campos conectado desde barra inferior');
    }

    /**
     * Crear modal de selección de estilos
     */
    createStyleModal() {
        // Crear modal HTML estándar
        const modalHtml = `
            <div class="modal fade custom-z-index-modal" style="z-index: 10000;" id="field-style-modal" tabindex="-1" aria-labelledby="fieldStyleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-fullscreen modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="fieldStyleModalLabel">
                                <i class="fas fa-palette me-2"></i>Estilos de Campo de Fútbol
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p class="text-muted mb-4">
                                Selecciona el estilo visual para el campo de fútbol.
                            </p>
                            <div class="row g-4" id="field-style-grid">
                                <!-- Se llenará dinámicamente -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="apply-field-style" disabled>Aplicar Estilo</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        this.modal = document.getElementById('field-style-modal');
        this.modalContent = document.querySelector('#field-style-modal .modal-content');
        
        // Poblar el grid con estilos disponibles
        this.populateStyleGrid();
    }

    /**
     * Poblar el grid con estilos disponibles
     */
    populateStyleGrid() {
        const grid = document.getElementById('field-style-grid');
        if (!grid) return;

        try {
            const availableStyles = window.fieldStyleManager.getAvailableStyles();
            const currentStyle = window.fieldStyleManager.getCurrentStyle();

            grid.innerHTML = '';

            availableStyles.forEach(style => {
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-3';
                
                const styleCard = document.createElement('div');
                styleCard.className = 'card h-100 style-option';
                styleCard.dataset.styleId = style.id;
                
                if (style.id === currentStyle) {
                    styleCard.classList.add('border-primary', 'selected');
                    this.currentSelectedStyle = style.id;
                    // Habilitar botón aplicar
                    const applyBtn = document.getElementById('apply-field-style');
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
            console.error('Error poblando grid de estilos de campos:', error);
            grid.innerHTML = '<div class="col-12"><p class="text-center text-danger">Error cargando estilos de campos</p></div>';
        }
    }

    /**
     * Seleccionar un estilo
     */
    selectStyle(styleId) {
        // Remover selección anterior
        document.querySelectorAll('#field-style-grid .style-option.selected').forEach(el => {
            el.classList.remove('selected', 'border-primary');
            el.classList.add('border-light');
        });

        // Agregar selección nueva
        const selectedOption = document.querySelector(`#field-style-grid [data-style-id="${styleId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected', 'border-primary');
            selectedOption.classList.remove('border-light');
            this.currentSelectedStyle = styleId;
            
            // Habilitar botón aplicar
            const applyButton = document.getElementById('apply-field-style');
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
            const modal = document.getElementById('field-style-modal');
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
            if (e.target.id === 'apply-field-style') {
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
            const success = window.fieldStyleManager.setStyle(this.currentSelectedStyle);
            
            if (success) {
                console.log(`✅ Estilo de campo aplicado: ${this.currentSelectedStyle}`);
                this.hideModal();
                
                // Mostrar notificación
                const styleName = window.fieldStyleManager.getCurrentStyleInfo()?.name || this.currentSelectedStyle;
                this.showNotification(`Estilo "${styleName}" aplicado correctamente`);
            } else {
                alert('Error aplicando el estilo seleccionado');
            }
        } catch (error) {
            console.error('Error aplicando estilo de campo:', error);
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

if (!document.getElementById('field-style-ui-animations')) {
    const style = document.createElement('style');
    style.id = 'field-style-ui-animations';
    style.textContent = notificationStyles;
    document.head.appendChild(style);
}

// Esperar a que fieldStyleManager esté disponible antes de inicializar
function initFieldStyleUI() {
    if (typeof window.fieldStyleManager === 'undefined') {
        console.warn('⚠️ FieldStyleManager no disponible, reintentando...');
        setTimeout(initFieldStyleUI, 100);
        return;
    }
    
    window.fieldStyleUI = new FieldStyleUI();
}

// Inicializar cuando DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFieldStyleUI);
} else {
    setTimeout(initFieldStyleUI, 100);
}

// Exportar para CommonJS si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FieldStyleUI;
}
