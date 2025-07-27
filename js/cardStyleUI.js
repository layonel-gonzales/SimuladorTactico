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
        // Buscar si ya existe un contenedor de controles
        let controlsContainer = document.querySelector('.field-controls') || 
                               document.querySelector('.toolbar') ||
                               document.querySelector('.controls-section');
        
        if (!controlsContainer) {
            // Crear contenedor si no existe
            controlsContainer = document.createElement('div');
            controlsContainer.className = 'card-style-controls';
            controlsContainer.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 1000;
                display: flex;
                gap: 10px;
            `;
            document.body.appendChild(controlsContainer);
        }

        // Crear el botón
        const styleButton = document.createElement('button');
        styleButton.id = 'card-style-button';
        styleButton.className = 'card-style-toggle-btn';
        styleButton.innerHTML = `
            <span class="card-style-icon">🎴</span>
            <span class="card-style-text">Estilos Cards</span>
        `;
        styleButton.title = 'Cambiar estilo de las cards de jugador';
        
        // Estilos del botón
        styleButton.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;

        styleButton.addEventListener('mouseenter', () => {
            styleButton.style.transform = 'translateY(-2px)';
            styleButton.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        });

        styleButton.addEventListener('mouseleave', () => {
            styleButton.style.transform = 'translateY(0)';
            styleButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        });

        controlsContainer.appendChild(styleButton);
        this.styleButton = styleButton;
    }

    /**
     * Crear modal de selección de estilos
     */
    createStyleModal() {
        const modal = document.createElement('div');
        modal.id = 'card-style-modal';
        modal.className = 'card-style-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        `;

        const modalContent = document.createElement('div');
        modalContent.className = 'card-style-modal-content';
        modalContent.style.cssText = `
            background: white;
            border-radius: 16px;
            padding: 24px;
            max-width: 900px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: modalSlideIn 0.3s ease;
        `;

        modalContent.innerHTML = `
            <div class="card-style-header">
                <h2 class="card-style-title">
                    <span class="title-icon">🎨</span>
                    Estilos de Cards de Jugador
                </h2>
                <button class="card-style-close" title="Cerrar">✕</button>
            </div>
            <p class="card-style-description">
                Selecciona el estilo visual para las cards de jugador en el campo y selección.
            </p>
            <div class="card-style-grid" id="card-style-grid">
                <!-- Se llenará dinámicamente -->
            </div>
            <div class="card-style-actions">
                <button class="card-style-apply" id="apply-style">Aplicar Estilo</button>
                <button class="card-style-cancel" id="cancel-style">Cancelar</button>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        this.modal = modal;
        this.modalContent = modalContent;
        
        // Agregar estilos CSS
        this.addModalStyles();
        
        // Poblar el grid con estilos disponibles
        this.populateStyleGrid();
    }

    /**
     * Agregar estilos CSS para el modal
     */
    addModalStyles() {
        const styles = `
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            .card-style-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                padding-bottom: 16px;
                border-bottom: 2px solid #f0f0f0;
            }

            .card-style-title {
                margin: 0;
                color: #333;
                font-size: 24px;
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .title-icon {
                font-size: 28px;
            }

            .card-style-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .card-style-close:hover {
                background: #f0f0f0;
                color: #333;
            }

            .card-style-description {
                color: #666;
                margin-bottom: 24px;
                font-size: 14px;
                line-height: 1.5;
            }

            .card-style-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 24px;
            }

            .style-option {
                border: 3px solid #e0e0e0;
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                background: #fafafa;
                position: relative;
                overflow: hidden;
            }

            .style-option:hover {
                border-color: #667eea;
                transform: translateY(-4px);
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
            }

            .style-option.selected {
                border-color: #667eea;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .style-option.selected .style-icon {
                background: rgba(255,255,255,0.2);
            }

            .style-icon {
                font-size: 32px;
                display: block;
                text-align: center;
                margin-bottom: 12px;
                padding: 12px;
                background: #f0f0f0;
                border-radius: 8px;
                transition: all 0.3s ease;
            }

            .style-name {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 6px;
                text-align: center;
            }

            .style-description {
                font-size: 12px;
                opacity: 0.8;
                text-align: center;
                line-height: 1.4;
            }

            .style-preview {
                margin-top: 12px;
                padding: 8px;
                background: rgba(0,0,0,0.05);
                border-radius: 6px;
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                color: #666;
            }

            .card-style-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                padding-top: 16px;
                border-top: 2px solid #f0f0f0;
            }

            .card-style-apply,
            .card-style-cancel {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
            }

            .card-style-apply {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .card-style-apply:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }

            .card-style-apply:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .card-style-cancel {
                background: #f0f0f0;
                color: #666;
            }

            .card-style-cancel:hover {
                background: #e0e0e0;
                color: #333;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .card-style-modal-content {
                    width: 95%;
                    padding: 16px;
                }

                .card-style-grid {
                    grid-template-columns: 1fr;
                    gap: 16px;
                }

                .card-style-title {
                    font-size: 20px;
                }

                .style-icon {
                    font-size: 24px;
                    padding: 8px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
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
                const styleOption = document.createElement('div');
                styleOption.className = 'style-option';
                styleOption.dataset.styleId = style.id;
                
                if (style.id === currentStyle.id) {
                    styleOption.classList.add('selected');
                    this.currentSelectedStyle = style.id;
                }

                styleOption.innerHTML = `
                    <span class="style-icon">${style.icon}</span>
                    <div class="style-name">${style.name}</div>
                    <div class="style-description">${style.description}</div>
                    <div class="style-preview">
                        Vista previa disponible al seleccionar
                    </div>
                `;

                styleOption.addEventListener('click', () => {
                    this.selectStyle(style.id);
                });

                grid.appendChild(styleOption);
            });

        } catch (error) {
            console.error('Error poblando grid de estilos:', error);
            grid.innerHTML = '<p>Error cargando estilos de cards</p>';
        }
    }

    /**
     * Seleccionar un estilo
     */
    selectStyle(styleId) {
        // Remover selección anterior
        document.querySelectorAll('.style-option.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Agregar selección nueva
        const selectedOption = document.querySelector(`[data-style-id="${styleId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
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

        // Event listeners del modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('card-style-close') || 
                e.target.id === 'cancel-style') {
                this.hideModal();
            }
            
            if (e.target.id === 'apply-style') {
                this.applySelectedStyle();
            }

            // Cerrar al hacer clic fuera del modal
            if (e.target.id === 'card-style-modal') {
                this.hideModal();
            }
        });

        // Escape para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hideModal();
            }
        });
    }

    /**
     * Mostrar modal
     */
    showModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            this.isVisible = true;
            
            // Actualizar grid por si hay cambios
            this.populateStyleGrid();
            
            // Focus en el modal para accesibilidad
            this.modal.focus();
        }
    }

    /**
     * Ocultar modal
     */
    hideModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
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
