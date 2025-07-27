// cardStyleInit.js - Inicialización del sistema de estilos de cards

/**
 * Inicializar el sistema de estilos de cards
 * Este archivo asegura que todo se cargue en el orden correcto
 */
function initCardStyleSystem() {
    console.log('🎨 Inicializando sistema de estilos de cards...');
    
    // Verificar que CardStyleManager esté disponible
    if (typeof window.cardStyleManager === 'undefined') {
        console.warn('⚠️ CardStyleManager no encontrado, cargando...');
        return;
    }
    
    // Verificar que PlayerCardManager esté disponible
    if (typeof window.playerCardManager === 'undefined') {
        console.warn('⚠️ PlayerCardManager no encontrado, esperando...');
        setTimeout(initCardStyleSystem, 100);
        return;
    }
    
    // Verificar que CardStyleUI esté disponible
    if (typeof window.cardStyleUI === 'undefined') {
        console.warn('⚠️ CardStyleUI no encontrado, cargando...');
        return;
    }
    
    // Todo está cargado, proceder con la inicialización
    console.log('✅ Todos los componentes del sistema de estilos están cargados');
    
    // Forzar re-inicialización del PlayerCardManager para detectar el sistema de estilos
    if (window.playerCardManager && typeof window.playerCardManager.initializeStyleManager === 'function') {
        window.playerCardManager.initializeStyleManager();
    }
    
    console.log('🎨 Sistema de estilos de cards inicializado completamente');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCardStyleSystem);
} else {
    // DOM ya está listo
    setTimeout(initCardStyleSystem, 100);
}

// También intentar después de que la ventana esté completamente cargada
window.addEventListener('load', () => {
    setTimeout(initCardStyleSystem, 200);
});
