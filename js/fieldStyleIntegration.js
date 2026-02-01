/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🔗 FIELD STYLE INTEGRATION - Integración con configuración
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Conecta el sistema de estilos de campo con otras partes del sistema.
 * 
 * ═══════════════════════════════════════════════════════════════════════
 */

class FieldStyleIntegration {
    constructor() {
        console.log('🔗 FieldStyleIntegration inicializado');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Escuchar cambios de estilo de campo
        document.addEventListener('fieldStyleChanged', (e) => {
            console.log(`🎨 Estilo de campo cambiado a: ${e.detail.styleName}`);
            this.onFieldStyleChanged(e.detail);
        });

        // Escuchar cuando el campo necesita redibujarse (resize, etc.)
        window.addEventListener('resize', () => {
            if (window.fieldStyleManager) {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    window.fieldStyleManager.redrawField();
                }, 100);
            }
        });
    }

    onFieldStyleChanged(detail) {
        // Disparar evento para otros sistemas que necesiten saberlo
        if (window.playerCardManager) {
            // Las cards no necesitan actualizarse cuando cambia el campo
            // pero podemos notificar si es necesario
        }
    }

    /**
     * Forzar redibujado del campo
     */
    forceRedraw() {
        if (window.fieldStyleManager) {
            window.fieldStyleManager.redrawField();
        }
    }

    /**
     * Obtener información del sistema de estilos para debug
     */
    getSystemInfo() {
        return {
            fieldStyle: window.fieldStyleManager?.getCurrentStyle(),
            fieldStyleManager: !!window.fieldStyleManager,
            cardStyleManager: !!window.cardStyleManager,
            styleRegistry: !!window.styleRegistry,
            registeredFieldStyles: window.styleRegistry?.getStats().fieldStyles || 0,
            registeredCardStyles: window.styleRegistry?.getStats().cardStyles || 0
        };
    }
}

// Crear instancia global
window.fieldStyleIntegration = new FieldStyleIntegration();
