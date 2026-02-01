/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🏟️ FIELD STYLE UI - INTERFAZ DE ESTILOS DE CAMPO
 * ═══════════════════════════════════════════════════════════════════════
 */

class FieldStyleUI {
    constructor() {
        this.isVisible = false;
        this.currentSelectedStyle = null;
        this.modal = null;
        this.styleButton = null;
        
        this.init();
    }

    init() {
        this.createStyleButton();
        this.createStyleModal();
        this.setupEventListeners();
        console.log('🏟️ FieldStyleUI inicializada');
    }

    createStyleButton() {
        this.styleButton = document.getElementById('field-styles-btn');
        if (!this.styleButton) {
            console.warn('⚠️ Botón field-styles-btn no encontrado');
            return;
        }
        console.log('✅ Botón de estilos de campo conectado');
    }

    createStyleModal() {
        // Verificar si ya existe
        if (document.getElementById('field-style-modal')) {
            this.modal = document.getElementById('field-style-modal');
            return;
        }

        const modalHtml = `
            <div class="modal fade" id="field-style-modal" tabindex="-1" aria-hidden="true" style="z-index: 10000;">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content bg-dark text-white">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title">
                                <i class="fas fa-palette me-2"></i>Estilos de Campo
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3" id="field-style-grid"></div>
                        </div>
                        <div class="modal-footer border-secondary">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" id="apply-field-style" disabled>
                                <i class="fas fa-check me-1"></i>Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('field-style-modal');
    }

    populateStyleGrid() {
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
                <div class="card bg-secondary text-white style-option ${isSelected ? 'border-success border-2' : ''}" 
                     data-style-id="${style.id}" 
                     style="cursor: pointer; transition: all 0.2s;">
                    <div class="card-body text-center p-3">
                        <div style="font-size: 2rem;">${style.icon || '🏟️'}</div>
                        <h6 class="card-title mt-2 mb-1">${style.name}</h6>
                        <small class="text-muted">${style.description || ''}</small>
                        ${isSelected ? '<div class="mt-2"><span class="badge bg-success">Actual</span></div>' : ''}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Event listeners para selección
        grid.querySelectorAll('.style-option').forEach(option => {
            option.addEventListener('click', () => {
                grid.querySelectorAll('.style-option').forEach(o => {
                    o.classList.remove('border-primary', 'border-2');
                });
                option.classList.add('border-primary', 'border-2');
                this.currentSelectedStyle = option.dataset.styleId;
                document.getElementById('apply-field-style').disabled = false;
            });
        });
    }

    setupEventListeners() {
        // Botón para abrir modal
        if (this.styleButton) {
            this.styleButton.addEventListener('click', () => this.showModal());
        }

        // Botón aplicar
        document.addEventListener('click', (e) => {
            if (e.target.id === 'apply-field-style' || e.target.closest('#apply-field-style')) {
                this.applySelectedStyle();
            }
        });
    }

    showModal() {
        if (!this.modal) {
            this.createStyleModal();
        }
        this.populateStyleGrid();
        const bsModal = new bootstrap.Modal(this.modal);
        bsModal.show();
    }

    hideModal() {
        if (this.modal) {
            const bsModal = bootstrap.Modal.getInstance(this.modal);
            if (bsModal) bsModal.hide();
        }
    }

    applySelectedStyle() {
        if (!this.currentSelectedStyle) return;

        const success = window.fieldStyleManager.setStyle(this.currentSelectedStyle);
        if (success) {
            this.hideModal();
            this.showNotification('Estilo de campo aplicado');
        }
    }

    showNotification(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-success';
        notification.style.zIndex = '99999';
        notification.innerHTML = `<i class="fas fa-check me-2"></i>${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }
}

// Crear instancia global
window.fieldStyleUI = new FieldStyleUI();
