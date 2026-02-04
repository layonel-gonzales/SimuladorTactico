/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🏟️ FIELD STYLE UI - STUB (Funcionalidad movida a stylesSelectorUI.js)
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * DEPRECATED: Este archivo ahora es solo un stub para compatibilidad.
 * Todas las funciones se han consolidado en stylesSelectorUI.js
 */

class FieldStyleUI {
    constructor() {
        this.isVisible = false;
        this.currentSelectedStyle = null;
        this.modal = null;
        this.styleButton = null;
    }

    init() {}
    createStyleButton() {}
    createStyleModal() {}
    populateStyleGrid() {}
    setupEventListeners() {}
    showModal() { if (window.stylesSelectorUI) window.stylesSelectorUI.openModal('field'); }
    hideModal() {}
    applySelectedStyle() {}
    showNotification(message) {}
}

// Crear instancia global para compatibilidad
window.fieldStyleUI = new FieldStyleUI();
