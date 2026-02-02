/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🎴 CARD STYLE UI - INTERFAZ DE ESTILOS DE CARDS
 * ═══════════════════════════════════════════════════════════════════════
 */

class CardStyleUI {
    constructor() {
        this.isVisible = false;
        this.currentSelectedStyle = null;
        this.modal = null;
        this.styleButton = null;
        this.initialized = false;
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.initialized) return;
        
        this.createStyleButton();
        this.createStyleModal();
        this.setupEventListeners();
        this.initialized = true;
    }

    createStyleButton() {
        this.styleButton = document.getElementById('card-style-button');
        if (!this.styleButton) {
            console.warn('⚠️ Botón card-style-button no encontrado en el DOM');
            return;
        }
    }

    createStyleModal() {
        // Verificar si ya existe
        if (document.getElementById('card-style-modal')) {
            this.modal = document.getElementById('card-style-modal');
            return;
        }

        const modalHtml = `
            <div class="modal fade" id="card-style-modal" tabindex="-1" aria-hidden="true" style="z-index: 10050;">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content bg-dark text-white">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title">
                                <i class="fas fa-credit-card me-2"></i>Estilos de Cards de Jugador
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p class="text-muted mb-3">Selecciona el estilo visual para las tarjetas de jugadores.</p>
                            <div class="row g-3" id="card-style-grid">
                                <div class="col-12 text-center text-muted">
                                    <i class="fas fa-spinner fa-spin"></i> Cargando estilos...
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer border-secondary">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" id="apply-card-style" disabled>
                                <i class="fas fa-check me-1"></i>Aplicar Estilo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('card-style-modal');
    }

    populateStyleGrid() {
        const grid = document.getElementById('card-style-grid');
        if (!grid) {
            console.error('❌ Grid de estilos no encontrado');
            return;
        }

        // Verificar cardStyleManager
        if (!window.cardStyleManager) {
            console.warn('⚠️ cardStyleManager no disponible');
            grid.innerHTML = '<div class="col-12 text-center text-warning">Sistema de estilos no disponible</div>';
            return;
        }

        const styles = window.cardStyleManager.getAvailableStyles();
        const currentStyle = window.cardStyleManager.getCurrentStyle();

        if (styles.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center text-warning">No hay estilos registrados</div>';
            return;
        }

        grid.innerHTML = '';

        styles.forEach(style => {
            const isSelected = style.id === currentStyle;
            const card = document.createElement('div');
            card.className = 'col-6 col-md-3';
            card.innerHTML = `
                <div class="card bg-secondary text-white style-option h-100 ${isSelected ? 'border-success border-3' : 'border-dark'}" 
                     data-style-id="${style.id}" 
                     style="cursor: pointer; transition: all 0.2s;">
                    <div class="card-body text-center p-3">
                        <div style="font-size: 2.5rem;">${style.icon || '🎴'}</div>
                        <h6 class="card-title mt-2 mb-1">${style.name}</h6>
                        <small class="text-light opacity-75">${style.description || ''}</small>
                        ${isSelected ? '<div class="mt-2"><span class="badge bg-success"><i class="fas fa-check me-1"></i>Actual</span></div>' : ''}
                    </div>
                </div>
            `;
            grid.appendChild(card);

            // Event listener directo para cada opción
            card.querySelector('.style-option').addEventListener('click', (e) => {
                this.selectStyle(e.currentTarget.dataset.styleId);
            });
        });
    }

    selectStyle(styleId) {
        const grid = document.getElementById('card-style-grid');
        if (!grid) return;

        // Quitar selección anterior
        grid.querySelectorAll('.style-option').forEach(o => {
            o.classList.remove('border-primary', 'border-3');
            o.classList.add('border-dark');
        });

        // Marcar nuevo seleccionado
        const selected = grid.querySelector(`[data-style-id="${styleId}"]`);
        if (selected) {
            selected.classList.remove('border-dark');
            selected.classList.add('border-primary', 'border-3');
        }

        this.currentSelectedStyle = styleId;
        
        const applyBtn = document.getElementById('apply-card-style');
        if (applyBtn) {
            applyBtn.disabled = false;
        }
        
    }

    setupEventListeners() {
        // Botón para abrir modal - usando event delegation por si el botón se carga tarde
        document.addEventListener('click', (e) => {
            // Botón de abrir modal
            if (e.target.id === 'card-style-button' || e.target.closest('#card-style-button')) {
                e.preventDefault();
                e.stopPropagation();
                this.showModal();
            }
            
            // Botón de aplicar estilo
            if (e.target.id === 'apply-card-style' || e.target.closest('#apply-card-style')) {
                e.preventDefault();
                this.applySelectedStyle();
            }
        });
    }

    showModal() {
        
        if (!this.modal) {
            this.createStyleModal();
        }
        
        // Poblar grid antes de mostrar
        this.populateStyleGrid();
        
        // Resetear selección
        this.currentSelectedStyle = null;
        const applyBtn = document.getElementById('apply-card-style');
        if (applyBtn) applyBtn.disabled = true;
        
        try {
            const bsModal = new bootstrap.Modal(this.modal);
            bsModal.show();
        } catch (error) {
            console.error('❌ Error mostrando modal:', error);
        }
    }

    hideModal() {
        if (this.modal) {
            try {
                const bsModal = bootstrap.Modal.getInstance(this.modal);
                if (bsModal) bsModal.hide();
            } catch (error) {
                console.warn('Error cerrando modal:', error);
            }
        }
    }

    applySelectedStyle() {
        if (!this.currentSelectedStyle) {
            console.warn('No hay estilo seleccionado');
            return;
        }

        if (!window.cardStyleManager) {
            console.error('cardStyleManager no disponible');
            return;
        }

        const success = window.cardStyleManager.setCurrentStyle(this.currentSelectedStyle);
        
        if (success) {
            this.hideModal();
            this.showNotification('Estilo de cards aplicado correctamente');
            
            // Re-renderizar jugadores si es posible
            if (window.uiManager && typeof window.uiManager.renderPlayersOnPitch === 'function') {
                setTimeout(() => {
                    window.uiManager.renderPlayersOnPitch();
                }, 100);
            }
        } else {
            this.showNotification('Error aplicando el estilo', 'danger');
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

// Crear instancia global cuando el script carga
window.cardStyleUI = new CardStyleUI();
