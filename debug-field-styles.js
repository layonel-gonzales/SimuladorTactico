// debug-field-styles.js - Script de debug para verificar carga del sistema de estilos
console.log('🔍 DEBUG: Iniciando verificación del sistema de estilos...');

// Función para verificar carga de módulos
function checkModuleAvailability() {
    const checks = {
        'FieldStyleManager': !!window.fieldStyleManager,
        'FieldStyleIntegration': !!window.fieldStyleIntegration,
        'ConfigurationUI': !!window.configurationUI,
        'Modal existe': !!document.getElementById('configuration-modal'),
        'Botón configuración existe': !!document.getElementById('configuration-btn'),
        'Select estilos existe': !!document.getElementById('field-style-select'),
        'Canvas preview existe': !!document.getElementById('field-preview-canvas')
    };

    console.table(checks);
    
    // Verificar si el select tiene opciones
    const fieldStyleSelect = document.getElementById('field-style-select');
    if (fieldStyleSelect) {
        console.log('📝 Opciones en field-style-select:', fieldStyleSelect.options.length);
        Array.from(fieldStyleSelect.options).forEach((option, index) => {
            console.log(`  ${index}: ${option.value} - ${option.text}`);
        });
    }

    // Verificar estilos disponibles en fieldStyleManager
    if (window.fieldStyleManager) {
        try {
            const styles = window.fieldStyleManager.getAvailableStyles();
            console.log('🎨 Estilos disponibles en manager:', styles.length);
            styles.forEach(style => {
                console.log(`  ${style.id}: ${style.name} (${style.description})`);
            });
        } catch (error) {
            console.error('❌ Error obteniendo estilos:', error);
        }
    }

    return checks;
}

// Función para forzar poblado del select
function forcePopulateSelect() {
    console.log('🔧 Intentando poblar select manualmente...');
    
    const fieldStyleSelect = document.getElementById('field-style-select');
    if (!fieldStyleSelect) {
        console.error('❌ Select no encontrado');
        return false;
    }

    if (!window.fieldStyleManager) {
        console.error('❌ FieldStyleManager no disponible');
        return false;
    }

    try {
        fieldStyleSelect.innerHTML = '';
        
        const styles = window.fieldStyleManager.getAvailableStyles();
        styles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.id;
            option.textContent = `${style.icon} ${style.name}`;
            option.title = style.description;
            fieldStyleSelect.appendChild(option);
        });

        console.log('✅ Select poblado con', styles.length, 'opciones');
        return true;
    } catch (error) {
        console.error('❌ Error poblando select:', error);
        return false;
    }
}

// Función para forzar integración
function forceIntegration() {
    console.log('🔧 Forzando integración del sistema...');
    
    // Intentar poblar select
    const populated = forcePopulateSelect();
    
    if (populated) {
        // Configurar eventos
        const fieldStyleSelect = document.getElementById('field-style-select');
        const previewCanvas = document.getElementById('field-preview-canvas');
        
        if (fieldStyleSelect && previewCanvas) {
            fieldStyleSelect.addEventListener('change', (e) => {
                const styleId = e.target.value;
                console.log('🎨 Cambiando estilo a:', styleId);
                
                if (window.fieldStyleManager) {
                    window.fieldStyleManager.setStyle(styleId);
                    
                    // Actualizar preview
                    const ctx = previewCanvas.getContext('2d');
                    if (ctx) {
                        window.fieldStyleManager.previewStyle(styleId, previewCanvas, ctx);
                    }
                }
            });
            
            // Configurar preview inicial
            const ctx = previewCanvas.getContext('2d');
            if (ctx && window.fieldStyleManager) {
                const currentStyle = window.fieldStyleManager.getCurrentStyle();
                window.fieldStyleManager.previewStyle(currentStyle, previewCanvas, ctx);
            }
            
            console.log('✅ Eventos configurados correctamente');
        }
    }
}

// Función para abrir modal de configuración
function openConfigModal() {
    const modal = document.getElementById('configuration-modal');
    if (modal) {
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Cambiar a la pestaña Field
        setTimeout(() => {
            const fieldTab = document.getElementById('field-tab');
            if (fieldTab) {
                fieldTab.click();
            }
        }, 500);
        
        console.log('✅ Modal abierto y cambiado a pestaña Field');
    } else {
        console.error('❌ Modal no encontrado');
    }
}

// Verificación inicial
setTimeout(() => {
    console.log('🔍 === VERIFICACIÓN INICIAL ===');
    checkModuleAvailability();
}, 1000);

// Verificación después de 3 segundos (dar tiempo a que se carguen los módulos)
setTimeout(() => {
    console.log('🔍 === VERIFICACIÓN TARDÍA ===');
    const checks = checkModuleAvailability();
    
    // Si el select está vacío, intentar poblar manualmente
    const fieldStyleSelect = document.getElementById('field-style-select');
    if (fieldStyleSelect && fieldStyleSelect.options.length === 0) {
        console.log('⚠️ Select vacío, intentando integración manual...');
        forceIntegration();
    }
}, 3000);

// Exponer funciones globalmente para debug manual
window.debugFieldStyles = {
    check: checkModuleAvailability,
    populate: forcePopulateSelect,
    integrate: forceIntegration,
    openModal: openConfigModal
};

console.log('🛠️ DEBUG: Funciones disponibles en window.debugFieldStyles:');
console.log('  - check(): Verificar estado del sistema');
console.log('  - populate(): Poblar select manualmente');
console.log('  - integrate(): Forzar integración completa');
console.log('  - openModal(): Abrir modal y cambiar a pestaña Field');
