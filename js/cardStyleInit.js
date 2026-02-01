/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🎨 CARD STYLE INIT - Verificación de sistema de estilos
 * ═══════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    function verifyStyleSystem() {
        const status = {
            styleRegistry: !!window.styleRegistry,
            fieldStyleManager: !!window.fieldStyleManager,
            cardStyleManager: !!window.cardStyleManager,
            fieldStyleUI: !!window.fieldStyleUI,
            cardStyleUI: !!window.cardStyleUI
        };

        const allReady = Object.values(status).every(v => v);

        if (allReady) {
            console.log('✅ Sistema de estilos completamente inicializado');
            console.log('   📊 Estilos de campo:', window.styleRegistry.getStats().fieldStyles);
            console.log('   📊 Estilos de cards:', window.styleRegistry.getStats().cardStyles);
            
            // Notificar que todo está listo
            window.dispatchEvent(new CustomEvent('styleSystemReady'));
        } else {
            console.log('⏳ Sistema de estilos parcialmente cargado:', status);
        }
    }

    // Verificar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', verifyStyleSystem);
    } else {
        verifyStyleSystem();
    }

    // También verificar después de window.load
    window.addEventListener('load', verifyStyleSystem);

})();
