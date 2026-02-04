/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🎨 STYLES SELECTOR UI - INTERFAZ CONSOLIDADA DE ESTILOS
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Gestiona un único modal fullscreen para seleccionar tanto:
 * - Estilos de Campo (field styles)
 * - Estilos de Cards (card styles)
 * 
 * Reemplaza fieldStyleUI.js y cardStyleUI.js
 */

class StylesSelectorUI {
    constructor() {
        this.modal = null;
        this.initialized = false;
        this.currentFieldStyle = null;
        this.currentCardStyle = null;
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.initialized) return;
        
        this.createConsolidatedModal();
        this.setupEventListeners();
        this.initialized = true;
        
        console.log('✅ StylesSelectorUI inicializado');
    }

    createConsolidatedModal() {
        // Verificar si ya existe
        if (document.getElementById('styles-selector-modal')) {
            this.modal = document.getElementById('styles-selector-modal');
            return;
        }

        const modalHtml = `
            <div class="modal fade" id="styles-selector-modal" tabindex="-1" aria-hidden="true" style="z-index: 10050;">
                <div class="modal-dialog modal-fullscreen modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-palette me-2"></i>Seleccionar Estilos
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Tabs de navegación -->
                            <ul class="nav nav-tabs mb-4" id="stylesTabs" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="field-style-tab" data-bs-toggle="tab" data-bs-target="#field-style-content" type="button" role="tab">
                                        <i class="fas fa-futbol me-2"></i>Estilos de Campo
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="card-style-tab" data-bs-toggle="tab" data-bs-target="#card-style-content" type="button" role="tab">
                                        <i class="fas fa-credit-card me-2"></i>Estilos de Cards
                                    </button>
                                </li>
                            </ul>

                            <!-- Contenido de tabs -->
                            <div class="tab-content" id="stylesTabContent">
                                <!-- Tab 1: Estilos de Campo -->
                                <div class="tab-pane fade show active" id="field-style-content" role="tabpanel">
                                    <div class="row g-3" id="field-style-grid">
                                        <div class="col-12 text-center text-muted">
                                            <i class="fas fa-spinner fa-spin"></i> Cargando estilos...
                                        </div>
                                    </div>
                                </div>

                                <!-- Tab 2: Estilos de Cards -->
                                <div class="tab-pane fade" id="card-style-content" role="tabpanel">
                                    <div class="row g-3" id="card-style-grid">
                                        <div class="col-12 text-center text-muted">
                                            <i class="fas fa-spinner fa-spin"></i> Cargando estilos...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('styles-selector-modal');
    }

    setupEventListeners() {
        // Botón consolidado en el menú
        document.addEventListener('click', (e) => {
            if (e.target.id === 'styles-selector-btn' || e.target.closest('#styles-selector-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.openModal('field');
            }
        });

        // Cuando el modal se muestre, poblar los grids
        if (this.modal) {
            this.modal.addEventListener('show.bs.modal', () => {
                this.populateFieldStyleGrid();
                this.populateCardStyleGrid();
            });
        }

        // Selección de estilos de campo
        document.addEventListener('click', (e) => {
            if (e.target.closest('.field-style-option')) {
                const option = e.target.closest('.field-style-option');
                document.querySelectorAll('.field-style-option').forEach(o => {
                    o.classList.remove('border-primary', 'border-2');
                });
                option.classList.add('border-primary', 'border-2');
                this.currentFieldStyle = option.dataset.styleId;
                this.applyFieldStyle();
            }
        });

        // Selección de estilos de card
        document.addEventListener('click', (e) => {
            if (e.target.closest('.card-style-option')) {
                const option = e.target.closest('.card-style-option');
                document.querySelectorAll('.card-style-option').forEach(o => {
                    o.classList.remove('border-success', 'border-2');
                });
                option.classList.add('border-success', 'border-2');
                this.currentCardStyle = option.dataset.styleId;
                this.applyCardStyle();
            }
        });
    }

    openModal(tab = 'field') {
        if (!this.modal) {
            this.createConsolidatedModal();
        }
        
        const bsModal = new bootstrap.Modal(this.modal);
        bsModal.show();
        
        // Cambiar a la pestaña especificada
        if (tab === 'card') {
            const cardTab = document.getElementById('card-style-tab');
            if (cardTab) {
                const tab = new bootstrap.Tab(cardTab);
                tab.show();
            }
        }
    }

    populateFieldStyleGrid() {
        const grid = document.getElementById('field-style-grid');
        if (!grid || !window.fieldStyleManager) return;

        const styles = window.fieldStyleManager.getAvailableStyles();
        const currentStyle = window.fieldStyleManager.getCurrentStyle();

        grid.innerHTML = '';

        styles.forEach(style => {
            const isSelected = style.id === currentStyle;
            const card = document.createElement('div');
            card.className = 'col-6 col-md-3';
            card.innerHTML = `
                <div class="card field-style-option ${isSelected ? 'border-primary border-2' : 'border-secondary'}" 
                     data-style-id="${style.id}" 
                     style="cursor: pointer; transition: all 0.2s; height: 100%;">
                    <div class="card-body text-center p-3 d-flex flex-column justify-content-center">
                        <div style="font-size: 2.5rem;">${style.icon || '🏟️'}</div>
                        <h6 class="card-title mt-3 mb-1">${style.name}</h6>
                        <small class="text-muted">${style.description || ''}</small>
                        ${isSelected ? '<div class="mt-2"><span class="badge bg-primary">Actual</span></div>' : ''}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    populateCardStyleGrid() {
        const grid = document.getElementById('card-style-grid');
        if (!grid || !window.cardStyleManager) return;

        const styles = window.cardStyleManager.getAvailableStyles();
        const currentStyle = window.cardStyleManager.getCurrentStyle();

        grid.innerHTML = '';

        styles.forEach(style => {
            const isSelected = style.id === currentStyle;
            const card = document.createElement('div');
            card.className = 'col-6 col-md-3';
            card.innerHTML = `
                <div class="card card-style-option ${isSelected ? 'border-success border-2' : 'border-secondary'}" 
                     data-style-id="${style.id}" 
                     style="cursor: pointer; transition: all 0.2s; height: 100%;">
                    <div class="card-body text-center p-3 d-flex flex-column justify-content-center">
                        <div style="font-size: 2.5rem;">${style.icon || '🎴'}</div>
                        <h6 class="card-title mt-3 mb-1">${style.name}</h6>
                        <small class="text-muted">${style.description || ''}</small>
                        ${isSelected ? '<div class="mt-2"><span class="badge bg-success">Actual</span></div>' : ''}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    applyFieldStyle() {
        if (!this.currentFieldStyle || !window.fieldStyleManager) return;

        const success = window.fieldStyleManager.setStyle(this.currentFieldStyle);
        if (success) {
            this.showNotification('Estilo de campo aplicado', 'success');
            this.populateFieldStyleGrid(); // Actualizar para mostrar badge "Actual"
        } else {
            this.showNotification('Error al aplicar estilo', 'danger');
        }
    }

    applyCardStyle() {
        if (!this.currentCardStyle || !window.cardStyleManager) return;

        const success = window.cardStyleManager.setCurrentStyle(this.currentCardStyle);
        if (success) {
            this.showNotification('Estilo de cards aplicado', 'success');
            this.populateCardStyleGrid(); // Actualizar para mostrar badge "Actual"
        } else {
            this.showNotification('Error al aplicar estilo', 'danger');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-${type}`;
        notification.style.zIndex = '99999';
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'} me-2"></i>${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Crear instancia global
window.stylesSelectorUI = new StylesSelectorUI();
