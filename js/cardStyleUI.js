/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🎴 CARD STYLE UI - STUB (Funcionalidad movida a stylesSelectorUI.js)
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * DEPRECATED: Este archivo ahora es solo un stub para compatibilidad.
 * Todas las funciones se han consolidado en stylesSelectorUI.js
 */

class CardStyleUI {
    constructor() {
        console.warn('⚠️ CardStyleUI deprecated - usar stylesSelectorUI en su lugar');
        this.isVisible = false;
        this.currentSelectedStyle = null;
        this.modal = null;
        this.styleButton = null;
        this.initialized = false;
    }

    init() {}
    createStyleButton() {}
    createStyleModal() {}
    populateStyleGrid() {}
    selectStyle(styleId) {}
    setupEventListeners() {}
    showModal() { if (window.stylesSelectorUI) window.stylesSelectorUI.openModal('card'); }
    hideModal() {}
    applySelectedStyle() {}
    showNotification(message, type = 'success') {}
}

// Crear instancia global para compatibilidad
window.cardStyleUI = new CardStyleUI();
