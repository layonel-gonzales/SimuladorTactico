// fieldStyleIntegration.js - Integración del sistema de estilos de cancha con la configuración
export default class FieldStyleIntegration {
    constructor() {
        this.fieldStyleManager = null;
        this.configurationUI = null;
        
        console.log('🎨 FieldStyleIntegration inicializado');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.waitForDependencies();
    }

    waitForDependencies() {
        const checkDependencies = () => {
            if (window.fieldStyleManager && window.configurationUI) {
                this.fieldStyleManager = window.fieldStyleManager;
                this.configurationUI = window.configurationUI;
                this.setupFieldStyleConfiguration();
                console.log('✅ FieldStyleIntegration configurado correctamente');
            } else {
                setTimeout(checkDependencies, 100);
            }
        };
        checkDependencies();
    }

    setupFieldStyleConfiguration() {
        // Agregar el botón de configuración de campo en el menú principal
        this.addFieldStyleButton();
        
        // Integrar con el modal de configuración existente si existe
        this.integrateWithConfigurationModal();
        
        // Agregar event listeners para cambios de estilo
        this.setupFieldStyleEvents();
    }

    addFieldStyleButton() {
        // Buscar el menú principal donde agregar el botón
        const mainMenu = document.querySelector('.menu-container') || 
                        document.querySelector('.toolbar') || 
                        document.querySelector('.top-menu');

        if (!mainMenu) {
            console.warn('⚠️ No se encontró menú principal para agregar botón de estilos');
            return;
        }

        // Crear botón de estilos de cancha
        const fieldStyleButton = document.createElement('button');
        fieldStyleButton.id = 'field-style-btn';
        fieldStyleButton.className = 'btn btn-outline-primary btn-sm me-2';
        fieldStyleButton.innerHTML = `
            <i class="fas fa-palette me-1"></i>
            <span class="d-none d-md-inline">Estilos de Cancha</span>
        `;
        fieldStyleButton.title = 'Cambiar estilo visual de la cancha';
        
        fieldStyleButton.addEventListener('click', () => this.openFieldStyleModal());
        
        // Agregar al menú
        mainMenu.appendChild(fieldStyleButton);
        
        console.log('✅ Botón de estilos de cancha agregado al menú');
    }

    integrateWithConfigurationModal() {
        // Verificar si existe el modal de configuración del index.html
        const configModal = document.getElementById('configuration-modal');
        if (configModal) {
            this.setupExistingModalIntegration();
        } else {
            // Si no existe, agregar listener para cuando se cree
            this.setupModalCreationListener();
        }
    }

    setupExistingModalIntegration() {
        const fieldStyleSelect = document.getElementById('field-style-select');
        const previewCanvas = document.getElementById('field-preview-canvas');
        
        if (fieldStyleSelect && previewCanvas) {
            this.populateFieldStyleSelect(fieldStyleSelect);
            this.setupFieldStylePreview(previewCanvas);
            this.setupFieldStyleSelectEvents(fieldStyleSelect, previewCanvas);
            console.log('✅ Integración con modal existente completada');
        }
    }

    setupModalCreationListener() {
        // Observer para detectar cuando se cree el modal
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const configModal = node.querySelector('#configuration-modal') || 
                                          (node.id === 'configuration-modal' ? node : null);
                        if (configModal) {
                            setTimeout(() => this.setupExistingModalIntegration(), 100);
                            observer.disconnect();
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    populateFieldStyleSelect(selectElement) {
        if (!this.fieldStyleManager) return;

        selectElement.innerHTML = '';
        
        const styles = this.fieldStyleManager.getAvailableStyles();
        styles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.id;
            option.textContent = `${style.icon} ${style.name}`;
            option.title = style.description;
            selectElement.appendChild(option);
        });

        // Establecer el estilo actual
        const currentStyle = this.fieldStyleManager.getCurrentStyle();
        selectElement.value = currentStyle;
        
        console.log(`✅ Select de estilos poblado con ${styles.length} opciones`);
    }

    setupFieldStylePreview(previewCanvas) {
        if (!this.fieldStyleManager) return;

        // Configurar canvas de preview
        previewCanvas.width = 200;
        previewCanvas.height = 120;
        previewCanvas.style.width = '200px';
        previewCanvas.style.height = '120px';
        previewCanvas.style.border = '1px solid var(--bs-border-color)';
        previewCanvas.style.borderRadius = '4px';

        // Mostrar preview del estilo actual
        const currentStyle = this.fieldStyleManager.getCurrentStyle();
        this.updateFieldPreview(previewCanvas, currentStyle);
    }

    setupFieldStyleSelectEvents(selectElement, previewCanvas) {
        selectElement.addEventListener('change', (e) => {
            const selectedStyle = e.target.value;
            
            // Actualizar preview
            this.updateFieldPreview(previewCanvas, selectedStyle);
            
            // Aplicar estilo al campo principal
            this.fieldStyleManager.setStyle(selectedStyle);
            
            console.log(`🎨 Estilo de cancha cambiado a: ${selectedStyle}`);
        });
    }

    updateFieldPreview(previewCanvas, styleId) {
        if (!this.fieldStyleManager) return;

        const ctx = previewCanvas.getContext('2d');
        if (!ctx) return;

        try {
            this.fieldStyleManager.previewStyle(styleId, previewCanvas, ctx);
        } catch (error) {
            console.warn('⚠️ Error en preview del campo:', error);
            
            // Fallback: mostrar texto simple
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
            ctx.fillStyle = '#6c757d';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Preview no disponible', previewCanvas.width / 2, previewCanvas.height / 2);
        }
    }

    openFieldStyleModal() {
        // Crear modal dedicado para estilos de cancha
        this.createFieldStyleModal();
    }

    createFieldStyleModal() {
        // Eliminar modal existente si existe
        const existingModal = document.getElementById('field-style-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHtml = `
            <div class="modal fade" id="field-style-modal" tabindex="-1" aria-labelledby="fieldStyleModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="fieldStyleModalLabel">
                                <i class="fas fa-palette me-2"></i>Estilos de Cancha
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label for="field-style-modal-select" class="form-label">
                                        <i class="fas fa-brush me-1"></i>Seleccionar Estilo
                                    </label>
                                    <select class="form-select" id="field-style-modal-select">
                                        <!-- Opciones se llenarán dinámicamente -->
                                    </select>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">
                                        <i class="fas fa-eye me-1"></i>Vista Previa
                                    </label>
                                    <div class="text-center">
                                        <canvas id="field-style-modal-preview" class="border rounded"></canvas>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="alert alert-info">
                                        <i class="fas fa-info-circle me-2"></i>
                                        <strong>Tip:</strong> Los cambios se aplican inmediatamente al campo principal.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i>Cerrar
                            </button>
                            <button type="button" class="btn btn-primary" id="apply-field-style-btn">
                                <i class="fas fa-check me-1"></i>Aplicar Estilo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Configurar el modal recién creado
        this.setupFieldStyleModal();
    }

    setupFieldStyleModal() {
        const modal = document.getElementById('field-style-modal');
        const selectElement = document.getElementById('field-style-modal-select');
        const previewCanvas = document.getElementById('field-style-modal-preview');
        const applyBtn = document.getElementById('apply-field-style-btn');

        if (!modal || !selectElement || !previewCanvas) return;

        // Poblar select y configurar preview
        this.populateFieldStyleSelect(selectElement);
        this.setupFieldStylePreview(previewCanvas);
        this.setupFieldStyleSelectEvents(selectElement, previewCanvas);

        // Event listener para aplicar estilo
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const selectedStyle = selectElement.value;
                this.fieldStyleManager.setStyle(selectedStyle);
                
                // Cerrar modal
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
                
                this.showNotification(`✅ Estilo "${selectedStyle}" aplicado correctamente`);
            });
        }

        // Mostrar modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        console.log('🎨 Modal de estilos de cancha mostrado');
    }

    setupFieldStyleEvents() {
        // Escuchar cambios de estilo desde el fieldStyleManager
        document.addEventListener('fieldStyleChanged', (e) => {
            const { styleId, styleName } = e.detail;
            console.log(`🎨 Estilo de cancha cambiado: ${styleName} (${styleId})`);
            
            // Actualizar cualquier UI que muestre el estilo actual
            this.updateStyleIndicators(styleId);
        });

        // Escuchar cuando se carguen los estilos
        document.addEventListener('fieldStylesLoaded', (e) => {
            const { styles } = e.detail;
            console.log(`🎨 ${styles.length} estilos de cancha cargados`);
        });
    }

    updateStyleIndicators(styleId) {
        // Actualizar todos los selects de estilo que puedan existir
        const styleSelects = document.querySelectorAll('#field-style-select, #field-style-modal-select');
        styleSelects.forEach(select => {
            if (select.value !== styleId) {
                select.value = styleId;
            }
        });

        // Actualizar el botón principal si tiene indicador de estilo actual
        const fieldStyleBtn = document.getElementById('field-style-btn');
        if (fieldStyleBtn && this.fieldStyleManager) {
            const styles = this.fieldStyleManager.getAvailableStyles();
            const currentStyle = styles.find(s => s.id === styleId);
            if (currentStyle) {
                fieldStyleBtn.title = `Estilos de Cancha - Actual: ${currentStyle.name}`;
            }
        }
    }

    showNotification(message, type = 'success') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed`;
        notification.style.cssText = `
            top: 20px; 
            right: 20px; 
            z-index: 9999; 
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Método para integración manual si es necesario
    manualIntegration() {
        if (!this.fieldStyleManager) {
            console.warn('⚠️ FieldStyleManager no disponible para integración manual');
            return;
        }

        // Crear contenedor de configuración de estilos si no existe
        const existingContainer = document.getElementById('field-style-configuration');
        if (existingContainer) return;

        const configContainer = document.createElement('div');
        configContainer.id = 'field-style-configuration';
        configContainer.className = 'field-style-config p-3 mb-3 border rounded';
        configContainer.innerHTML = `
            <h6><i class="fas fa-palette me-2"></i>Estilo de Cancha</h6>
            <div class="row g-2">
                <div class="col-md-8">
                    <select class="form-select form-select-sm" id="field-style-quick-select">
                        <!-- Opciones dinámicas -->
                    </select>
                </div>
                <div class="col-md-4">
                    <button class="btn btn-outline-primary btn-sm w-100" id="field-style-preview-btn">
                        <i class="fas fa-eye me-1"></i>Preview
                    </button>
                </div>
            </div>
        `;

        // Buscar dónde insertar la configuración
        const configSection = document.querySelector('.configuration-section') ||
                              document.querySelector('.settings-panel') ||
                              document.querySelector('.controls-container');

        if (configSection) {
            configSection.appendChild(configContainer);
            
            // Configurar eventos
            const quickSelect = document.getElementById('field-style-quick-select');
            const previewBtn = document.getElementById('field-style-preview-btn');
            
            if (quickSelect) {
                this.populateFieldStyleSelect(quickSelect);
                quickSelect.addEventListener('change', (e) => {
                    this.fieldStyleManager.setStyle(e.target.value);
                });
            }
            
            if (previewBtn) {
                previewBtn.addEventListener('click', () => {
                    this.openFieldStyleModal();
                });
            }
            
            console.log('✅ Configuración manual de estilos integrada');
        }
    }
}

// Crear instancia global
window.fieldStyleIntegration = new FieldStyleIntegration();
